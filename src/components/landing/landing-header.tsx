"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Shield, Sparkles, HardDrive, Mail, Share2, Bell, ChevronDown } from "lucide-react";

// ─── Produit dropdown items ────────────────────────────────────────────────────

const PRODUIT_ITEMS = [
  {
    icon: Shield,
    label: "Sécurité",
    desc: "Chiffrement, PIN & accès contrôlé",
    href: "/securite",
  },
  {
    icon: Sparkles,
    label: "Intelligence Artificielle",
    desc: "Classification auto, analyses & DocuBot",
    href: "/#ia",
  },
  {
    icon: HardDrive,
    label: "Stockage & Dossiers",
    desc: "Jusqu'à 4 To, sous-dossiers & triage",
    href: "/stockage",
  },
  {
    icon: Mail,
    label: "Import & Email",
    desc: "Google Drive, OneDrive & email unique",
    href: "/#import",
  },
  {
    icon: Share2,
    label: "Partage & Collaboration",
    desc: "Partage sécurisé, liens & demandes",
    href: "/#partage",
  },
  {
    icon: Bell,
    label: "Alertes & Expiration",
    desc: "Notifications & suivi des échéances",
    href: "/#alertes",
  },
];

const NAV_ITEMS = [
  { label: "Produit", href: "#", hasDropdown: true },
  { label: "IA", href: "#", hasDropdown: false },
  { label: "Entreprise", href: "/entreprise", hasDropdown: false },
  { label: "Tarifs", href: "/tarifs", hasDropdown: false },
];

export function LandingHeader({ solid: forceSolid = false }: { solid?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [produitOpen, setProduitOpen] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const solidBg = forceSolid || scrolled || menuOpen;

  function openProduit() {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setProduitOpen(true);
  }
  function closeProduit() {
    hideTimeout.current = setTimeout(() => setProduitOpen(false), 120);
  }

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
            {NAV_ITEMS.map((item) =>
              item.hasDropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={openProduit}
                  onMouseLeave={closeProduit}
                >
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      solidBg
                        ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        : "text-white/85 hover:text-white hover:bg-white/12"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${produitOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {produitOpen && (
                    <div
                      className="absolute left-1/2 top-full mt-2 w-[520px] -translate-x-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-gray-100 overflow-hidden"
                      onMouseEnter={openProduit}
                      onMouseLeave={closeProduit}
                    >
                      {/* Branding header */}
                      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200 flex-shrink-0">
                          <Image src="/logo.png" alt="DocuSafe" width={36} height={36} className="object-contain" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">DocuSafe</p>
                          <p className="text-xs text-gray-400">Votre espace de documentation</p>
                        </div>
                      </div>

                      {/* Feature links */}
                      <div className="grid grid-cols-2 gap-px bg-gray-50 p-3">
                        {PRODUIT_ITEMS.map((feat) => (
                          <Link
                            key={feat.label}
                            href={feat.href}
                            onClick={() => setProduitOpen(false)}
                            className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 transition-colors hover:bg-gray-50"
                          >
                            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                              <feat.icon className="h-4 w-4 text-gray-700" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{feat.label}</p>
                              <p className="text-xs text-gray-400 leading-snug">{feat.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    solidBg
                      ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      : "text-white/85 hover:text-white hover:bg-white/12"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="flex flex-1 justify-end items-center gap-2">

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  solidBg
                    ? "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    : "text-white/85 hover:text-white hover:bg-white/12"
                }`}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className={`px-4 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 whitespace-nowrap ${
                  solidBg
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
