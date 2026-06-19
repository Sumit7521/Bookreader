"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import { addPublicBookToLibraryAction } from "@/actions/social";
import { useRouter } from "next/navigation";

export function AddBookButton({ originalBookId }: { originalBookId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [newBookId, setNewBookId] = useState<string | null>(null);
  const router = useRouter();

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

  if (isAdded && newBookId) {
    return (
      <Button 
        onClick={() => router.push(`/reader/${newBookId}`)}
        className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white"
        size="sm"
      >
        <BookOpen className="w-4 h-4 mr-2" />
        Read Now
      </Button>
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
