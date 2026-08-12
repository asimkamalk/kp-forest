import { ProjectStatus } from "@prisma/client";
import { ProjectsGrid } from "@/components/site/projects/projects-grid";
import { getProjectsByStatus } from "@/lib/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Future projects",
  "Planned Forest Department programmes scheduled for Khyber Pakhtunkhwa.",
  "/projects/future"
);

export default async function FutureProjectsPage() {
  const projects = await getProjectsByStatus(ProjectStatus.FUTURE);
  return (
    <ProjectsGrid
      projects={projects}
      emptyMessage="No future projects yet. Planned programmes appear here as they are published."
    />
  );
}
