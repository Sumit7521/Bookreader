import { getProjectAction, getChaptersAction } from "@/actions/write";
import { ProjectDashboardClient } from "./ProjectDashboardClient";
import { redirect } from "next/navigation";

export default async function ProjectDashboardPage({ params }: { params: { projectId: string } }) {
  const resolvedParams = await params;
  const projectRes = await getProjectAction(resolvedParams.projectId);
  if (!projectRes.success || !projectRes.project) {
    redirect("/write");
  }

  const chaptersRes = await getChaptersAction(resolvedParams.projectId);
  const chapters = chaptersRes.success && chaptersRes.chapters ? chaptersRes.chapters : [];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <ProjectDashboardClient project={projectRes.project} initialChapters={chapters} />
    </div>
  );
}
