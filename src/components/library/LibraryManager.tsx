"use client";

import { useState } from "react";
import { BookCard } from "./BookCard";
import { UploadBookModal } from "./UploadBookModal";
import { CreateFolderModal } from "./CreateFolderModal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutGrid, List as ListIcon, Folder as FolderIcon, BookUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LibraryData {
  folders: { _id: string; name: string; libraryFolderType?: string }[];
  books: { _id: string; title: string; author?: string; status: string; coverImage?: string; folderId?: string; createdAt: string }[];
}

export function LibraryManager({ initialData }: { initialData: LibraryData }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("recently_added");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const { folders, books } = initialData;

  // Filter books by current folder (null means root, so show books without folder, or show all? Let's show all books in root for simplicity, or just those without a folder)
  // Actually, standard behavior: root shows folders and books not in any folder.
  const displayedFolders = currentFolder ? [] : folders;
  let displayedBooks = books.filter(b => currentFolder ? b.folderId === currentFolder : !b.folderId);

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
          <UploadBookModal folders={folders} />
          <CreateFolderModal />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v || "recently_added")}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-stone-950">
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

      {/* Breadcrumb / Navigation (Optional simple version) */}
      {currentFolder && (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <button onClick={() => setCurrentFolder(null)} className="hover:text-stone-800 dark:hover:text-stone-100 hover:underline">
            Library
          </button>
          <span>/</span>
          <span className="font-medium text-stone-800 dark:text-stone-100">
            {folders.find(f => f._id === currentFolder)?.name}
          </span>
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
