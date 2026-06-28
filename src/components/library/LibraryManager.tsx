"use client";

import { useState, useTransition } from "react";
import { deleteFolderAction } from "@/actions/library";
import { BookCard } from "./BookCard";
import { UploadBookModal } from "./UploadBookModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LayoutGrid, List as ListIcon, Folder as FolderIcon, BookUp, Search, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LibraryData {
  folders: { _id: string; name: string; libraryFolderType?: string }[];
  books: { _id: string; title: string; author?: string; status: string; coverImage?: string; folderId?: string; createdAt: string; tags: string[] }[];
}

export function LibraryManager({ initialData }: { initialData: LibraryData }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("recently_added");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all_tags");
  const [isPending, startTransition] = useTransition();

  const { folders, books } = initialData;

  // Extract all unique tags and authors
  const allTags = Array.from(new Set(books.flatMap(b => b.tags || []))).sort();
  const allAuthors = Array.from(new Set(books.map(b => b.author).filter(Boolean))).sort() as string[];

  // Filter books by current folder (null means root, so show books without folder, or show all? Let's show all books in root for simplicity, or just those without a folder)
  // Actually, standard behavior: root shows folders and books not in any folder.
  const displayedFolders = currentFolder && !searchQuery && selectedTag === "all_tags" ? [] : folders.filter(f => !searchQuery && selectedTag === "all_tags");
  let displayedBooks = books.filter(b => {
    // If searching or filtering by tag, ignore folders completely and search globally
    if (searchQuery || selectedTag !== "all_tags") {
      const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (b.author || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === "all_tags" || (b.tags && b.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    }
    return currentFolder ? b.folderId === currentFolder : !b.folderId;
  });

  // Sorting
  displayedBooks = [...displayedBooks].sort((a, b) => {
    switch (sortBy) {
      case "title": return a.title.localeCompare(b.title);
      case "author": return (a.author || "").localeCompare(b.author || "");
      case "status": return a.status.localeCompare(b.status);
      case "recently_added":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-stone-900/50 p-4 rounded-lg border border-stone-200 dark:border-stone-800 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <UploadBookModal folders={folders} authors={allAuthors} />
          <CreateFolderModal />
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-500" />
            <Input 
              type="text" 
              placeholder="Search books..." 
              className="w-[180px] pl-9 bg-white dark:bg-stone-950" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedTag} onValueChange={(v) => setSelectedTag(v || "all_tags")}>
            <SelectTrigger className="w-[130px] bg-white dark:bg-stone-950">
              <SelectValue placeholder="Filter Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_tags">All Tags</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v || "recently_added")}>
            <SelectTrigger className="w-[150px] bg-white dark:bg-stone-950">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recently_added">Recently Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="status">Reading Status</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")}>
            <TabsList className="bg-stone-200/50 dark:bg-stone-800/50">
              <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="list"><ListIcon className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Breadcrumb / Navigation */}
      {currentFolder && (
        <div className="flex items-center justify-between w-full px-3 py-2 bg-stone-50/50 dark:bg-stone-900/30 rounded-md border border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <button onClick={() => setCurrentFolder(null)} className="hover:text-stone-800 dark:hover:text-stone-100 hover:underline font-medium">
              Library
            </button>
            <span>/</span>
            <span className="font-medium text-stone-800 dark:text-stone-100">
              {folders.find(f => f._id === currentFolder)?.name}
            </span>
          </div>
          
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this folder? Any books inside will be moved to the root library.")) {
                startTransition(async () => {
                  const res = await deleteFolderAction(currentFolder);
                  if (res?.success) {
                    setCurrentFolder(null);
                  }
                });
              }
            }}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 px-2 py-1.5 rounded transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Folder
          </button>
        </div>
      )}

      {/* Content Area */}
      {displayedFolders.length === 0 && displayedBooks.length === 0 ? (
        <div className="text-center py-20">
          <BookUp className="h-12 w-12 mx-auto text-stone-300 dark:text-stone-600 mb-4" />
          <h3 className="text-xl font-serif text-stone-800 dark:text-stone-100">Your library is empty</h3>
          <p className="text-stone-500 dark:text-stone-400 mt-2">Upload your first PDF book or create a folder to get started.</p>
        </div>
      ) : (
        <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6" : "space-y-2"}>
          
          {/* Render Folders First */}
          {displayedFolders.map(folder => (
            view === "grid" ? (
              <Card 
                key={folder._id} 
                onClick={() => setCurrentFolder(folder._id)}
                className="flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 border-stone-200 dark:border-stone-800 transition-colors bg-white/50 dark:bg-stone-950/50 aspect-square"
              >
                <FolderIcon className="h-12 w-12 text-amber-600/70 dark:text-amber-500/70 mb-3" />
                <span className="font-serif font-medium text-stone-800 dark:text-stone-100 text-center line-clamp-2">{folder.name}</span>
                <span className="text-xs text-stone-500 capitalize mt-1 border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded-full">{folder.libraryFolderType}</span>
              </Card>
            ) : (
              <Card 
                key={folder._id} 
                onClick={() => setCurrentFolder(folder._id)}
                className="flex flex-row items-center p-4 gap-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 border-stone-200 dark:border-stone-800 transition-colors bg-white/50 dark:bg-stone-950/50"
              >
                <FolderIcon className="h-6 w-6 text-amber-600/70 dark:text-amber-500/70" />
                <span className="font-serif font-medium text-stone-800 dark:text-stone-100 flex-1">{folder.name}</span>
                <span className="text-xs text-stone-500 capitalize border border-stone-200 dark:border-stone-700 px-2 py-0.5 rounded-full">{folder.libraryFolderType}</span>
              </Card>
            )
          ))}

          {/* Render Books */}
          {displayedBooks.map(book => (
            <BookCard key={book._id} book={book} view={view} />
          ))}
        </div>
      )}
    </div>
  );
}
