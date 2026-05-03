import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAuthSecret } from "@/lib/auth-secret";
import { requireMongo } from "@/lib/db";
import { UserModel } from "@/models/user";

const authSecret = getAuthSecret();
if (!authSecret || authSecret.length < 16) {
  console.warn(
    "[auth] Set AUTH_SECRET (or NEXTAUTH_SECRET) in .env — at least 16 characters. Generate: openssl rand -base64 32. " +
      "Without it, sessions break after restarts and you may see JWTSessionError / no matching decryption secret on old cookies.",
  );
}

/** Mongoose `.lean()` return type is too loose for `findOne`; narrow for authorize(). */
type LeanAuthUser = {
  _id: { toString(): string };
  email: string;
  passwordHash: string;
  fullName?: string | null;
  organization?: string | null;
  role?: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email?.trim() || !password) return null;

        await requireMongo();
        const user = (await UserModel.findOne({
          email: email.trim().toLowerCase(),
        }).lean()) as LeanAuthUser | null;
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        const role = user.role === "admin" ? "admin" : "user";
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName || undefined,
          full_name: user.fullName ?? null,
          organization: user.organization ?? null,
          role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.full_name = (user as { full_name?: string | null }).full_name ?? null;
        token.organization = (user as { organization?: string | null }).organization ?? null;
        token.role = (user as { role?: string }).role === "admin" ? "admin" : "user";
      }
      if (token.sub) {
        await requireMongo();
        const doc = (await UserModel.findById(token.sub).select("role").lean().exec()) as {
          role?: string | null;
        } | null;
        if (doc) {
          token.role = doc.role === "admin" ? "admin" : "user";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string | undefined) ?? session.user.name;
        session.user.full_name = (token.full_name as string | null | undefined) ?? null;
        session.user.organization = (token.organization as string | null | undefined) ?? null;
        session.user.role = token.role === "admin" ? "admin" : "user";
      }
      return session;
    },
  },
});
