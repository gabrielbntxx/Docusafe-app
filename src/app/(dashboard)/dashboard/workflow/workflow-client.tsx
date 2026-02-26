"use client";

import { useState, useTransition } from "react";
import {
  GitBranch,
  Receipt,
  CalendarCheck,
  FileSignature,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  X,
  Search,
  AlertCircle,
} from "lucide-react";

// ============================================================
// Types
// ============================================================
type Step = { order: number; title: string; assigneeId: string };

type StepStatus = {
  order: number;
  assigneeId: string;
  title: string;
  status: "pending" | "approved" | "rejected";
  comment: string | null;
  respondedAt: string | null;
};

type WorkflowTemplate = {
  id: string;
  name: string;
  type: string;
  steps: Step[];
  deadlineDays: number;
  reminderDays: number;
  createdAt: string;
};

type WorkflowRun = {
  id: string;
  templateId: string;
  templateName: string;
  templateType: string;
  status: string;
  currentStep: number;
  stepStatuses: StepStatus[];
  deadline: string | null;
  documentId: string | null;
  documentName: string | null;
  folderId: string | null;
  folderName: string | null;
  createdAt: string;
};

type TeamMember = { id: string; name: string; email: string; color: string };
type DocItem = { id: string; name: string; type: string };
type FolderItem = { id: string; name: string; icon: string | null; color: string | null };

interface Props {
  currentUserId: string;
  isOwner: boolean;
  templates: WorkflowTemplate[];
  runs: WorkflowRun[];
  teamMembers: TeamMember[];
  documents: DocItem[];
  folders: FolderItem[];
}

// ============================================================
// Predefined template configs
// ============================================================
const TEMPLATE_DEFS = [
  {
    type: "INVOICE_VALIDATION",
    label: "Validation de factures",
    description: "Soumettez vos factures à des approbateurs avant paiement.",
    icon: Receipt,
    color: "blue",
  },
  {
    type: "LEAVE_REQUEST",
    label: "Validation de congés",
    description: "Demande de congé transmise à votre manager ou RH.",
    icon: CalendarCheck,
    color: "green",
  },
  {
    type: "CONTRACT_APPROVAL",
    label: "Approbation de contrats",
    description: "Circuit de relecture et validation avant signature.",
    icon: FileSignature,
    color: "purple",
  },
  {
    type: "DOCUMENT_REVIEW",
    label: "Revue de documents",
    description: "Envoyez un document en revue avec délai de réponse.",
    icon: Eye,
    color: "orange",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  orange: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
};

const iconBgMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-500 dark:bg-blue-500/10",
  green: "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10",
  purple: "bg-purple-50 text-purple-500 dark:bg-purple-500/10",
  orange: "bg-orange-50 text-orange-500 dark:bg-orange-500/10",
};

function getTemplateDef(type: string) {
  return TEMPLATE_DEFS.find((d) => d.type === type) ?? TEMPLATE_DEFS[0];
}

