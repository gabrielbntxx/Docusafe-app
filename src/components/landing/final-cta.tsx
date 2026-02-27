import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-4 py-24 md:py-32">

      {/* Background gradient — reprend les couleurs du ciel hero */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0c3d78 0%, #1260b8 40%, #2b82d0 70%, #5aaae6 100%)",
        }}
      />

      {/* Glow orb haut-gauche */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: -160,
          left: -160,
          width: 480,
          height: 480,
          background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Glow orb bas-droite */}
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: -120,
          right: -120,
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(255,200,80,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl text-center">

        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">
          Prêt à commencer ?
        </p>

        <h2
          className="mb-6 text-4xl font-extrabold text-white md:text-5xl lg:text-6xl"
          style={{ letterSpacing: "-0.03em", lineHeight: 1.08 }}
        >
          Prêt à ne plus jamais<br />perdre un document ?
        </h2>

        <p className="mb-10 text-lg text-white/70 md:text-xl">
          Rejoignez des milliers d&apos;utilisateurs qui ont repris le contrôle de leurs documents.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-[0_8px_40px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_48px_rgba(0,0,0,0.32)]"
          >
            Commencer gratuitement — c&apos;est gratuit
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/50">
          <Shield className="h-4 w-4" />
          Aucune carte bancaire requise · Annulation à tout moment
        </div>

      </div>
    </section>
  );
}
