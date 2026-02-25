"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  GraduationCap,
  Briefcase,
  Building2,
  FileText,
  FolderOpen,
  Archive,
  Sparkles,
  Zap,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  Shield,
  HardDrive,
  Bot,
  Cloud,
  FileOutput,
  Bell,
  Lock,
  Share2,
  Crown,
  Palette,
  LayoutDashboard,
  FilePlus,
  Loader2,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;
type Profile = "student" | "professional" | "business" | null;
type Volume = "low" | "medium" | "high" | null;
type Priority = "simplicity" | "power" | "collaboration" | null;

const PLANS = {
  STUDENT: {
    id: "STUDENT",
    name: "Étudiant",
    price: "5",
    period: "/mois",
    description: "Pour les 18-25 ans",
    badge: "Populaire",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/25",
    badgeBg: "bg-emerald-100 text-emerald-700",
    stripeLink: "https://buy.stripe.com/eVq9AUaaE2DB3HtbFrgYU00",
    features: [
      { icon: HardDrive, text: "100 Go de stockage" },
      { icon: Zap, text: "Analyses IA illimitées" },
      { icon: Cloud, text: "Import Drive & OneDrive" },
      { icon: FileOutput, text: "Convertisseur PDF" },
      { icon: Bot, text: "DocuBot (10 msg/jour)" },
      { icon: Shield, text: "Sécurité avancée" },
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    price: "19",
    period: "/mois",
    description: "Pour les utilisateurs avancés",
    badge: "Recommandé",
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/25",
    badgeBg: "bg-violet-100 text-violet-700",
    stripeLink: "https://buy.stripe.com/bJe28s5UoemjcdZ24RgYU06",
    features: [
      { icon: HardDrive, text: "200 Go (extensible)" },
      { icon: Zap, text: "IA illimitée" },
      { icon: Bot, text: "DocuBot illimité" },
      { icon: Cloud, text: "Import Drive & OneDrive" },
      { icon: Bell, text: "Notifications intelligentes" },
      { icon: Lock, text: "Partage sécurisé" },
      { icon: Share2, text: "Liens avec expiration" },
      { icon: FileOutput, text: "Convertisseur PDF" },
    ],
  },
  BUSINESS: {
    id: "BUSINESS",
    name: "Business",
    price: "89",
    period: "/mois",
    description: "Parfait pour les entreprises",
    badge: "Entreprise",
    gradient: "from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/25",
    badgeBg: "bg-amber-100 text-amber-700",
    stripeLink: "https://buy.stripe.com/4gMcN62Icfqn4LxcJvgYU07",
    features: [
      { icon: Users, text: "5 utilisateurs (+)" },
      { icon: Palette, text: "IA personnalisée" },
      { icon: HardDrive, text: "Stockage illimité" },
      { icon: Share2, text: "Liens personnalisés" },
      { icon: LayoutDashboard, text: "Dashboard partagé" },
      { icon: FilePlus, text: "Création documents" },
      { icon: Lock, text: "Validation équipe" },
      { icon: Crown, text: "Support prioritaire" },
    ],
  },
};

export function OnboardingFlow({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [profile, setProfile] = useState<Profile>(null);
  const [volume, setVolume] = useState<Volume>(null);
  const [priority, setPriority] = useState<Priority>(null);
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);

  const goNext = () => {
    setDirection("forward");
    setStep((s) => Math.min(s + 1, 5) as Step);
  };

  const goBack = () => {
    setDirection("backward");
    setStep((s) => Math.max(s - 1, 1) as Step);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, volume, priority }),
      });
      const data = await res.json();
      if (data.success) {
        setRecommendedPlan(data.recommendedPlan);
        goNext();
      }
    } catch {
      // Still go to result on error
      setRecommendedPlan("PRO");
      goNext();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = (planId: string) => {
    const plan = PLANS[planId as keyof typeof PLANS];
    if (plan?.stripeLink) {
      window.location.href = `${plan.stripeLink}?client_reference_id=${planId}&prefilled_email=${encodeURIComponent(userEmail)}`;
    }
  };

  const progress = ((step - 1) / 4) * 100;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress Bar */}
      {step < 5 && (
        <div className="mb-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Étape {step} sur 4
          </p>
        </div>
      )}

      {/* Step Content */}
      <div
        key={step}
        className="animate-in fade-in slide-in-from-right-4 duration-300"
        style={{
          animation:
            direction === "forward"
              ? "slideInRight 0.3s ease-out"
              : "slideInLeft 0.3s ease-out",
        }}
      >
        {step === 1 && <StepWelcome onNext={goNext} />}
        {step === 2 && (
          <StepProfile
            value={profile}
            onChange={(v) => {
              setProfile(v);
              setTimeout(goNext, 200);
            }}
            onBack={goBack}
          />
        )}
        {step === 3 && (
          <StepVolume
            value={volume}
            onChange={(v) => {
              setVolume(v);
              setTimeout(goNext, 200);
            }}
            onBack={goBack}
          />
        )}
        {step === 4 && (
          <StepPriority
            value={priority}
            onChange={(v) => {
              setPriority(v);
              setTimeout(handleComplete, 200);
            }}
            onBack={goBack}
            isLoading={isLoading}
          />
        )}
        {step === 5 && recommendedPlan && (
          <StepResult
            recommendedPlan={recommendedPlan}
            onSubscribe={handleSubscribe}
            showAllPlans={showAllPlans}
            onToggleAllPlans={() => setShowAllPlans(!showAllPlans)}
            userEmail={userEmail}
          />
        )}
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

