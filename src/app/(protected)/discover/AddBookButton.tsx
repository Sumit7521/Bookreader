"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Loader2, Trash2 } from "lucide-react";
import { addPublicBookToLibraryAction } from "@/actions/social";
import { deleteBookAction } from "@/actions/book";
import { useRouter } from "next/navigation";

export function AddBookButton({ originalBookId, initialUserBookId }: { originalBookId: string, initialUserBookId?: string | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(!!initialUserBookId);
  const [newBookId, setNewBookId] = useState<string | null>(initialUserBookId || null);
  const router = useRouter();

  useEffect(() => {
    setIsAdded(!!initialUserBookId);
    setNewBookId(initialUserBookId || null);
  }, [initialUserBookId]);

  const handleAdd = async () => {
    setIsLoading(true);
    const res = await addPublicBookToLibraryAction(originalBookId);
    setIsLoading(false);

    if (res.success && res.newBookId) {
      setIsAdded(true);
      setNewBookId(res.newBookId);
    } else {
      alert(res.error || "Failed to add book to library");
    }
  };

  const handleRemove = async () => {
    if (!newBookId) return;
    if (!confirm("Are you sure you want to remove this book from your library?")) return;
    
    setIsLoading(true);
    const res = await deleteBookAction(newBookId);
    setIsLoading(false);

    if (res.success) {
      setIsAdded(false);
      setNewBookId(null);
      router.refresh();
    } else {
      alert(res.error || "Failed to remove book");
    }
  };

  if (isAdded && newBookId) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        <Button 
          onClick={() => router.push(`/reader/${newBookId}`)}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          size="sm"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Read Now
        </Button>
        <Button 
          onClick={handleRemove}
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="w-full text-xs text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          {isLoading ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : null}
          {isLoading ? "Removing..." : "Remove from Library"}
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleAdd}
      disabled={isLoading}
      variant="outline"
      className="w-full mt-4 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-900/20"
      size="sm"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Plus className="w-4 h-4 mr-2" />
      )}
      {isLoading ? "Adding..." : "Add to Library"}
    </Button>
  );
}
