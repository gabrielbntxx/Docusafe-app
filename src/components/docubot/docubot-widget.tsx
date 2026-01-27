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
  Receipt,
  ChevronDown,
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
  content: "Salut ! Je suis DocuBot, ton assistant. Je peux t'aider à :\n\n• Chercher des documents\n• Analyser leur contenu\n• Les déplacer dans des dossiers\n• Répondre à tes questions\n\nQue puis-je faire pour toi ?",
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
  const [isAnimating, setIsAnimating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens (with delay for animation)
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  // Handle open animation
  const handleOpen = () => {
    setIsAnimating(true);
    setIsOpen(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Handle close
  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsMinimized(false);
      setIsAnimating(false);
    }, 200);
  };

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

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 lg:bottom-6 lg:right-6 lg:h-16 lg:w-16"
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
      <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 py-2 pl-4 pr-2 text-white shadow-lg shadow-blue-500/30 lg:bottom-6 lg:right-6">
        <Bot className="h-5 w-5" />
        <span className="text-sm font-medium">DocuBot</span>
        <button
          onClick={() => setIsMinimized(false)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 active:scale-95"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
        <button
          onClick={handleClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30 active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Full chat window
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-white dark:bg-neutral-900 lg:inset-auto lg:bottom-6 lg:right-6 lg:h-[600px] lg:w-[380px] lg:rounded-2xl lg:shadow-2xl lg:shadow-black/20 transition-all duration-300 ${
        isAnimating ? "opacity-0 scale-95 lg:translate-y-4" : "opacity-100 scale-100 lg:translate-y-0"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-white safe-area-top lg:rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">DocuBot</h3>
            <p className="text-xs text-white/80">Assistant intelligent</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Minimize - desktop only */}
          <button
            onClick={() => setIsMinimized(true)}
            className="hidden lg:flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/20 active:scale-95"
          >
            <ChevronDown className="h-5 w-5 lg:hidden" />
            <X className="h-5 w-5 hidden lg:block" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
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
                  : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
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
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
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
          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Actions rapides
            </p>
            {/* Horizontal scroll on mobile, wrap on desktop */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:flex-wrap lg:overflow-visible scrollbar-hide">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.query)}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input - with safe area for mobile */}
      <div className="border-t border-neutral-200 p-4 pb-6 dark:border-neutral-700 safe-area-bottom bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose-moi une question..."
            disabled={isLoading}
            className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400 dark:focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] text-neutral-400 dark:text-neutral-500">
          DocuBot peut faire des erreurs. Vérifie les informations importantes.
        </p>
      </div>
    </div>
  );
}
