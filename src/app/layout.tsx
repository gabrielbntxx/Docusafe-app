import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: "DocuSafe — Votre coffre-fort documentaire intelligent",
    template: "%s | DocuSafe",
  },
  description:
    "Stockez, classez et retrouvez tous vos documents importants en quelques secondes. Chiffrement de bout en bout, IA de classification, alertes d'expiration. Essai gratuit 1 mois.",
  keywords: [
    "coffre-fort numérique", "gestion documentaire", "stockage documents",
    "classement automatique", "IA documents", "partage sécurisé",
    "alerte expiration document", "DocuSafe",
  ],
  authors: [{ name: "DocuSafe" }],
  creator: "DocuSafe",
  metadataBase: new URL("https://docusafe.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://docusafe.fr",
    siteName: "DocuSafe",
    title: "DocuSafe — Votre coffre-fort documentaire intelligent",
    description:
      "Stockez, classez et retrouvez tous vos documents importants en quelques secondes. IA, chiffrement, alertes. Essai gratuit 1 mois.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DocuSafe" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocuSafe — Votre coffre-fort documentaire intelligent",
    description: "Classez, sécurisez et retrouvez tous vos documents en quelques secondes.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="DocuSafe" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Apply theme from localStorage immediately to prevent flash
              try {
                const theme = localStorage.getItem('docusafe-theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n,o.async=!0,o.defer=!0,o.onload=function(){window.trackingFunctions.onLoad({appId:"6997a44af7217800158e7785"})},document.head.appendChild(o)}initApollo();`,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
