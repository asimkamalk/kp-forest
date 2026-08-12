import { ProjectStatus } from "@prisma/client";
import { ProjectsGrid } from "@/components/site/projects/projects-grid";
import { getProjectsByStatus } from "@/lib/data/site";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta(
  "Completed projects",
  "Finished Forest Department programmes and projects across Khyber Pakhtunkhwa.",
  "/projects/completed"
);

export default async function CompletedProjectsPage() {
  const projects = await getProjectsByStatus(ProjectStatus.COMPLETED);
  return (
    <ProjectsGrid
      projects={projects}
      emptyMessage="No completed projects yet. Finished programmes appear here as they are published."
    />
  );
}
