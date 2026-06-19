"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, MessageSquare, StickyNote, FileText, Bookmark as BookmarkIcon, ChevronRight } from "lucide-react";
import { getBookmarksAction, addBookmarkAction, deleteBookmarkAction } from "@/actions/bookmarks";

interface Annotation {
  _id: string;
  bookId: string;
  pageNumber: number;
  type: "highlight" | "margin";
  selectedText?: string;
  color?: string;
  note?: string;
  createdAt: string;
}

interface Bookmark {
  _id: string;
  pageNumber: number;
  label?: string;
}

interface AnnotationsSidebarProps {
  bookId: string;
  annotations: Annotation[];
  currentPage: number;
  onAddMarginNote: (note: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateNote: (id: string, note: string) => Promise<void>;
  onJumpToPage: (page: number) => void;
  className?: string;
}

const colorMap: Record<string, string> = {
  yellow: "bg-yellow-200 border-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-700",
  pink: "bg-pink-200 border-pink-300 dark:bg-pink-900/40 dark:border-pink-700",
  blue: "bg-blue-200 border-blue-300 dark:bg-blue-900/40 dark:border-blue-700",
  green: "bg-green-200 border-green-300 dark:bg-green-900/40 dark:border-green-700",
};

export function AnnotationsSidebar({
  bookId,
  annotations,
  currentPage,
  onAddMarginNote,
  onDelete,
  onUpdateNote,
  onJumpToPage,
  className
}: AnnotationsSidebarProps) {
  const [newMarginNote, setNewMarginNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [newBookmarkLabel, setNewBookmarkLabel] = useState("");

  // Fetch bookmarks
  useEffect(() => {
    getBookmarksAction(bookId).then(res => {
      if (res.success) setBookmarks(res.bookmarks);
    });
  }, [bookId]);

  // Notes tab logic
  const pageAnnotations = annotations.filter(a => a.pageNumber === currentPage);

  const handleAddMarginNote = async () => {
    if (!newMarginNote.trim()) return;
    await onAddMarginNote(newMarginNote);
    setNewMarginNote("");
  };

  const startEditing = (anno: Annotation) => {
    setEditingId(anno._id);
    setEditNoteText(anno.note || "");
  };

  const saveEdit = async (id: string) => {
    await onUpdateNote(id, editNoteText);
    setEditingId(null);
  };

  // Bookmarks tab logic
  const handleAddBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkLabel.trim()) return;
    const res = await addBookmarkAction(bookId, currentPage, newBookmarkLabel);
    if (res.success && res.bookmark) {
      setBookmarks(prev => [...prev, res.bookmark].sort((a, b) => a.pageNumber - b.pageNumber));
      setNewBookmarkLabel("");
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    setBookmarks(prev => prev.filter(b => b._id !== id));
    await deleteBookmarkAction(id);
  };

  return (
    <div className={className || "w-80 flex-shrink-0 bg-[#fdfbf7] dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex flex-col h-full overflow-hidden"}>
      <Tabs defaultValue="notes" className="flex flex-col h-full w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-stone-200 dark:border-stone-800 bg-transparent h-12 p-0">
          <TabsTrigger value="notes" className="flex-1 h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:shadow-none data-[state=active]:bg-stone-50 dark:data-[state=active]:bg-stone-900/50 text-stone-600 dark:text-stone-400">
            <FileText className="h-4 w-4 mr-2" /> Notes
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex-1 h-full rounded-none data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:shadow-none data-[state=active]:bg-stone-50 dark:data-[state=active]:bg-stone-900/50 text-stone-600 dark:text-stone-400">
            <BookmarkIcon className="h-4 w-4 mr-2" /> Bookmarks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="flex-1 flex flex-col min-h-0 m-0 border-0 outline-none data-[state=inactive]:hidden">
          <div className="p-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Page {currentPage}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {pageAnnotations.length === 0 ? (
              <div className="text-center text-stone-500 text-sm mt-8">
                No annotations on this page yet. Highlight text or add a margin note below.
              </div>
            ) : (
              pageAnnotations.map((anno) => (
                <div key={anno._id} className={`p-3 rounded-md border text-sm ${anno.type === 'highlight' && anno.color ? colorMap[anno.color] : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800'}`}>
                  
                  {anno.type === 'highlight' && (
                    <blockquote className="border-l-2 border-stone-400 pl-2 italic text-stone-700 dark:text-stone-300 mb-2">
                      &quot;{anno.selectedText}&quot;
                    </blockquote>
                  )}

                  {editingId === anno._id ? (
                    <div className="mt-2 space-y-2">
                      <Textarea 
                        value={editNoteText} 
                        onChange={(e) => setEditNoteText(e.target.value)}
                        className="min-h-[60px] text-xs bg-white dark:bg-stone-950"
                        placeholder="Add a comment..."
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                        <Button size="sm" className="h-7 text-xs" onClick={() => saveEdit(anno._id)}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 mt-1">
                      <div className="flex-1">
                        {anno.note ? (
                          <p className="text-stone-800 dark:text-stone-200">{anno.note}</p>
                        ) : (
                          <button className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 flex items-center gap-1" onClick={() => startEditing(anno)}>
                            <MessageSquare className="h-3 w-3" /> Add comment
                          </button>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {anno.note && (
                          <button className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-300" onClick={() => startEditing(anno)}>
                            <MessageSquare className="h-3 w-3" />
                          </button>
                        )}
                        <button className="text-stone-400 hover:text-red-500 transition-colors" onClick={() => onDelete(anno._id)}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-950/50 border-t border-stone-200 dark:border-stone-800">
            <label className="text-xs font-medium text-stone-500 mb-2 flex items-center gap-1">
              <StickyNote className="h-3 w-3" /> New Margin Note
            </label>
            <Textarea 
              value={newMarginNote}
              onChange={(e) => setNewMarginNote(e.target.value)}
              placeholder="Type your thoughts here..."
              className="min-h-[80px] bg-white dark:bg-stone-900 text-sm mb-2"
            />
            <Button className="w-full h-8 text-sm" onClick={handleAddMarginNote} disabled={!newMarginNote.trim()}>
              Save Note
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="bookmarks" className="flex-1 flex flex-col min-h-0 m-0 border-0 outline-none data-[state=inactive]:hidden">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50">
            <form onSubmit={handleAddBookmark} className="space-y-2">
              <label className="text-xs font-medium text-stone-500">Bookmark Page {currentPage}</label>
              <div className="flex gap-2">
                <Input 
                  value={newBookmarkLabel}
                  onChange={(e) => setNewBookmarkLabel(e.target.value)}
                  placeholder="e.g. Important Quote"
                  className="h-8 text-sm bg-white dark:bg-stone-950"
                />
                <Button type="submit" size="sm" className="h-8" disabled={!newBookmarkLabel.trim()}>Add</Button>
              </div>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {bookmarks.length === 0 ? (
              <div className="text-center text-stone-500 text-sm mt-8">
                No bookmarks added yet.
              </div>
            ) : (
              bookmarks.map((bookmark) => (
                <div key={bookmark._id} className="group flex items-center justify-between p-3 rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                  <button 
                    className="flex-1 text-left flex flex-col min-w-0"
                    onClick={() => onJumpToPage(bookmark.pageNumber)}
                  >
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate w-full pr-2">
                      {bookmark.label}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center mt-1">
                      Page {bookmark.pageNumber} <ChevronRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                  <button 
                    className="p-1.5 text-stone-400 hover:text-red-500 transition-colors rounded-sm hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => handleDeleteBookmark(bookmark._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
