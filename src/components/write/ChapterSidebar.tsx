"use client";

import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createChapterAction, deleteChapterAction, renameChapterAction, reorderChaptersAction } from "@/actions/write";

type ChapterType = { _id: string, title: string, order: number };

function SortableChapterItem({ chapter, projectId, isActive, onDelete, onRename }: { chapter: ChapterType, projectId: string, isActive: boolean, onDelete: (id: string) => void, onRename: (id: string, newTitle: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: chapter._id });
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRename = async () => {
    if (editTitle.trim() && editTitle !== chapter.title) {
      await onRename(chapter._id, editTitle);
    }
    setIsEditing(false);
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-1 p-2 rounded-md transition-colors ${isActive ? "bg-amber-100 dark:bg-amber-900/40" : "hover:bg-stone-100 dark:hover:bg-stone-800"}`}>
      <button {...attributes} {...listeners} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-grab active:cursor-grabbing p-1">
        <GripVertical className="w-4 h-4" />
      </button>

      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <Input 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)} 
            className="h-7 text-sm py-1 px-2" 
            autoFocus 
            onKeyDown={(e) => { 
              if (e.key === "Enter") handleRename(); 
              if (e.key === "Escape") { setIsEditing(false); setEditTitle(chapter.title); } 
            }} 
          />
          <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600" onClick={handleRename}><Check className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-stone-400" onClick={() => { setIsEditing(false); setEditTitle(chapter.title); }}><X className="w-4 h-4" /></Button>
        </div>
      ) : (
        <Link href={`/write/${projectId}/${chapter._id}`} className={`flex-1 text-sm truncate font-medium ${isActive ? "text-amber-900 dark:text-amber-100" : "text-stone-700 dark:text-stone-300"}`}>
          {chapter.title}
        </Link>
      )}

      {!isEditing && (
        <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity" style={{ opacity: isActive ? 1 : undefined }}>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200" onClick={() => setIsEditing(true)}>
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => onDelete(chapter._id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function ChapterSidebar({ projectId, initialChapters, activeChapterId, className }: { projectId: string, initialChapters: ChapterType[], activeChapterId: string, className?: string }) {
  const [chapters, setChapters] = useState(initialChapters);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setChapters((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const newIds = newItems.map(c => c._id);
        reorderChaptersAction(projectId, newIds).catch(console.error);

        return newItems;
      });
    }
  };

  const handleAddChapter = async () => {
    setIsCreating(true);
    const title = `Chapter ${chapters.length + 1}`;
    const res = await createChapterAction(projectId, title);
    if (res.success && res.chapter) {
      setChapters([...chapters, res.chapter]);
      router.push(`/write/${projectId}/${res.chapter._id}`);
    }
    setIsCreating(false);
  };

  const handleDeleteChapter = async (id: string) => {
    if (confirm("Are you sure you want to delete this chapter?")) {
      await deleteChapterAction(id, projectId);
      setChapters(chapters.filter((c) => c._id !== id));
      if (activeChapterId === id) {
        router.push(`/write/${projectId}`);
      }
    }
  };

  const handleRenameChapter = async (id: string, newTitle: string) => {
    await renameChapterAction(id, newTitle);
    setChapters(chapters.map(c => c._id === id ? { ...c, title: newTitle } : c));
  };

  return (
    <div className={`${className || "flex w-64"} h-full border-r border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#151515] flex-col pt-4 shrink-0`}>
      <div className="px-4 pb-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200 text-sm tracking-wide uppercase">Chapters</h3>
        <Button variant="ghost" size="icon" onClick={handleAddChapter} disabled={isCreating} className="h-6 w-6 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-200/50 dark:bg-stone-800/50">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={chapters.map(c => c._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="group">
                  <SortableChapterItem 
                    chapter={chapter} 
                    projectId={projectId} 
                    isActive={chapter._id === activeChapterId} 
                    onDelete={handleDeleteChapter}
                    onRename={handleRenameChapter}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
