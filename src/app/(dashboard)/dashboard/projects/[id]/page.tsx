import { notFound } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth";
import {
  circleWhere,
  divisionWhere,
  projectWhere,
  regionWhere,
} from "@/lib/org-scope";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/dashboard/projects/project-form";
import { toDateInput, type ProjectInput } from "@/lib/validators/project";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  const session = await requireRole(
    Role.SUPER_ADMIN,
    Role.REGION_ADMIN,
    Role.CIRCLE_ADMIN,
    Role.DIVISION_ADMIN,
    Role.EDITOR
  );

  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, ...projectWhere(session) },
  });
  if (!project) notFound();

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

  const defaults: ProjectInput = {
    slug: project.slug,
    title: project.title,
    titleUr: project.titleUr,
    projectStatus: project.projectStatus,
    summary: project.summary,
    description: project.description,
    costPkr: project.costPkr,
    fundingSource: project.fundingSource,
    startDate: toDateInput(project.startDate) as unknown as Date | null,
    endDate: toDateInput(project.endDate) as unknown as Date | null,
    progressPct: project.progressPct,
    coverImage: project.coverImage,
    documentUrl: project.documentUrl,
    status: project.status,
    regionId: project.regionId,
    circleId: project.circleId,
    divisionId: project.divisionId,
  };

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <Link href="/dashboard/projects" className="text-sm text-bark/60 hover:text-bark">
          ← Projects
        </Link>
        <h1 className="mt-2 font-display text-2xl text-bark">Edit project</h1>
        <p className="mt-1 text-sm text-bark/60">{project.title}</p>
      </div>
      <ProjectForm
        mode="edit"
        projectId={project.id}
        defaults={defaults}
        regions={regions}
        circles={circles}
        divisions={divisions}
      />
    </div>
  );
}
