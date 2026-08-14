import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatForm } from "@/components/dashboard/stats/stat-form";
import type { StatCounterInput } from "@/lib/validators/stat";

type Props = { params: Promise<{ id: string }> };

export default async function EditStatPage({ params }: Props) {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const { id } = await params;
  const stat = await prisma.statCounter.findUnique({ where: { id } });
  if (!stat) notFound();

  const defaults: StatCounterInput = {
    label: stat.label,
    labelUr: stat.labelUr,
    value: stat.value,
    prefix: stat.prefix,
    suffix: stat.suffix,
    icon: stat.icon,
    orderIndex: stat.orderIndex,
    status: stat.status,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/stats" className="text-sm text-bark/60 hover:text-bark">
          ← Homepage stats
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit statistic</h1>
        <p className="mt-1 text-sm text-bark/60">{stat.label}</p>
      </div>
      <StatForm mode="edit" statId={stat.id} defaults={defaults} />
    </div>
  );
}
