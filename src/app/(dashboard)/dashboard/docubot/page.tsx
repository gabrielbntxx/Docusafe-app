"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Loader2,
  Sparkles,
  FileSearch,
  FolderOpen,
  FileText,
  Receipt,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
};

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Salut ! Je suis DocuBot, ton assistant personnel. Je peux t'aider à :\n\n• Chercher des documents\n• Analyser leur contenu\n• Les déplacer dans des dossiers\n• Répondre à tes questions\n\nQue puis-je faire pour toi ?",
  timestamp: new Date(),
};

const QUICK_ACTIONS = [
  { label: "Documents récents", icon: FileSearch, query: "Montre-moi mes documents récents" },
  { label: "Mes dossiers", icon: FolderOpen, query: "Liste mes dossiers" },
  { label: "Chercher facture", icon: Receipt, query: "Cherche mes factures" },
  { label: "Résumer un doc", icon: FileText, query: "Résume mon dernier document" },
];

export default function DocuBotPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Add loading message
    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      },
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

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                content: data.response || "Désolé, je n'ai pas pu traiter ta demande.",
                isLoading: false,
              }
            : m
        )
      );
    } catch (error) {
      console.error("DocuBot error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId
            ? {
                ...m,
                content: "Oups, une erreur s'est produite. Réessaie !",
                isLoading: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setInput(query);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearConversation = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  return (
    <div className="fixed inset-0 top-14 bottom-16 lg:top-0 lg:bottom-0 lg:left-72 flex flex-col bg-white dark:bg-neutral-900">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900 lg:px-6 lg:py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-neutral-900 dark:text-white">DocuBot</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Ton assistant intelligent</p>
          </div>
        </div>
        <button
          onClick={clearConversation}
          className="flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Effacer</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-neutral-50 p-4 dark:bg-neutral-950 lg:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20"
                }`}
              >
                {message.role === "user" ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>

              {/* Message bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-neutral-800 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
                }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Réflexion en cours...</span>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />

          {/* Quick actions (only if few messages) */}
          {messages.length <= 2 && (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Actions rapides
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.query)}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose-moi une question..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400 dark:focus:border-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
