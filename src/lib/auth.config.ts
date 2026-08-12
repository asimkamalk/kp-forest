import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe Auth.js config (no Prisma / Node APIs).
 * Full Credentials provider lives in auth.ts.
 */
export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (isDashboard) return !!auth?.user;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.regionId = user.regionId ?? null;
        token.circleId = user.circleId ?? null;
        token.divisionId = user.divisionId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.regionId = (token.regionId as string | null) ?? null;
        session.user.circleId = (token.circleId as string | null) ?? null;
        session.user.divisionId = (token.divisionId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
