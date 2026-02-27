import { Shield, FileCheck, LayoutGrid, Lock } from "lucide-react";

const STATS = [
  {
    icon: FileCheck,
    value: "10 000+",
    label: "documents analysés",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    value: "100%",
    label: "chiffrement bout en bout",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: LayoutGrid,
    value: "3 plans",
    label: "pour tous les profils",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: Lock,
    value: "0",
    label: "document perdu",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export function StatsBar() {
  return (
    <section className="border-b border-gray-100 bg-white px-4 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 md:text-3xl">{stat.value}</p>
                <p className="mt-0.5 text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
