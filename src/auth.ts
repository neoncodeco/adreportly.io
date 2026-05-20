import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { getAuthSecret } from "@/lib/auth-secret";
import { requireMongo } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { UserModel } from "@/models/user";

// Warn if no auth secret or too short, which causes sessions to break after restarts and JWTSessionError on old cookies.
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
  isBanned?: boolean | null;
  isEmailVerified?: boolean | null;
};

function clearStaleUserToken(token: JWT) {
  delete token.sub;
  delete token.email;
  delete token.name;
  delete token.role;
  delete token.isBanned;
  token.full_name = null;
  token.organization = null;
  return token;
}

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
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email?.trim() || !password) return null;
        const normalizedEmail = email.trim().toLowerCase();
        const ip = request ? getClientIp(request) : "unknown";
        const limiter = checkRateLimit({
          key: `auth:login:${ip}:${normalizedEmail}`,
          limit: 8,
          windowMs: 15 * 60 * 1000,
        });
        if (!limiter.allowed) return null;

        await requireMongo();
        const user = (await UserModel.findOne({
          email: normalizedEmail,
        }).lean()) as LeanAuthUser | null;
        if (!user?.passwordHash) return null;
        if (user.isBanned) return null;
        if (!user.isEmailVerified) return null;

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
        if (!isValidObjectId(token.sub)) {
          return clearStaleUserToken(token);
        }
        await requireMongo();
        const doc = (await UserModel.findById(token.sub).select("role isBanned").lean().exec()) as {
          role?: string | null;
          isBanned?: boolean | null;
        } | null;
        if (!doc) {
          return clearStaleUserToken(token);
        }
        token.role = doc.role === "admin" ? "admin" : "user";
        token.isBanned = Boolean(doc.isBanned);
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
