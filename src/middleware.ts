import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting store en mémoire (pour production, utiliser Redis/KV)
const loginAttempts = new Map<
  string,
  { count: number; firstAttempt: number; blockedUntil?: number }
>();

const CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes de blocage
};

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

function cleanupStore(): void {
  const now = Date.now();
  for (const [key, data] of loginAttempts.entries()) {
    if (
      (!data.blockedUntil || data.blockedUntil < now) &&
      now - data.firstAttempt > 60 * 60 * 1000
    ) {
      loginAttempts.delete(key);
    }
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip custom processing only for NextAuth internal OAuth routes
  // (they manage their own state/PKCE cookies that middleware can break).
  // Custom auth routes (register, verify, reset, etc.) still get security headers.
  const isNextAuthInternal =
    pathname.startsWith("/api/auth/callback/") && pathname !== "/api/auth/callback/credentials" ||
    pathname === "/api/auth/signin" ||
    pathname === "/api/auth/signout" ||
    pathname === "/api/auth/session" ||
    pathname === "/api/auth/csrf" ||
    pathname === "/api/auth/providers";

  if (isNextAuthInternal) {
    return NextResponse.next();
  }

  // Rate limiting uniquement pour les tentatives de login
  if (
    pathname === "/api/auth/callback/credentials" &&
    request.method === "POST"
  ) {
    const ip = getClientIp(request);
    const key = `login_${ip}`;
    const now = Date.now();

    // Nettoyage périodique
    if (Math.random() < 0.01) {
      cleanupStore();
    }

    let data = loginAttempts.get(key);

    // Vérifier si bloqué
    if (data?.blockedUntil && data.blockedUntil > now) {
      const retryAfter = Math.ceil((data.blockedUntil - now) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: `Trop de tentatives de connexion. Réessayez dans ${Math.ceil(retryAfter / 60)} minutes.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    // Réinitialiser si fenêtre expirée
    if (!data || now - data.firstAttempt > CONFIG.windowMs) {
      data = { count: 0, firstAttempt: now };
    }

    // Incrémenter
    data.count++;

    // Bloquer si trop de tentatives
    if (data.count > CONFIG.maxAttempts) {
      data.blockedUntil = now + CONFIG.blockDurationMs;
      loginAttempts.set(key, data);

      return new NextResponse(
        JSON.stringify({
          error: `Trop de tentatives de connexion. Compte temporairement bloqué pour 30 minutes.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(CONFIG.blockDurationMs / 1000),
          },
        }
      );
    }

    loginAttempts.set(key, data);
  }

  // Block cross-origin API requests (CORS)
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const appUrl = process.env.NEXTAUTH_URL || "https://www.docusafe.online";
    const allowedOrigins = [appUrl, appUrl.replace("www.", "")];

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigins.includes(origin || "") ? origin! : allowedOrigins[0],
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
  }

  // Headers de sécurité pour toutes les réponses
  const response = NextResponse.next();
  // Expose pathname to server components (used in dashboard layout)
  response.headers.set("x-pathname", pathname);

  // CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const appUrl = process.env.NEXTAUTH_URL || "https://www.docusafe.online";
    const allowedOrigins = [appUrl, appUrl.replace("www.", "")];
    const effectiveOrigin = allowedOrigins.includes(origin || "") ? origin! : allowedOrigins[0];
    response.headers.set("Access-Control-Allow-Origin", effectiveOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Permettre l'affichage en iframe pour la prévisualisation des documents
  const isDocumentView = /^\/api\/documents\/[^/]+\/view$/.test(pathname);

  if (!isDocumentView) {
    response.headers.set("X-Frame-Options", "DENY");
  }

  // Content Security Policy
  if (!pathname.startsWith("/api/")) {
    const isDev = process.env.NODE_ENV === "development";
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        `script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://js.live.net${isDev ? " 'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com",
        "frame-src 'self' blob: https://docs.google.com https://accounts.google.com https://content.googleapis.com",
        "object-src 'self' blob:",
        "media-src 'self' blob:",
        "frame-ancestors 'self'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
