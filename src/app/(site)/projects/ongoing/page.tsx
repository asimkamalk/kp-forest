import { ProjectStatus } from "@prisma/client";
import { ProjectsGrid } from "@/components/site/projects/projects-grid";
import { getProjectsByStatus } from "@/lib/data/site";

export default async function OngoingProjectsPage() {
  const projects = await getProjectsByStatus(ProjectStatus.ONGOING);
  return (
    <ProjectsGrid
      projects={projects}
      showProgress
      emptyMessage="No ongoing projects yet. New programmes appear here as they are published."
    />
  );
}
