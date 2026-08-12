import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/dashboard/users/user-form";
import { ResetPasswordPanel } from "@/components/dashboard/users/users-table-client";
import type { UpdateUserInput } from "@/lib/validators/admin";

type Props = { params: Promise<{ id: string }> };

export default async function EditUserPage({ params }: Props) {
  const session = await requireRole(Role.SUPER_ADMIN);
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

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

  const defaults: UpdateUserInput = {
    name: user.name,
    email: user.email,
    role: user.role,
    designation: user.designation,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    regionId: user.regionId,
    circleId: user.circleId,
    divisionId: user.divisionId,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-8">
      <div>
        <Link href="/dashboard/users" className="text-sm text-bark/60 hover:text-bark">
          ← Users
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit user</h1>
        <p className="mt-1 text-sm text-moss">{user.email}</p>
      </div>
      <UserForm
        mode="edit"
        userId={user.id}
        defaults={defaults}
        org={{ regions, circles, divisions }}
        lockRoleAndActive={user.id === session.user.id}
      />
      <ResetPasswordPanel userId={user.id} />
    </div>
  );
}
