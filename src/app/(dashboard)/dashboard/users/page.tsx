import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  UsersTableClient,
  type UserRow,
} from "@/components/dashboard/users/users-table-client";

export default async function UsersDashboardPage() {
  const session = await requireRole(Role.SUPER_ADMIN);

  const users = await prisma.user.findMany({
    orderBy: [{ name: "asc" }],
    include: {
      region: { select: { name: true } },
      circle: { select: { name: true } },
      division: { select: { name: true } },
    },
  });

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    scope:
      u.division?.name ?? u.circle?.name ?? u.region?.name ?? "",
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Users</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Users</h1>
        </div>
        <Link
          href="/dashboard/users/new"
          className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
        >
          New user
        </Link>
      </div>
      <UsersTableClient rows={rows} currentUserId={session.user.id} />
    </div>
  );
}
