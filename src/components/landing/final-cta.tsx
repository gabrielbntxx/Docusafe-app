import Link from "next/link";
import Image from "next/image";
import {
  Home, Activity, Car, Banknote, FileText, Shield, ChevronRight, Plus,
} from "lucide-react";

const FOLDERS = [
  { icon: Home,     label: "Logement",     docs: 3,  color: "bg-orange-100 text-orange-600"  },
  { icon: Activity, label: "Santé",         docs: 7,  color: "bg-red-100 text-red-600"        },
  { icon: Car,      label: "Véhicule",      docs: 2,  color: "bg-blue-100 text-blue-600"      },
  { icon: Banknote, label: "Finances",      docs: 12, color: "bg-emerald-100 text-emerald-600"},
  { icon: FileText, label: "Administratif", docs: 5,  color: "bg-violet-100 text-violet-600"  },
  { icon: Shield,   label: "Assurances",    docs: 4,  color: "bg-indigo-100 text-indigo-600"  },
];

export function FinalCta() {
  return (
    <section className="px-4 py-20 md:py-28" style={{ background: "#f1f5f9" }}>
      <div className="mx-auto max-w-5xl">

        {/* Titre */}
        <h2
          className="mb-10 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.06 }}
        >
          Essayez gratuitement.
        </h2>

        {/* Grand rectangle */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-stretch">

            {/* ── LEFT — CTA ── */}
            <div className="flex flex-col justify-start gap-5 p-10 lg:flex-[4] lg:border-r lg:border-gray-100">

              {/* Logo seul, plus grand */}
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">
                <Image src="/logo.png" alt="DocuSafe" width={56} height={56} className="object-contain" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Premiers pas sur DocuSafe
              </p>

              <h3
                className="text-2xl font-extrabold text-gray-900 md:text-3xl"
                style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                Votre espace<br />vous attend.
              </h3>

              <p className="text-sm leading-relaxed text-gray-500">
                Créez votre compte gratuit et importez vos premiers documents en moins de 2 minutes.
              </p>

              <div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-700"
                >
                  Créer un compte <ChevronRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-xs text-gray-400">
                  Aucune carte bancaire · Gratuit pour commencer
                </p>
              </div>

            </div>

            {/* ── RIGHT — Mockup dossiers ── */}
            <div className="flex flex-col p-6 lg:flex-[6]" style={{ background: "#f8f9fc" }}>

              {/* Barre du haut */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">Mes dossiers</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900">
                  <Plus className="h-3.5 w-3.5 text-white" />
                </div>
              </div>

              {/* Liste des dossiers */}
              <div className="space-y-2">
                {FOLDERS.map((f) => (
                  <div
                    key={f.label}
                    className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100"
                  >
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${f.color}`}>
                      <f.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                      <p className="text-[11px] text-gray-400">{f.docs} document{f.docs > 1 ? "s" : ""}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
