"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Produit", href: "#" },
  { label: "IA", href: "#" },
  { label: "Entreprise", href: "#" },
  { label: "Tarifs", href: "/dashboard/subscription" },
];

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100/80"
          : ""
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">

        {/* Logo — collé en haut à gauche */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl transition-all duration-300 ${
              scrolled
                ? "bg-gray-100 ring-1 ring-gray-200"
                : "bg-white/20 backdrop-blur-sm shadow-md ring-1 ring-white/30"
            }`}
          >
            <Image src="/logo.png" alt="DocuSafe" width={32} height={32} className="object-contain" />
          </div>
          <span
            className={`text-base font-bold transition-colors duration-300 ${
              scrolled ? "text-gray-900" : "text-white drop-shadow-sm"
            }`}
          >
            DocuSafe
          </span>
        </Link>

        {/* Nav links — centre */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                scrolled
                  ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  : "text-white/85 hover:text-white hover:bg-white/12"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTAs — collés en haut à droite, toujours visibles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/login"
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
              scrolled
                ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                : "text-white/85 hover:text-white hover:bg-white/12"
            }`}
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className={`px-4 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
              scrolled
                ? "bg-gray-900 text-white hover:bg-gray-700 shadow-sm"
                : "bg-white/20 text-white backdrop-blur-sm ring-1 ring-white/35 hover:bg-white/30 shadow-md"
            }`}
          >
            Essayer maintenant
          </Link>
        </div>

      </div>
    </header>
  );
}
