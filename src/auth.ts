import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { env, googleAuthEnabled } from "@/lib/env";
import { signInSchema } from "@/features/auth/validators";
import { findGoogleUser, findOrCreateGoogleUser } from "@/features/auth/server/google";

// There's no Auth.js database adapter — OAuth sign-ins are mapped onto our own
// `User` rows in the `signIn` callback (find-or-create) and the `jwt` callback
// (swap the provider's user for ours), so the session always carries a Rydo id.
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  // Auth.js sends errors (e.g. `?error=AccessDenied`) here instead of its own page.
  pages: { signIn: "/sign-in", error: "/sign-in" },
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Username or email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { identifier, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: { OR: [{ username: identifier }, { email: identifier }] },
          select: { id: true, username: true, email: true, role: true, passwordHash: true, isActive: true },
        });

        if (!user?.isActive || !user.passwordHash) return null;
        if (!(await verifyPassword(password, user.passwordHash))) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastSeenAt: new Date() },
        });

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
    ...(googleAuthEnabled
      ? [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET })]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email || !profile.email_verified || !profile.sub) return false;

      const user = await findOrCreateGoogleUser({
        sub: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: typeof profile.picture === "string" ? profile.picture : null,
      });
      if (!user.isActive) return false;

      await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
      return true;
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        // `user` here is Google's profile, not ours — look up the row signIn linked.
        const dbUser = await findGoogleUser(account.providerAccountId);
        if (!dbUser) throw new Error("Google user missing after sign-in");
        token.id = dbUser.id;
        token.username = dbUser.username;
        token.role = dbUser.role;
        token.name = dbUser.username;
        token.email = dbUser.email;
      } else if (user?.id) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.role = token.role;
      return session;
    },
  },
});
