import { getProjectsAction } from "@/actions/write";
import { WriteHubClient } from "./WriteHubClient";

export default async function WritePage() {
  const res = await getProjectsAction();
  const projects = res.success && res.projects ? res.projects : [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100">Writing Workspace</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2">Manage your novels, stories, and drafts.</p>
      </div>

      <WriteHubClient initialProjects={projects} />
    </div>
  );
}
