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
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
};

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const welcomeMessage: Message = useMemo(() => ({
    id: "welcome",
    role: "assistant",
    content: t("docubotWelcome"),
    timestamp: new Date(),
  }), [t]);

  const quickActions = useMemo(() => [
    { label: t("docubotRecentDocs"), icon: FileSearch, query: t("docubotQueryRecentDocs") },
    { label: t("docubotMyFolders"), icon: FolderOpen, query: t("docubotQueryFolders") },
    { label: t("docubotSearchInvoice"), icon: Receipt, query: t("docubotQueryInvoices") },
    { label: t("docubotSummarizeDoc"), icon: FileText, query: t("docubotQuerySummarize") },
  ], [t]);

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);

  useEffect(() => {
    setMessages(prev => prev.map(m =>
      m.id === "welcome" ? { ...m, content: t("docubotWelcome") } : m
    ));
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
          history: messages.filter((m) => m.id !== "welcome").slice(-10),
        }),
      });

      const data = await response.json();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, content: data.response || t("docubotError"), isLoading: false }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? { ...m, content: t("docubotErrorGeneric"), isLoading: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    /* Extra bottom padding: bottom nav (64px) + input bar (~72px) + gap */
    <div className="pb-40 lg:pb-0">
      {/* Messages */}
      <div className="flex flex-col gap-4 px-4 pt-4">
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
              {message.role === "user"
                ? <User className="h-4 w-4" />
                : <Bot className="h-4 w-4" />
              }
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

        {/* Quick actions — shown only at the start */}
        {messages.length <= 2 && (
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar — fixed above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-neutral-200/80 bg-white/95 px-3 py-3 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/95 lg:bottom-0 lg:left-72">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
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
