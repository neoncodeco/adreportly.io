import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    full_name?: string | null;
    organization?: string | null;
    role?: "user" | "admin";
  }

  interface Session {
    user: {
      id: string;
      full_name?: string | null;
      organization?: string | null;
      role: "user" | "admin";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    full_name?: string | null;
    organization?: string | null;
    role?: "user" | "admin";
    isBanned?: boolean;
  }
}
