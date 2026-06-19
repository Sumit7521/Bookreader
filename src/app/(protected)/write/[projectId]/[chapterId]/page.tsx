import { getChapterAction, getChaptersAction } from "@/actions/write";
import { TiptapEditor } from "@/components/write/TiptapEditor";
import { ChapterSidebar } from "@/components/write/ChapterSidebar";
import { redirect } from "next/navigation";

export default async function ChapterEditorPage({ params }: { params: { projectId: string; chapterId: string } }) {
  const resolvedParams = await params;
  
  const [chapterRes, chaptersRes] = await Promise.all([
    getChapterAction(resolvedParams.chapterId),
    getChaptersAction(resolvedParams.projectId)
  ]);
  
  if (!chapterRes.success || !chapterRes.chapter) {
    redirect(`/write/${resolvedParams.projectId}`);
  }

  const chapters = chaptersRes.success && chaptersRes.chapters ? chaptersRes.chapters : [];

  return (
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-[#1a1a1a] sm:rounded-xl border-x-0 sm:border border-stone-200/50 dark:border-stone-800/50 -mx-4 sm:mx-0 shadow-sm relative z-0">
      <ChapterSidebar 
        projectId={resolvedParams.projectId} 
        initialChapters={chapters} 
        activeChapterId={resolvedParams.chapterId} 
        className="hidden md:flex w-64 border-r border-stone-200/50 dark:border-stone-800/50" 
      />
      <div className="flex-1 overflow-hidden px-4 md:px-8 pt-4 pb-0 flex flex-col">
        <TiptapEditor 
          chapter={chapterRes.chapter} 
          projectId={resolvedParams.projectId} 
          chapters={chapters} 
        />
      </div>
    </div>
  );
}
