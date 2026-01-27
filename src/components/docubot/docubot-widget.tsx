"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  FileSearch,
  FolderOpen,
  Minimize2,
  FileText,
  RefreshCw,
  Search,
  Receipt,
} from "lucide-react";

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
  content: "Salut ! Je suis DocuBot, ton assistant intelligent. Je peux t'aider \u00e0 :\n\n\u2022 Chercher des documents\n\u2022 Analyser leur contenu\n\u2022 Les d\u00e9placer dans des dossiers\n\u2022 R\u00e9pondre \u00e0 tes questions\n\nQue puis-je faire pour toi ?",
  timestamp: new Date(),
};

const QUICK_ACTIONS = [
  { label: "Documents récents", icon: FileSearch, query: "Montre-moi mes documents récents" },
  { label: "Mes dossiers", icon: FolderOpen, query: "Liste mes dossiers" },
  { label: "Chercher facture", icon: Receipt, query: "Cherche mes factures" },
  { label: "Résumer un doc", icon: FileText, query: "Résume mon dernier document" },
];

export function DocuBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

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
                content: data.response || "D\u00e9sol\u00e9, je n'ai pas pu traiter ta demande.",
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
                content: "Oups, une erreur s'est produite. R\u00e9essaie !",
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

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-violet-500/40 active:scale-95 lg:bottom-6 lg:right-6 lg:h-16 lg:w-16"
      >
        <MessageCircle className="h-6 w-6 lg:h-7 lg:w-7" />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold shadow-md">
          <Sparkles className="h-3 w-3" />
        </span>
      </button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 py-2 pl-4 pr-2 text-white shadow-lg shadow-violet-500/30 lg:bottom-6 lg:right-6">
        <Bot className="h-5 w-5" />
        <span className="text-sm font-medium">DocuBot</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <button
          onClick={() => {
            setIsOpen(false);
            setIsMinimized(false);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Full chat window
  return (
    <div className="fixed bottom-0 right-0 z-50 flex h-[100dvh] w-full flex-col bg-white dark:bg-neutral-900 lg:bottom-6 lg:right-6 lg:h-[600px] lg:w-[380px] lg:rounded-2xl lg:shadow-2xl lg:shadow-black/20">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 text-white lg:rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">DocuBot</h3>
            <p className="text-xs text-white/80">Assistant intelligent</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
              }`}
            >
              {message.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>

            {/* Message bubble */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
              }`}
            >
              {message.isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">R\u00e9flexion en cours...</span>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {/* Quick actions (only if few messages) */}
        {messages.length <= 2 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Actions rapides
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.query)}
                  className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-violet-600 dark:hover:bg-violet-900/30 dark:hover:text-violet-300"
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose-moi une question..."
            disabled={isLoading}
            className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400 dark:focus:border-violet-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-neutral-400 dark:text-neutral-500">
          DocuBot peut faire des erreurs. V\u00e9rifie les informations importantes.
        </p>
      </div>
    </div>
  );
}
