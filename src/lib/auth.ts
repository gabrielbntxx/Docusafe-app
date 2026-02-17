import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { db } from "./db";

// Determine cookie security based on NEXTAUTH_URL
const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  // Explicit cookie config for production behind proxy (Railway)
  cookies: {
    sessionToken: {
      name: `${useSecureCookies ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${useSecureCookies ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    pkceCodeVerifier: {
      name: `${useSecureCookies ? "__Secure-" : ""}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 900,
      },
    },
    state: {
      name: `${useSecureCookies ? "__Secure-" : ""}next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        maxAge: 900,
      },
    },
    nonce: {
      name: `${useSecureCookies ? "__Secure-" : ""}next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID ?? "",
      clientSecret: process.env.APPLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        // Normalize email to lowercase (same as registration)
        const normalizedEmail = credentials.email.trim().toLowerCase();

        const user = await db.user.findUnique({
          where: {
            email: normalizedEmail,
          },
        });

        if (!user || !user.password) {
          throw new Error("Incorrect email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect email or password");
        }

        // Unverified users are blocked at the login form level
        // via /api/auth/check-verification before signIn is called.
        // Do NOT block here — NextAuth swallows custom error messages.

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Auto-verify email for OAuth users (Google/Apple)
      if (account?.provider && account.provider !== "credentials") {
        if (user.email) {
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });
          if (existingUser && !existingUser.emailVerified) {
            await db.user.update({
              where: { id: existingUser.id },
              data: { emailVerified: new Date() },
            });
          }
        }
        return true;
      }

      // Block unverified credentials users server-side
      if (account?.provider === "credentials" && user.id) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true },
        });
        if (!dbUser?.emailVerified) {
          // Return false blocks the sign-in
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Store the timestamp when the JWT was issued
        token.iat = Math.floor(Date.now() / 1000);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;

        // Fetch latest user data including subscription info
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            planType: true,
            documentsCount: true,
            storageUsedBytes: true,
            language: true,
            theme: true,
            image: true,
            emailVerified: true,
            onboardingCompleted: true,
            passwordChangedAt: true,
          },
        });

        if (dbUser) {
          // Invalidate session if password was changed after JWT was issued
          if (dbUser.passwordChangedAt && token.iat) {
            const changedAtSec = Math.floor(dbUser.passwordChangedAt.getTime() / 1000);
            if (changedAtSec > (token.iat as number)) {
              // Force sign out by returning empty session
              session.user = {} as typeof session.user;
              return session;
            }
          }

          session.user.planType = dbUser.planType;
          session.user.documentsCount = dbUser.documentsCount;
          session.user.language = dbUser.language;
          session.user.theme = dbUser.theme;
          session.user.image = dbUser.image;
          session.user.emailVerified = dbUser.emailVerified;
          session.user.onboardingCompleted = dbUser.onboardingCompleted;
          // Convert BigInt to Number for JSON serialization
          session.user.storageUsedBytes = Number(dbUser.storageUsedBytes);
        }
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
