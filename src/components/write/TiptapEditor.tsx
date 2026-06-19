"use client";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState } from 'react'
import { Save, Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Undo, Redo, ChevronLeft, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveChapterContentAction } from '@/actions/write'
import Link from 'next/link'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ChapterSidebar } from "./ChapterSidebar"

type ChapterType = { _id: string, title: string, content?: string };
type SidebarChapterType = { _id: string, title: string, order: number };

export function TiptapEditor({ 
  chapter, 
  projectId, 
  chapters 
}: { 
  chapter: ChapterType, 
  projectId: string, 
  chapters: SidebarChapterType[] 
}) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your story...',
      }),
      CharacterCount,
    ],
    content: chapter.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-stone dark:prose-invert max-w-none min-h-[600px] focus:outline-none focus:ring-0',
      },
    },
    onUpdate: () => {
      setSaveStatus("unsaved")
    },
  })

  useEffect(() => {
    if (!editor) return

    const handleAutoSave = setTimeout(async () => {
      if (saveStatus === "unsaved") {
        setSaveStatus("saving")
        const content = editor.getHTML()
        const wordCount = editor.storage.characterCount.words()
        await saveChapterContentAction(chapter._id, content, wordCount)
        setSaveStatus("saved")
      }
    }, 2000)

    return () => clearTimeout(handleAutoSave)
  }, [editor, saveStatus, chapter._id])

  if (!editor) return null

  const wordCount = editor.storage.characterCount.words()

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 pb-4 md:pb-0">
      <div className="flex items-center justify-between mb-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href={`/write/${projectId}`} className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="md:hidden text-stone-500 hover:text-stone-800 dark:hover:text-stone-300" />
            }>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-stone-50 dark:bg-[#151515] border-r border-stone-200 dark:border-stone-800">
              <ChapterSidebar 
                projectId={projectId} 
                initialChapters={chapters} 
                activeChapterId={chapter._id} 
                className="w-full h-full border-r-0"
              />
            </SheetContent>
          </Sheet>
          
          <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-800 dark:text-stone-200 truncate max-w-[150px] sm:max-w-xs">{chapter.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500 font-medium px-2 py-1 bg-stone-100 dark:bg-stone-900 rounded-md">
            {wordCount} words
          </span>
          <div className="flex items-center text-sm font-medium w-32 justify-end">
            {saveStatus === "saving" && <span className="text-amber-600 flex items-center"><Save className="w-4 h-4 mr-1 animate-pulse" /> Saving...</span>}
            {saveStatus === "saved" && <span className="text-stone-400 flex items-center"><Save className="w-4 h-4 mr-1" /> Saved</span>}
            {saveStatus === "unsaved" && <span className="text-stone-500 flex items-center"><Save className="w-4 h-4 mr-1" /> Unsaved changes</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1.5 mb-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md shadow-sm overflow-x-auto">
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}>
          <Bold className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}>
          <Italic className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}>
          <Strikethrough className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-1"></div>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}>
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}>
          <Heading2 className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-1"></div>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}>
          <List className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}>
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : 'text-stone-500'}>
          <Quote className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-stone-200 dark:bg-stone-800 mx-1"></div>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="text-stone-500">
          <Undo className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="text-stone-500">
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
        <div className="max-w-3xl mx-auto py-6 px-4 sm:py-12 sm:px-12 bg-white dark:bg-[#1a1a1a] shadow-sm border border-stone-200 dark:border-stone-800 min-h-full rounded-sm">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
