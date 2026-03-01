"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, FileText, Folder, ArrowLeft, Users } from "lucide-react";

type TeamMember = {
  id: string;
  name: string | null;
  email: string;
  memberColor: string | null;
  lastMessage?: { content: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
};

type Message = {
  id: string;
  content: string;
  type: string;
  metadata?: string | null;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    memberColor: string | null;
  };
};

function Avatar({
  name,
  color,
  size = "md",
}: {
  name: string | null;
  color: string | null;
  size?: "sm" | "md";
}) {
  const letter = (name || "?")[0].toUpperCase();
  const bg = color || "#6366f1";
  const dim = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white ${dim}`}
      style={{ backgroundColor: bg }}
    >
      {letter}
    </div>
  );
}

function getTimeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  if (mins < 1) return "maintenant";
  if (mins < 60) return `${mins}min`;
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(diffMs / 86400000)}j`;
}

function ActivityIcon({ action }: { action: string }) {
  if (action === "upload") return <FileText className="h-3.5 w-3.5 text-blue-500" />;
  if (action === "folder_created") return <Folder className="h-3.5 w-3.5 text-violet-500" />;
  return null;
}

export function MessagingDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"team" | "dm">("team");
  const [activeDm, setActiveDm] = useState<string | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [channelMessages, setChannelMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [dmMessages, setDmMessages] = useState<Message[]>([]);
  const [teamOwnerId, setTeamOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [channelInput, setChannelInput] = useState("");
  const [dmInput, setDmInput] = useState("");
  const [sending, setSending] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const channelBottomRef = useRef<HTMLDivElement>(null);
  const dmBottomRef = useRef<HTMLDivElement>(null);

  const userId = session?.user?.id;

  // Poll unread count every 15s
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15_000);
    return () => clearInterval(interval);
  }, [userId, fetchUnreadCount]);

  // Fetch full channel data
  const fetchChannel = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setChannelMessages(data.channelMessages || []);
        setMembers(data.members || []);
        setTeamOwnerId(data.teamOwnerId || null);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  // Fetch DM messages
  const fetchDm = useCallback(async (peerId: string) => {
    try {
      const res = await fetch(`/api/messages/dm/${peerId}`);
      if (res.ok) {
        const data = await res.json();
        setDmMessages(data.messages || []);
      }
    } catch {}
  }, []);

  // Poll when open
  useEffect(() => {
    if (!isOpen || !userId) return;
    fetchChannel();
    const interval = setInterval(fetchChannel, 5_000);
    return () => clearInterval(interval);
  }, [isOpen, userId, fetchChannel]);

  useEffect(() => {
    if (!isOpen || !activeDm) return;
    fetchDm(activeDm);
    const interval = setInterval(() => fetchDm(activeDm), 5_000);
    return () => clearInterval(interval);
  }, [isOpen, activeDm, fetchDm]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    channelBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages]);

  useEffect(() => {
    dmBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dmMessages]);

  // Mark as read when opening
  useEffect(() => {
    if (!isOpen || !teamOwnerId) return;
    const markRead = (receiverId?: string) =>
      fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamOwnerId, receiverId: receiverId ?? null }),
      }).then(() => fetchUnreadCount());
    if (tab === "team") markRead();
    else if (tab === "dm" && activeDm) markRead(activeDm);
  }, [isOpen, tab, activeDm, teamOwnerId, fetchUnreadCount]);

  // Click outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  const sendChannel = async () => {
    if (!channelInput.trim() || sending) return;
    setSending(true);
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: channelInput }),
      });
      setChannelInput("");
      await fetchChannel();
    } finally { setSending(false); }
  };

  const sendDm = async () => {
    if (!dmInput.trim() || !activeDm || sending) return;
    setSending(true);
    try {
      await fetch(`/api/messages/dm/${activeDm}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: dmInput }),
      });
      setDmInput("");
      await fetchDm(activeDm);
    } finally { setSending(false); }
  };

  const activeMember = members.find((m) => m.id === activeDm);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) { setTab("team"); setActiveDm(null); }
        }}
        className="relative rounded-xl p-2 transition-all hover:bg-neutral-100 active:scale-95 dark:hover:bg-neutral-700"
        title="Messages"
      >
        <MessageSquare className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[360px] rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-700 dark:bg-neutral-900 z-50 overflow-hidden flex flex-col" style={{ maxHeight: "520px" }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            {tab === "dm" && activeDm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveDm(null)}
                  className="rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <ArrowLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                </button>
                {activeMember && (
                  <div className="flex items-center gap-2">
                    <Avatar name={activeMember.name} color={activeMember.memberColor} size="sm" />
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {activeMember.name || activeMember.email}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <h3 className="font-semibold text-neutral-900 dark:text-white">Messages</h3>
            )}
          </div>

          {/* Tabs (hidden when DM thread is active) */}
          {!(tab === "dm" && activeDm) && (
            <div className="flex border-b border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => setTab("team")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  tab === "team"
                    ? "border-b-2 border-violet-500 text-violet-600 dark:text-violet-400"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Canal équipe
              </button>
              <button
                onClick={() => setTab("dm")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  tab === "dm"
                    ? "border-b-2 border-violet-500 text-violet-600 dark:text-violet-400"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Messages privés
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-neutral-200 border-t-violet-500 dark:border-neutral-700" />
              </div>
            ) : tab === "team" ? (
              /* ── Canal équipe ── */
              <>
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0" style={{ maxHeight: "300px" }}>
                  {channelMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <Users className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        Aucun message pour l'instant
                      </p>
                    </div>
                  ) : (
                    channelMessages.map((msg) => {
                      const isMine = msg.senderId === userId;
                      const metadata = msg.metadata ? JSON.parse(msg.metadata) : null;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                        >
                          {!isMine && (
                            <Avatar name={msg.sender.name} color={msg.sender.memberColor} size="sm" />
                          )}
                          <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                            {!isMine && (
                              <span className="text-[10px] text-neutral-400 px-1">
                                {msg.sender.name || msg.sender.email}
                              </span>
                            )}
                            <div
                              className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                                msg.type === "activity"
                                  ? "flex items-center gap-1.5 bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 rounded-xl"
                                  : isMine
                                  ? "bg-violet-600 text-white rounded-tr-sm"
                                  : "bg-neutral-100 text-neutral-800 rounded-tl-sm dark:bg-neutral-800 dark:text-neutral-200"
                              }`}
                            >
                              {msg.type === "activity" && metadata && (
                                <ActivityIcon action={metadata.action} />
                              )}
                              {msg.type === "activity" ? (
                                <span>
                                  <span className="font-medium">
                                    {msg.sender.name || msg.sender.email.split("@")[0]}
                                  </span>{" "}
                                  {msg.content}
                                </span>
                              ) : (
                                msg.content
                              )}
                            </div>
                            <span className="text-[10px] text-neutral-400 px-1">
                              {getTimeAgo(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={channelBottomRef} />
                </div>

                {/* Channel input */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 px-3 py-2.5 flex items-center gap-2">
                  <input
                    value={channelInput}
                    onChange={(e) => setChannelInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChannel()}
                    placeholder="Message à l'équipe…"
                    className="flex-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400"
                  />
                  <button
                    onClick={sendChannel}
                    disabled={!channelInput.trim() || sending}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-40 hover:bg-violet-700 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            ) : activeDm ? (
              /* ── DM thread ── */
              <>
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0" style={{ maxHeight: "300px" }}>
                  {dmMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <MessageSquare className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        Commencez la conversation
                      </p>
                    </div>
                  ) : (
                    dmMessages.map((msg) => {
                      const isMine = msg.senderId === userId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                        >
                          {!isMine && (
                            <Avatar name={msg.sender.name} color={msg.sender.memberColor} size="sm" />
                          )}
                          <div className={`max-w-[75%] flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}>
                            <div
                              className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                                isMine
                                  ? "bg-violet-600 text-white rounded-br-sm"
                                  : "bg-neutral-100 text-neutral-800 rounded-bl-sm dark:bg-neutral-800 dark:text-neutral-200"
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-neutral-400 px-1">
                              {getTimeAgo(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={dmBottomRef} />
                </div>

                {/* DM input */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 px-3 py-2.5 flex items-center gap-2">
                  <input
                    value={dmInput}
                    onChange={(e) => setDmInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendDm()}
                    placeholder={`Message à ${activeMember?.name || "…"}…`}
                    className="flex-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-xs text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400"
                  />
                  <button
                    onClick={sendDm}
                    disabled={!dmInput.trim() || sending}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white disabled:opacity-40 hover:bg-violet-700 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            ) : (
              /* ── DM list ── */
              <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
                {members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Users className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                      Aucun collaborateur
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setActiveDm(member.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <div className="relative">
                          <Avatar name={member.name} color={member.memberColor} />
                          {member.unreadCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white">
                              {member.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {member.name || member.email}
                          </p>
                          {member.lastMessage ? (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                              {member.lastMessage.senderId === userId ? "Vous : " : ""}
                              {member.lastMessage.content}
                            </p>
                          ) : (
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                              Pas encore de message
                            </p>
                          )}
                        </div>
                        {member.lastMessage && (
                          <span className="flex-shrink-0 text-[10px] text-neutral-400">
                            {getTimeAgo(member.lastMessage.createdAt)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
