import Link from "next/link";
import { ProjectStatus, PublishStatus, Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import {
  circleWhere,
  divisionWhere,
  regionWhere,
} from "@/lib/org-scope";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/dashboard/projects/project-form";
import type { ProjectInput } from "@/lib/validators/project";

const defaults: ProjectInput = {
  slug: "",
  title: "",
  titleUr: "",
  projectStatus: ProjectStatus.ONGOING,
  summary: "",
  description: "",
  costPkr: null,
  fundingSource: "",
  startDate: null,
  endDate: null,
  progressPct: 0,
  coverImage: null,
  documentUrl: null,
  status: PublishStatus.DRAFT,
  regionId: null,
  circleId: null,
  divisionId: null,
};

export default async function NewProjectPage() {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const [regions, circles, divisions] = await Promise.all([
    prisma.region.findMany({
      where: regionWhere(session),
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
    prisma.circle.findMany({
      where: circleWhere(session),
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, regionId: true },
    }),
    prisma.division.findMany({
      where: divisionWhere(session),
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, circleId: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/projects" className="text-sm text-bark/60 hover:text-bark">
          ← Projects
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">New project</h1>
      </div>
      <ProjectForm
        mode="create"
        defaults={defaults}
        regions={regions}
        circles={circles}
        divisions={divisions}
      />
    </div>
  );
}
