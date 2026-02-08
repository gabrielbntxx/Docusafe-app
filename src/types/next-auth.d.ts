import { PlanType } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      planType?: PlanType;
      documentsCount?: number;
      storageUsedBytes?: number;
      language?: string;
      theme?: string;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    planType?: PlanType;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
