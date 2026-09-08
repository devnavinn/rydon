import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { env } from "@/lib/env";
import { signInSchema } from "@/features/auth/validators";

// Social providers can be added here later — e.g. `import Google from
// "next-auth/providers/google"` and drop `Google` into the `providers`
// array below. Because signIn/callbacks are keyed off `user.id`, a new
// OAuth provider only needs a `signIn` callback that finds-or-creates the
// matching `User` + `RiderProfile` row by email before returning true.
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
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
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
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