/* ===== STEP 1: Welcome ===== */
function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-8">
      <div
        className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/25"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        <Sparkles className="w-10 h-10 text-white" />
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenue sur DocuSafe
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-sm mx-auto">
          Trouvons ensemble l&apos;offre qui vous correspond parfaitement.
        </p>
      </div>

      <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4" />
          <span>Sécurisé</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4" />
          <span>IA intégrée</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cloud className="w-4 h-4" />
          <span>Cloud</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
      >
        Commencer
        <ArrowRight className="w-5 h-5" />
      </button>

      <p className="text-xs text-gray-400">
        4 questions rapides - Moins d&apos;une minute
      </p>
    </div>
  );
}

/* ===== STEP 2: Profile ===== */
function StepProfile({
  value,
  onChange,
  onBack,
}: {
  value: Profile;
  onChange: (v: Profile) => void;
  onBack: () => void;
}) {
  const options = [
    {
      id: "student" as Profile,
      icon: GraduationCap,
      title: "Étudiant",
      description: "18-25 ans, études ou formation",
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      iconColor: "text-emerald-600",
    },
    {
      id: "professional" as Profile,
      icon: Briefcase,
      title: "Professionnel",
      description: "Indépendant ou salarié",
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
      bg: "bg-violet-50",
      border: "border-violet-200",
      iconColor: "text-violet-600",
    },
    {
      id: "business" as Profile,
      icon: Building2,
      title: "Entreprise",
      description: "Équipe ou organisation",
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
      bg: "bg-amber-50",
      border: "border-amber-200",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Vous êtes...</h2>
        <p className="text-gray-500">
          Cela nous aide à personnaliser votre expérience
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? `${option.border} ${option.bg} ${option.shadow} shadow-lg`
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isSelected
                    ? `bg-gradient-to-br ${option.gradient} text-white shadow-lg ${option.shadow}`
                    : `${option.bg} ${option.iconColor}`
                }`}
              >
                <option.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">{option.title}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===== STEP 3: Volume ===== */
function StepVolume({
  value,
  onChange,
  onBack,
}: {
  value: Volume;
  onChange: (v: Volume) => void;
  onBack: () => void;
}) {
  const options = [
    {
      id: "low" as Volume,
      icon: FileText,
      title: "Moins de 50",
      description: "Quelques documents par mois",
      emoji: "📄",
    },
    {
      id: "medium" as Volume,
      icon: FolderOpen,
      title: "50 à 200",
      description: "Usage régulier",
      emoji: "📁",
    },
    {
      id: "high" as Volume,
      icon: Archive,
      title: "Plus de 200",
      description: "Usage intensif",
      emoji: "🗄️",
    },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Combien de documents ?
        </h2>
        <p className="text-gray-500">
          Estimez votre volume mensuel de documents
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                isSelected
                  ? "border-blue-200 bg-blue-50 shadow-lg shadow-blue-500/10"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="text-3xl">{option.emoji}</div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">{option.title}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===== STEP 4: Priority ===== */
function StepPriority({
  value,
  onChange,
  onBack,
  isLoading,
}: {
  value: Priority;
  onChange: (v: Priority) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const options = [
    {
      id: "simplicity" as Priority,
      icon: Sparkles,
      title: "Simplicité & prix",
      description: "L'essentiel sans superflu",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      id: "power" as Priority,
      icon: Zap,
      title: "Puissance & IA",
      description: "Toutes les fonctionnalités avancées",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      id: "collaboration" as Priority,
      icon: Users,
      title: "Collaboration",
      description: "Travailler en équipe efficacement",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        disabled={isLoading}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Votre priorité ?
        </h2>
        <p className="text-gray-500">
          Qu&apos;est-ce qui compte le plus pour vous ?
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              disabled={isLoading}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 ${
                isSelected
                  ? "border-blue-200 bg-blue-50 shadow-lg shadow-blue-500/10"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center text-white shadow-lg`}
              >
                <option.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">{option.title}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              {isSelected &&
                (isLoading ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===== STEP 5: Result ===== */
function StepResult({
  recommendedPlan,
  onSubscribe,
  showAllPlans,
  onToggleAllPlans,
  userEmail,
}: {
  recommendedPlan: string;
  onSubscribe: (planId: string) => void;
  showAllPlans: boolean;
  onToggleAllPlans: () => void;
  userEmail: string;
}) {
  const plan = PLANS[recommendedPlan as keyof typeof PLANS] || PLANS.PRO;
  const otherPlans = Object.values(PLANS).filter((p) => p.id !== plan.id);

  return (
    <div className="space-y-6" style={{ animation: "scaleIn 0.4s ease-out" }}>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-3 py-1 text-sm font-medium text-violet-600">
          <Sparkles className="w-3.5 h-3.5" />
          Résultat
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          L&apos;offre idéale pour vous
        </h2>
      </div>

      {/* Recommended Plan Card */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${plan.gradient} p-6 text-white shadow-xl ${plan.shadow}`}
      >
        {/* Decorative */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-white/5" />

        <div className="relative space-y-4">
          {/* Badge */}
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
            <Crown className="w-3 h-3" />
            {plan.badge}
          </span>

          {/* Price */}
          <div>
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-0.5">
              <span className="text-4xl font-bold">{plan.price}€</span>
              <span className="text-white/70">{plan.period}</span>
            </div>
            <p className="mt-1 text-sm text-white/70">{plan.description}</p>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {plan.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
                  <feature.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Subscribe Button */}
          <button
            onClick={() => onSubscribe(plan.id)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold shadow-lg transition-all active:scale-[0.98] hover:shadow-xl"
            style={{ color: plan.gradient.includes("emerald") ? "#059669" : plan.gradient.includes("violet") ? "#7c3aed" : "#d97706" }}
          >
            S&apos;abonner à {plan.name}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toggle All Plans */}
      <button
        onClick={onToggleAllPlans}
        className="w-full text-center text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors py-2"
      >
        {showAllPlans ? "Masquer les autres plans" : "Voir tous les plans"}
      </button>

      {/* Other Plans */}
      {showAllPlans && (
        <div className="space-y-3" style={{ animation: "scaleIn 0.3s ease-out" }}>
          {otherPlans.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white shadow-md`}
                >
                  {p.id === "STUDENT" && <GraduationCap className="w-5 h-5" />}
                  {p.id === "PRO" && <Zap className="w-5 h-5" />}
                  {p.id === "BUSINESS" && <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    {p.price}€{p.period}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onSubscribe(p.id)}
                className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors"
              >
                Choisir
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Trust */}
      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5" />
        Paiement sécurisé par Stripe - Annulation à tout moment
      </p>
    </div>
  );
}
