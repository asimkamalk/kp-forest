import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import { projectWhere, regionWhere } from "@/lib/org-scope";
import { prisma } from "@/lib/prisma";
import {
  ProjectsTableClient,
  type ProjectRow,
} from "@/components/dashboard/projects/projects-table-client";

export default async function ProjectsDashboardPage() {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const [projects, regions] = await Promise.all([
    prisma.project.findMany({
      where: projectWhere(session),
      orderBy: [{ projectStatus: "asc" }, { title: "asc" }],
      include: {
        region: { select: { id: true, name: true } },
        circle: {
          select: {
            id: true,
            name: true,
            region: { select: { id: true, name: true } },
          },
        },
        division: {
          select: {
            id: true,
            name: true,
            circle: {
              select: {
                id: true,
                name: true,
                region: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    }),
    prisma.region.findMany({
      where: regionWhere(session),
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: ProjectRow[] = projects.map((p) => {
    const region =
      p.region ?? p.circle?.region ?? p.division?.circle.region ?? null;
    const owner = p.division
      ? p.division.name
      : p.circle
        ? p.circle.name
        : p.region
          ? p.region.name
          : null;
    return {
      id: p.id,
      title: p.title,
      projectStatus: p.projectStatus,
      owner,
      regionId: region?.id ?? p.regionId,
      progressPct: p.progressPct,
      costPkr: p.costPkr,
      status: p.status,
    };
  });

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-resin">Projects</p>
          <h1 className="mt-1 font-display text-2xl text-bark">Projects</h1>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex h-10 items-center rounded-[8px] bg-deodar px-4 text-sm font-medium text-paper"
        >
          New project
        </Link>
      </div>

      <ProjectsTableClient rows={rows} regions={regions} />
    </div>
  );
}
