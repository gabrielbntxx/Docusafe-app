import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
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

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
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
          },
        });

        if (dbUser) {
          session.user.planType = dbUser.planType;
          session.user.documentsCount = dbUser.documentsCount;
          session.user.language = dbUser.language;
          session.user.theme = dbUser.theme;
          session.user.image = dbUser.image;
          // Convert BigInt to Number for JSON serialization
          session.user.storageUsedBytes = Number(dbUser.storageUsedBytes);
        }
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};
