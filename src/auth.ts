import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAuthSecret } from "@/lib/auth-secret";
import { requireMongo } from "@/lib/db";
import { UserModel } from "@/models/user";

/** Mongoose `.lean()` return type is too loose for `findOne`; narrow for authorize(). */
type LeanAuthUser = {
  _id: { toString(): string };
  email: string;
  passwordHash: string;
  fullName?: string | null;
  organization?: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: getAuthSecret(),
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

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.fullName || undefined,
          full_name: user.fullName ?? null,
          organization: user.organization ?? null,
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
      }
      return session;
    },
  },
});
