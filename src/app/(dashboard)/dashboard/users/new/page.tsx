import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/dashboard/users/user-form";
import type { CreateUserInput } from "@/lib/validators/admin";

const defaults: CreateUserInput = {
  name: "",
  email: "",
  password: "",
  role: Role.VIEWER,
  designation: null,
  phone: null,
  avatarUrl: null,
  isActive: true,
  regionId: null,
  circleId: null,
  divisionId: null,
};

export default async function NewUserPage() {
  await requireRole(Role.SUPER_ADMIN);

  const [regions, circles, divisions] = await Promise.all([
    prisma.region.findMany({
      select: { id: true, name: true },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.circle.findMany({
      select: { id: true, name: true, regionId: true },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.division.findMany({
      select: { id: true, name: true, circleId: true },
      orderBy: { orderIndex: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/users" className="text-sm text-bark/60 hover:text-bark">
          ← Users
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New user</h1>
      </div>
      <UserForm
        mode="create"
        defaults={defaults}
        org={{ regions, circles, divisions }}
      />
    </div>
  );
}
