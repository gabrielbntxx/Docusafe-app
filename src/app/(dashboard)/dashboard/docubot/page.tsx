"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot,
  Send,
  User,
  FileSearch,
  FolderOpen,
  FileText,
  Receipt,
  Sparkles,
  Paperclip,
  Upload,
  Clock,
  BarChart2,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
};

const STORAGE_KEY = "docubot-conversation";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-blue-400 dark:bg-blue-500"
          style={{
            animation: "bounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function DocuBotPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [expiringCount, setExpiringCount] = useState(0);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const welcomeMessage: Message = useMemo(() => ({
    id: "welcome",
    role: "assistant",
    content: t("docubotWelcome"),
    timestamp: new Date(),
  }), [t]);

  // All 6 quick actions (+ expiring dynamically prepended if relevant)
  const quickActions = useMemo(() => {
    const base = [
      { label: t("docubotRecentDocs"),   icon: FileSearch,        query: t("docubotQueryRecentDocs") },
      { label: t("docubotMyFolders"),    icon: FolderOpen,        query: t("docubotQueryFolders") },
      { label: t("docubotSearchInvoice"),icon: Receipt,           query: t("docubotQueryInvoices") },
      { label: t("docubotSummarizeDoc"), icon: FileText,          query: t("docubotQuerySummarize") },
      { label: t("docubotMyStats"),      icon: BarChart2,         query: t("docubotQueryStats") },
      { label: t("docubotOrganize"),     icon: SlidersHorizontal, query: t("docubotQueryOrganize") },
    ];
    if (expiringCount > 0) {
      base.unshift({ label: t("docubotExpiringAction"), icon: Clock, query: t("docubotQueryExpiring") });
    }
    // Show up to 6 in a 2-col grid (3 rows)
    return base.slice(0, 6);
  }, [t, expiringCount]);

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);

  // ── Load saved conversation from localStorage on mount ───────────────────
  useEffect(() => {
    fetch("/api/chat/context")
      .then((r) => r.json())
      .then((data) => setExpiringCount(data.expiringCount || 0))
      .catch(() => {});

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Message[] = JSON.parse(saved);
        const restored = parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
        if (restored.length > 1) {
          setMessages(restored);
          return;
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save conversation to localStorage whenever messages change ───────────
  useEffect(() => {
    try {
      // Don't persist loading placeholders
      const toSave = messages.filter((m) => !m.isLoading);
      if (toSave.length > 1) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }
    } catch {}
  }, [messages]);

  // Keep welcome message text in sync with language
  useEffect(() => {
    setMessages(prev => prev.map(m =>
      m.id === "welcome" ? { ...m, content: t("docubotWelcome") } : m
    ));
  }, [t]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Reset conversation ───────────────────────────────────────────────────
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([{ ...welcomeMessage, timestamp: new Date() }]);
    setInput("");
    inputRef.current?.focus();
  };

  // ── Streaming reader helper ──────────────────────────────────────────────
  async function readStream(response: Response, loadingId: string) {
    if (!response.body) throw new Error("No body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";
    let firstChunk = true;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += decoder.decode(value, { stream: true });
      if (firstChunk) { firstChunk = false; setIsLoading(false); }
      setMessages((prev) =>
        prev.map((m) => m.id === loadingId ? { ...m, content: fullText, isLoading: false } : m)
      );
    }
    if (!fullText) {
      setMessages((prev) =>
        prev.map((m) => m.id === loadingId ? { ...m, content: t("docubotError"), isLoading: false } : m)
      );
    }
  }

  // ── Send text message ────────────────────────────────────────────────────
  const handleSend = async (directMessage?: string) => {
    const messageToSend = directMessage || input.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: "assistant", content: "", timestamp: new Date(), isLoading: true },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.filter((m) => m.id !== "welcome" && !m.isLoading).slice(-10),
        }),
      });
      if (!response.ok || !response.body) throw new Error("API error");
      await readStream(response, loadingId);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, content: t("docubotErrorGeneric"), isLoading: false } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFileUpload = async (file: File) => {
    if (isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `📎 ${file.name}`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: "assistant", content: "", timestamp: new Date(), isLoading: true },
    ]);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/chat", { method: "POST", body: formData });
      if (!response.ok || !response.body) throw new Error("API error");
      await readStream(response, loadingId);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, content: t("docubotErrorGeneric"), isLoading: false } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Drag & Drop ──────────────────────────────────────────────────────────
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (dragCounter.current === 1) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasHistory = messages.some((m) => m.id !== "welcome");

  return (
    <div
      className="flex flex-col -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 h-[calc(100dvh-15.5rem)] lg:h-[calc(100vh-8rem)]"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-2xl border-2 border-dashed border-blue-400 bg-blue-500/10 backdrop-blur-sm">
          <div className="text-center">
            <Upload className="mx-auto mb-2 h-10 w-10 text-blue-500" />
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              {t("docubotDropHint")}
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          e.target.value = "";
        }}
      />

      {/* ── Chat header bar ── */}
      <div className="shrink-0 flex items-center justify-between border-b border-neutral-100 bg-white/80 px-4 py-2 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <Bot className="h-3.5 w-3.5 text-blue-500" />
          DocuBot
        </div>
        {hasHistory && (
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-700 active:scale-95 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200"
          >
            <RotateCcw className="h-3 w-3" />
            {t("docubotNewConversation")}
          </button>
        )}
      </div>

      {/* ── Messages (scrollable) ── */}
      <div ref={messagesRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-2 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gradient-to-br from-blue-500 to-violet-600 text-white"
                }`}
              >
                {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "rounded-tr-sm bg-blue-500 text-white shadow-sm shadow-blue-500/20"
                    : "rounded-tl-sm bg-white text-neutral-800 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
                }`}
              >
                {message.isLoading ? <TypingDots /> : (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {/* Quick actions — shown only when no history yet */}
          {!hasHistory && (
            <div className="mt-2">
              <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                <Sparkles className="h-3 w-3" />
                {t("docubotQuickActions")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.query)}
                    className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 text-left text-xs font-medium text-neutral-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  >
                    <action.icon className="h-3.5 w-3.5 shrink-0 text-blue-500 dark:text-blue-400" />
                    <span className="leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 border-t border-neutral-200/80 bg-white/95 px-3 py-3 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          {/* Paperclip */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 text-neutral-500 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
            title="Analyser un fichier"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          <div className="flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 dark:border-neutral-700 dark:bg-neutral-800/60 dark:focus-within:border-blue-500">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={t("docubotPlaceholder")}
              disabled={isLoading}
              className="block w-full resize-none bg-transparent px-4 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-60 dark:text-white dark:placeholder:text-neutral-500"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
