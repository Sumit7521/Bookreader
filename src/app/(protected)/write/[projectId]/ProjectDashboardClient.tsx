"use client";

import { useState } from "react";
import { ChevronLeft, Plus, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { createChapterAction, deleteChapterAction, deleteProjectAction } from "@/actions/write";
import { useRouter } from "next/navigation";
import { ExportDropdown } from "@/components/write/ExportDropdown";

type ProjectType = { _id: string, title: string, category: string, synopsis?: string };
type ChapterType = { _id: string, title: string, wordCount: number, updatedAt: string | Date };
export function ProjectDashboardClient({ project, initialChapters }: { project: ProjectType, initialChapters: ChapterType[] }) {
  const [chapters, setChapters] = useState(initialChapters);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const handleCreateChapter = async () => {
    setIsCreating(true);
    const title = `Chapter ${chapters.length + 1}`;
    const res = await createChapterAction(project._id, title);
    if (res.success && res.chapter) {
      setChapters([...chapters, res.chapter]);
    }
    setIsCreating(false);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (confirm("Are you sure you want to delete this chapter?")) {
      await deleteChapterAction(chapterId, project._id);
      setChapters(chapters.filter((c: ChapterType) => c._id !== chapterId));
    }
  };

  const handleDeleteProject = async () => {
    if (confirm("Are you sure you want to delete this entire project and all its chapters? This cannot be undone.")) {
      await deleteProjectAction(project._id);
      router.push("/write");
    }
  };

  const totalWords = chapters.reduce((acc: number, c: ChapterType) => acc + (c.wordCount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/write" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Workspace
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider rounded-md">
              {project.category}
            </span>
            <span className="px-2 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-medium rounded-md">
              {totalWords.toLocaleString()} words
            </span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-stone-800 dark:text-stone-100">{project.title}</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-2 max-w-2xl">{project.synopsis || "No synopsis."}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <ExportDropdown project={project} chapters={chapters} />
          <Button variant="destructive" size="sm" onClick={handleDeleteProject} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 hover:border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
            <Trash2 className="w-4 h-4 mr-2" /> Delete Project
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-4">
        <h2 className="text-xl font-serif font-semibold text-stone-800 dark:text-stone-200">Chapters</h2>
        <Button onClick={handleCreateChapter} disabled={isCreating} className="bg-stone-800 hover:bg-stone-900 text-white dark:bg-stone-200 dark:hover:bg-white dark:text-stone-900 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> {isCreating ? "Adding..." : "New Chapter"}
        </Button>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg">
          <FileText className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
          <p className="text-stone-500">No chapters yet. Create one to start writing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chapters.map((chapter: ChapterType) => (
            <Card key={chapter._id} className="group relative overflow-hidden border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors bg-white dark:bg-stone-900">
              <Link href={`/write/${project._id}/${chapter._id}`} className="absolute inset-0 z-10" />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-serif font-medium text-lg text-stone-800 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors">
                    {chapter.title}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 z-20 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 relative" 
                    onClick={(e) => { e.preventDefault(); handleDeleteChapter(chapter._id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-stone-500 flex justify-between items-center mt-4">
                  <span>{(chapter.wordCount || 0).toLocaleString()} words</span>
                  <span className="text-xs text-stone-400">Updated {new Date(chapter.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
