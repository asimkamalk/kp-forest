import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Role, type Prisma } from "@prisma/client";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: Role;
  regionId: string | null;
  circleId: string | null;
  divisionId: string | null;
};

declare module "next-auth" {
  interface User {
    role: Role;
    regionId: string | null;
    circleId: string | null;
    divisionId: string | null;
  }

  interface Session {
    user: SessionUser;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    regionId: string | null;
    circleId: string | null;
    divisionId: string | null;
  }
}

export { loginSchema };
export type { LoginInput } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user || !user.isActive) return null;

        const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!matches) return null;

        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }),
          prisma.auditLog.create({
            data: {
              userId: user.id,
              action: "LOGIN",
              entity: "User",
              entityId: user.id,
              after: { email: user.email, role: user.role },
            },
          }),
        ]);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          regionId: user.regionId,
          circleId: user.circleId,
          divisionId: user.divisionId,
        };
      },
    }),
  ],
});

/**
 * Prisma where-fragment for row-level scope.
 * SUPER_ADMIN → unrestricted empty object.
 */
export function scopeFilter(
  session: { user: SessionUser } | null
): Prisma.UserWhereInput & Record<string, unknown> {
  if (!session?.user) {
    return { id: "__unauthenticated__" };
  }

  const { role, regionId, circleId, divisionId } = session.user;

  switch (role) {
    case Role.SUPER_ADMIN:
      return {};
    case Role.REGION_ADMIN:
      return regionId ? { regionId } : { id: "__no_scope__" };
    case Role.CIRCLE_ADMIN:
      return circleId ? { circleId } : { id: "__no_scope__" };
    case Role.DIVISION_ADMIN:
      return divisionId ? { divisionId } : { id: "__no_scope__" };
    default:
      return { id: "__no_scope__" };
  }
}

/**
 * Server-side gate for dashboard pages and server actions.
 * Call at the top of every protected surface — sidebar hiding is not enough.
 */
export async function requireRole(...roles: Role[]) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (roles.length > 0 && !roles.includes(session.user.role)) {
    redirect("/dashboard");
  }

  return session;
}

export function roleCanAccess(
  role: Role,
  allowed: Role[] | "all"
): boolean {
  if (allowed === "all") return true;
  return allowed.includes(role);
}
