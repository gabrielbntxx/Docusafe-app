"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Bot,
  Send,
  User,
  Loader2,
  FileSearch,
  FolderOpen,
  FileText,
  Receipt,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
};

export default function DocuBotPage() {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Update welcome message when language changes
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

  const handleQuickAction = (query: string) => {
    handleSend(query);
  };

  return (
    <div className="pb-20 lg:pb-0">
      {/* Messages */}
      <div className="space-y-4 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
              }`}
            >
              {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-neutral-800 shadow-sm dark:bg-neutral-800 dark:text-white"
              }`}
            >
              {message.isLoading ? (
                <div className="flex items-center gap-2 py-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">...</span>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {/* Quick actions */}
        {messages.length <= 2 && (
          <div className="pt-4">
            <p className="text-xs text-neutral-500 mb-2">{t("docubotQuickActions")}</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.query)}
                  className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input fixé en bas */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900 lg:bottom-0 lg:left-72">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={t("docubotPlaceholder")}
            disabled={isLoading}
            className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
