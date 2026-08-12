import { ProjectStatus } from "@prisma/client";
import { ProjectsGrid } from "@/components/site/projects/projects-grid";
import { getProjectsByStatus } from "@/lib/data/site";

export default async function CompletedProjectsPage() {
  const projects = await getProjectsByStatus(ProjectStatus.COMPLETED);
  return (
    <ProjectsGrid
      projects={projects}
      emptyMessage="No completed projects yet. Finished programmes appear here as they are published."
    />
  );
}
