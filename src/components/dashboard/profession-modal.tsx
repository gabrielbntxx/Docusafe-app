"use client";

import { useState, useMemo } from "react";
import { Search, ChevronRight, Check, Sparkles, X } from "lucide-react";
import { PROFESSION_CATEGORIES } from "@/lib/professions";

type ProfessionModalProps = {
  isOpen: boolean;
  onClose: (saved: boolean) => void;
};

export function ProfessionModal({ isOpen, onClose }: ProfessionModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [customProfession, setCustomProfession] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const finalProfession = showCustom ? customProfession.trim() : selected;

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return PROFESSION_CATEGORIES;
    const q = search.toLowerCase();
    return PROFESSION_CATEGORIES.map((cat) => ({
      ...cat,
      professions: cat.professions.filter((p) => p.toLowerCase().includes(q)),
    })).filter((cat) => cat.professions.length > 0);
  }, [search]);

  const handleSelect = (profession: string) => {
    setSelected(profession);
    setShowCustom(false);
    setCustomProfession("");
  };

  const handleSave = async () => {
    if (!finalProfession) return;
    setSaving(true);
    try {
      await fetch("/api/profile/profession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession: finalProfession }),
      });
      onClose(true);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 shadow-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                Personnalisation IA
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Quel est votre métier ?
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              L'IA adaptera le tri et les noms de dossiers à votre activité.
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/20 transition flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un métier..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-violet-300 dark:focus:border-violet-700 focus:outline-none text-neutral-900 dark:text-white placeholder-neutral-400 transition"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-2">
          {filteredCategories.map((cat) => {
            const isExpanded = expandedCategory === cat.key || !!search.trim();
            const visibleProfessions = isExpanded ? cat.professions : cat.professions.slice(0, 3);

            return (
              <div key={cat.key} className="mb-2">
                <button
                  onClick={() => setExpandedCategory(isExpanded && !search.trim() ? null : cat.key)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left"
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide flex-1">
                    {cat.label}
                  </span>
                  {!search.trim() && (
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-neutral-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                  )}
                </button>

                <div className="space-y-0.5">
                  {visibleProfessions.map((profession) => {
                    const isSelected = selected === profession && !showCustom;
                    return (
                      <button
                        key={profession}
                        onClick={() => handleSelect(profession)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                          isSelected
                            ? "bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 font-medium"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="flex-1">{profession}</span>
                        {isSelected && <Check className="h-4 w-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />}
                      </button>
                    );
                  })}

                  {!search.trim() && !isExpanded && cat.professions.length > 3 && (
                    <button
                      onClick={() => setExpandedCategory(cat.key)}
                      className="w-full px-3 py-1.5 text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 text-left transition"
                    >
                      + {cat.professions.length - 3} autres...
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Custom profession */}
          <div className="mb-2 mt-1">
            <button
              onClick={() => {
                setShowCustom(true);
                setSelected("");
                setExpandedCategory(null);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                showCustom
                  ? "bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5"
              }`}
            >
              <span>✏️</span>
              <span>Autre métier (saisir librement)</span>
            </button>

            {showCustom && (
              <div className="mt-2 px-1">
                <input
                  autoFocus
                  type="text"
                  value={customProfession}
                  onChange={(e) => setCustomProfession(e.target.value)}
                  placeholder="Ex: Architecte naval, Podologue..."
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-neutral-100 dark:bg-neutral-800 border border-violet-300 dark:border-violet-700 focus:outline-none focus:border-violet-400 dark:focus:border-violet-500 text-neutral-900 dark:text-white placeholder-neutral-400 transition"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex items-center gap-3">
          <button
            onClick={() => onClose(false)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 transition"
          >
            Plus tard
          </button>
          <button
            onClick={handleSave}
            disabled={!finalProfession || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? "Enregistrement..." : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
