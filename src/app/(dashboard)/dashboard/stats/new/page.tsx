import Link from "next/link";
import { PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { StatForm } from "@/components/dashboard/stats/stat-form";
import type { StatCounterInput } from "@/lib/validators/stat";

const defaults: StatCounterInput = {
  label: "",
  labelUr: "",
  value: 0,
  prefix: "",
  suffix: "",
  icon: "",
  orderIndex: 0,
  status: PublishStatus.DRAFT,
};

export default async function NewStatPage() {
  await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/stats" className="text-sm text-bark/60 hover:text-bark">
          ← Homepage stats
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New statistic</h1>
      </div>
      <StatForm mode="create" defaults={defaults} />
    </div>
  );
}