// ============================================================
// Helper components
// ============================================================
function Avatar({ member, size = "sm" }: { member: TeamMember; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm";
  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <span
      className={`${sizeClass} inline-flex items-center justify-center rounded-full font-medium text-white ring-2 ring-white dark:ring-neutral-900`}
      style={{ backgroundColor: member.color }}
      title={member.name}
    >
      {initials}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    in_progress: { label: "En cours", cls: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
    completed: { label: "Terminé", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
    rejected: { label: "Rejeté", cls: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
    cancelled: { label: "Annulé", cls: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400" },
  };
  const s = map[status] ?? map["in_progress"];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ============================================================
// Configure Modal
// ============================================================
function ConfigureModal({
  open,
  onClose,
  templateType,
  existing,
  teamMembers,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  templateType: string;
  existing: WorkflowTemplate | null;
  teamMembers: TeamMember[];
  onSaved: (t: WorkflowTemplate) => void;
}) {
  const def = getTemplateDef(templateType);
  const [name, setName] = useState(existing?.name ?? def.label);
  const [steps, setSteps] = useState<Step[]>(
    existing?.steps.length ? existing.steps : [{ order: 1, title: "Validation", assigneeId: teamMembers[0]?.id ?? "" }]
  );
  const [deadlineDays, setDeadlineDays] = useState(existing?.deadlineDays ?? 7);
  const [reminderDays, setReminderDays] = useState(existing?.reminderDays ?? 2);
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState("");

  if (!open) return null;

  const addStep = () => {
    if (steps.length >= 5) return;
    setSteps([...steps, { order: steps.length + 1, title: "Validation", assigneeId: teamMembers[0]?.id ?? "" }]);
  };

  const removeStep = (idx: number) => {
    const updated = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(updated);
  };

  const updateStep = (idx: number, field: keyof Step, value: string | number) => {
    setSteps(steps.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const handleSave = () => {
    if (!name.trim()) { setError("Le nom est requis"); return; }
    if (steps.some((s) => !s.assigneeId)) { setError("Chaque étape doit avoir un assigné"); return; }
    setError("");
    startSaving(async () => {
      const body = { name, type: templateType, steps, deadlineDays, reminderDays };
      const url = existing ? `/api/workflows/${existing.id}` : "/api/workflows";
      const method = existing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { setError("Erreur lors de la sauvegarde"); return; }
      const saved = await res.json();
      onSaved(saved);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className={`rounded-xl p-2 ${iconBgMap[def.color]}`}>
              <def.icon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                {existing ? "Modifier" : "Configurer"} — {def.label}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Définissez les étapes d&apos;approbation</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Nom du workflow
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Étapes de validation
            </label>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-500">
                    {idx + 1}
                  </span>
                  <input
                    value={step.title}
                    onChange={(e) => updateStep(idx, "title", e.target.value)}
                    placeholder="Titre de l'étape"
                    className="flex-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 py-1.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={step.assigneeId}
                    onChange={(e) => updateStep(idx, "assigneeId", e.target.value)}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 py-1.5 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(idx)}
                      className="shrink-0 rounded-lg p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {steps.length < 5 && (
              <button
                onClick={addStep}
                className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter une étape
              </button>
            )}
          </div>

          {/* Deadline & Reminder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Délai de traitement
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={deadlineDays}
                  onChange={(e) => setDeadlineDays(Number(e.target.value))}
                  className="w-20 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-neutral-500">jours</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Rappel avant deadline
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={reminderDays}
                  onChange={(e) => setReminderDays(Number(e.target.value))}
                  className="w-20 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-neutral-500">jours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Launch Modal
// ============================================================
function LaunchModal({
  open,
  onClose,
  template,
  documents,
  folders,
  onLaunched,
}: {
  open: boolean;
  onClose: () => void;
  template: WorkflowTemplate | null;
  documents: DocItem[];
  folders: FolderItem[];
  onLaunched: (run: WorkflowRun) => void;
}) {
  const [tab, setTab] = useState<"document" | "folder">("document");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [launching, startLaunching] = useTransition();
  const [error, setError] = useState("");

  if (!open || !template) return null;

  const filteredDocs = documents.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLaunch = () => {
    if (!selectedId) { setError("Veuillez sélectionner un élément"); return; }
    setError("");
    startLaunching(async () => {
      const body =
        tab === "document" ? { documentId: selectedId } : { folderId: selectedId };
      const res = await fetch(`/api/workflows/${template.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { setError("Erreur lors du lancement"); return; }
      const run = await res.json();
      onLaunched(run);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              Lancer « {template.name} »
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Choisissez la cible du workflow</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Tab */}
          <div className="flex gap-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1">
            {(["document", "folder"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelectedId(null); setSearch(""); }}
                className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                {t === "document" ? "Document" : "Dossier"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "document" ? "Rechercher un document…" : "Rechercher un dossier…"}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 pl-9 pr-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* List */}
          <div className="max-h-52 overflow-y-auto space-y-1">
            {(tab === "document" ? filteredDocs : filteredFolders).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  selectedId === item.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-blue-300 dark:ring-blue-500/30"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${selectedId === item.id ? "bg-blue-500" : "bg-neutral-300 dark:bg-neutral-600"}`} />
                <span className="truncate font-medium">{item.name}</span>
              </button>
            ))}
            {(tab === "document" ? filteredDocs : filteredFolders).length === 0 && (
              <p className="py-4 text-center text-sm text-neutral-400">Aucun résultat</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Annuler
          </button>
          <button
            onClick={handleLaunch}
            disabled={!selectedId || launching}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {launching ? "Lancement…" : "Lancer le workflow"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Respond Modal (approve / reject)
// ============================================================
function RespondModal({
  open,
  onClose,
  run,
  action,
  onResponded,
}: {
  open: boolean;
  onClose: () => void;
  run: WorkflowRun | null;
  action: "approve" | "reject";
  onResponded: (updated: WorkflowRun) => void;
}) {
  const [comment, setComment] = useState("");
  const [submitting, startSubmitting] = useTransition();
  const [error, setError] = useState("");

  if (!open || !run) return null;

  const handleSubmit = () => {
    startSubmitting(async () => {
      const res = await fetch(`/api/workflows/runs/${run.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment: comment || null }),
      });
      if (!res.ok) { setError("Erreur lors de la soumission"); return; }
      const updated = await res.json();
      onResponded(updated);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            {action === "approve" ? (
              <><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Approuver</>
            ) : (
              <><XCircle className="h-5 w-5 text-red-500" /> Rejeter</>
            )}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Flux : <span className="font-medium text-neutral-900 dark:text-white">{run.templateName}</span>
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Commentaire <span className="text-neutral-400">(optionnel)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Ajoutez un commentaire…"
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`rounded-xl px-5 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              action === "approve"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {submitting ? "Envoi…" : action === "approve" ? "Confirmer l'approbation" : "Confirmer le rejet"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main component
// ============================================================
export function WorkflowClient({
  currentUserId,
  isOwner,
  templates: initialTemplates,
  runs: initialRuns,
  teamMembers,
  documents,
  folders,
}: Props) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>(initialTemplates);
  const [runs, setRuns] = useState<WorkflowRun[]>(initialRuns);

  // Configure modal state
  const [configureOpen, setConfigureOpen] = useState(false);
  const [configureType, setConfigureType] = useState("INVOICE_VALIDATION");
  const [configureExisting, setConfigureExisting] = useState<WorkflowTemplate | null>(null);

  // Launch modal state
  const [launchOpen, setLaunchOpen] = useState(false);
  const [launchTemplate, setLaunchTemplate] = useState<WorkflowTemplate | null>(null);

  // Respond modal state
  const [respondOpen, setRespondOpen] = useState(false);
  const [respondRun, setRespondRun] = useState<WorkflowRun | null>(null);
  const [respondAction, setRespondAction] = useState<"approve" | "reject">("approve");

  const [deleting, startDeleting] = useTransition();

  const openConfigure = (type: string, existing: WorkflowTemplate | null = null) => {
    setConfigureType(type);
    setConfigureExisting(existing);
    setConfigureOpen(true);
  };

  const openLaunch = (template: WorkflowTemplate) => {
    setLaunchTemplate(template);
    setLaunchOpen(true);
  };

  const openRespond = (run: WorkflowRun, action: "approve" | "reject") => {
    setRespondRun(run);
    setRespondAction(action);
    setRespondOpen(true);
  };

  const handleSaved = (saved: WorkflowTemplate) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleLaunched = (run: WorkflowRun) => {
    setRuns((prev) => [run, ...prev]);
  };

  const handleResponded = (updated: WorkflowRun) => {
    setRuns((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
  };

  const handleDelete = (id: string) => {
    startDeleting(async () => {
      const res = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        setRuns((prev) => prev.filter((r) => r.templateId !== id));
      }
    });
  };

  const handleCancelRun = (runId: string) => {
    startDeleting(async () => {
      const res = await fetch(`/api/workflows/runs/${runId}`, { method: "DELETE" });
      if (res.ok) {
        setRuns((prev) => prev.map((r) => r.id === runId ? { ...r, status: "cancelled" } : r));
      }
    });
  };

  const getMember = (id: string) => teamMembers.find((m) => m.id === id);

  const activeRuns = runs.filter((r) => r.status === "in_progress");
  const finishedRuns = runs.filter((r) => r.status !== "in_progress");

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-500/10 p-2.5">
                <GitBranch className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Workflow</h1>
              <span className="rounded-full bg-blue-100 dark:bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                Business
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Configurez et lancez des circuits de validation pour vos documents.
            </p>
          </div>
        </div>

        {/* ── Section A: Templates disponibles ─────────────────── */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Templates disponibles
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATE_DEFS.map((def) => (
              <div
                key={def.type}
                className="flex flex-col rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:shadow-md transition-shadow"
              >
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBgMap[def.color]}`}>
                  <def.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-neutral-900 dark:text-white">
                  {def.label}
                </h3>
                <p className="mb-4 flex-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {def.description}
                </p>
                <button
                  onClick={() => openConfigure(def.type)}
                  disabled={teamMembers.length === 0}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40"
                >
                  Configurer
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          {teamMembers.length === 0 && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Invitez des membres d&apos;équipe pour configurer des étapes de validation.
            </p>
          )}
        </section>

        {/* ── Section B: Mes workflows configurés ──────────────── */}
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Mes workflows configurés
            {templates.length > 0 && (
              <span className="ml-2 text-sm font-normal text-neutral-400">{templates.length}</span>
            )}
          </h2>

          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 py-12 text-center">
              <GitBranch className="mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-700" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Aucun workflow configuré
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
                Cliquez sur « Configurer » dans un template ci-dessus.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-neutral-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 hidden sm:table-cell">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 hidden md:table-cell">Étapes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 hidden md:table-cell">Délai</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tmpl, idx) => {
                    const def = getTemplateDef(tmpl.type);
                    return (
                      <tr
                        key={tmpl.id}
                        className={`${idx > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""} hover:bg-neutral-50 dark:hover:bg-neutral-800/50`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`rounded-lg p-1.5 ${iconBgMap[def.color]}`}>
                              <def.icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="font-medium text-neutral-900 dark:text-white truncate max-w-[140px]">
                              {tmpl.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[def.color]}`}>
                            {def.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center -space-x-1">
                            {tmpl.steps.map((s) => {
                              const m = getMember(s.assigneeId);
                              return m ? <Avatar key={s.order} member={m} /> : null;
                            })}
                            <span className="ml-2 text-xs text-neutral-500">{tmpl.steps.length} étape{tmpl.steps.length > 1 ? "s" : ""}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-neutral-600 dark:text-neutral-400 text-xs">
                            {tmpl.deadlineDays}j
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openLaunch(tmpl)}
                              className="flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                            >
                              <Play className="h-3 w-3" />
                              Lancer
                            </button>
                            {isOwner && (
                              <>
                                <button
                                  onClick={() => openConfigure(tmpl.type, tmpl)}
                                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300"
                                  title="Modifier"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(tmpl.id)}
                                  disabled={deleting}
                                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Section C: Flux en cours ──────────────────────────── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Flux en cours
            {activeRuns.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                {activeRuns.length}
              </span>
            )}
          </h2>

          {activeRuns.length === 0 && finishedRuns.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 py-12 text-center">
              <Clock className="mb-3 h-10 w-10 text-neutral-300 dark:text-neutral-700" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Aucun flux actif
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-600 mt-1">
                Lancez un workflow sur un document pour démarrer.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...activeRuns, ...finishedRuns].map((run) => {
                const def = getTemplateDef(run.templateType);
                const totalSteps = run.stepStatuses.length;
                const doneSteps = run.stepStatuses.filter((s) => s.status !== "pending").length;
                const progressPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
                const currentStepStatus = run.stepStatuses[run.currentStep];
                const isMyTurn =
                  run.status === "in_progress" &&
                  currentStepStatus?.assigneeId === currentUserId;

                const deadlinePassed =
                  run.deadline && new Date(run.deadline) < new Date();

                return (
                  <div
                    key={run.id}
                    className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 rounded-xl p-2 ${iconBgMap[def.color]}`}>
                          <def.icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {run.templateName}
                            </span>
                            <StatusBadge status={run.status} />
                            {deadlinePassed && run.status === "in_progress" && (
                              <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                <AlertCircle className="h-3 w-3" /> Deadline dépassée
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                            {run.documentName ?? run.folderName ?? "Sans cible"}
                            {run.deadline && (
                              <span className={`ml-2 ${deadlinePassed ? "text-red-500" : ""}`}>
                                · Deadline : {new Date(run.deadline).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {isMyTurn && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openRespond(run, "approve")}
                            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approuver
                          </button>
                          <button
                            onClick={() => openRespond(run, "reject")}
                            className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Rejeter
                          </button>
                        </div>
                      )}
                      {run.status === "in_progress" && isOwner && !isMyTurn && (
                        <button
                          onClick={() => handleCancelRun(run.id)}
                          disabled={deleting}
                          className="shrink-0 rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        >
                          Annuler
                        </button>
                      )}
                    </div>

                    {/* Progress bar + steps */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          Étape {Math.min(doneSteps + 1, totalSteps)}/{totalSteps}
                        </span>
                        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                          {progressPct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            run.status === "completed"
                              ? "bg-emerald-500"
                              : run.status === "rejected"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      {/* Step list */}
                      <div className="mt-3 flex items-center gap-1 flex-wrap">
                        {run.stepStatuses.map((s, i) => {
                          const member = getMember(s.assigneeId);
                          const isActive = run.status === "in_progress" && i === run.currentStep;
                          const tooltipText = [
                            member?.name,
                            s.respondedAt ? new Date(s.respondedAt).toLocaleDateString("fr-FR") : null,
                            s.comment ? `"${s.comment}"` : null,
                          ].filter(Boolean).join(" · ");
                          return (
                            <div
                              key={i}
                              title={tooltipText || undefined}
                              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs cursor-default ${
                                s.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                  : s.status === "rejected"
                                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                                  : isActive
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-500/30"
                                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
                              }`}
                            >
                              {s.status === "approved" ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : s.status === "rejected" ? (
                                <XCircle className="h-3 w-3" />
                              ) : isActive ? (
                                <Clock className="h-3 w-3" />
                              ) : null}
                              {member && <Avatar member={member} size="sm" />}
                              <span>{s.title}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Rejection comment — visible inline */}
                      {(() => {
                        const rejectedStep = run.stepStatuses.find((s) => s.status === "rejected" && s.comment);
                        if (!rejectedStep) return null;
                        const rejector = getMember(rejectedStep.assigneeId);
                        return (
                          <div className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-3 py-2.5">
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                            <div className="text-xs">
                              <span className="font-medium text-red-700 dark:text-red-400">
                                Rejeté par {rejector?.name ?? "un approbateur"}
                                {rejectedStep.respondedAt && (
                                  <span className="font-normal text-red-500 dark:text-red-500 ml-1">
                                    · {new Date(rejectedStep.respondedAt).toLocaleDateString("fr-FR")}
                                  </span>
                                )}
                              </span>
                              <p className="mt-0.5 text-red-600 dark:text-red-400 italic">
                                &ldquo;{rejectedStep.comment}&rdquo;
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <ConfigureModal
        open={configureOpen}
        onClose={() => setConfigureOpen(false)}
        templateType={configureType}
        existing={configureExisting}
        teamMembers={teamMembers}
        onSaved={handleSaved}
      />
      <LaunchModal
        open={launchOpen}
        onClose={() => setLaunchOpen(false)}
        template={launchTemplate}
        documents={documents}
        folders={folders}
        onLaunched={handleLaunched}
      />
      <RespondModal
        open={respondOpen}
        onClose={() => setRespondOpen(false)}
        run={respondRun}
        action={respondAction}
        onResponded={handleResponded}
      />
    </div>
  );
}
