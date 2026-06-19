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
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ChapterSidebar 
        projectId={resolvedParams.projectId} 
        initialChapters={chapters} 
        activeChapterId={resolvedParams.chapterId} 
        className="hidden md:flex w-64" 
      />
      <div className="flex-1 overflow-hidden px-4 md:px-8 pt-4 bg-white dark:bg-[#1a1a1a]">
        <TiptapEditor 
          chapter={chapterRes.chapter} 
          projectId={resolvedParams.projectId} 
          chapters={chapters} 
        />
      </div>
    </div>
  );
}
