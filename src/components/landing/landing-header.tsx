"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Produit", href: "#" },
  { label: "IA", href: "#" },
  { label: "Entreprise", href: "/entreprise" },
  { label: "Tarifs", href: "/tarifs" },
];

export function LandingHeader({ solid: forceSolid = false }: { solid?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const solidBg = forceSolid || scrolled || menuOpen;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          solidBg ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100/80" : ""
        }`}
      >
        <div className="flex h-16 w-full items-center px-4 md:px-6">

          {/* Logo — left */}
          <Link href="/" className="flex flex-1 items-center gap-2.5 flex-shrink-0">
            <div
              className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl transition-all duration-300 ${
                solidBg ? "bg-gray-100 ring-1 ring-gray-200" : "bg-white/20 backdrop-blur-sm shadow-md ring-1 ring-white/30"
              }`}
            >
              <Image src="/logo.png" alt="DocuSafe" width={32} height={32} className="object-contain" />
            </div>
            <span
              className={`text-base font-bold transition-colors duration-300 ${
                solidBg ? "text-gray-900" : "text-white drop-shadow-sm"
              }`}
            >
              DocuSafe
            </span>
          </Link>

          {/* Nav — desktop only, truly centered */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
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

          {/* Right side */}
          <div className="flex flex-1 justify-end items-center gap-2">

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-2">
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

            {/* Mobile burger button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className={`flex lg:hidden h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                solidBg ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/15"
              }`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile menu — full screen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white pt-16 lg:hidden">
          <div className="flex flex-1 flex-col px-4 py-6 overflow-y-auto">

            {/* Nav links */}
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-4 text-lg font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Separator */}
            <div className="my-6 h-px bg-gray-100" />

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-gray-200 px-6 py-4 text-center text-base font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-gray-900 px-6 py-4 text-center text-base font-semibold text-white hover:bg-gray-700 shadow-sm transition-colors"
              >
                Essayer maintenant
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
