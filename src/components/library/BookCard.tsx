"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Book as BookIcon, Heart } from "lucide-react";
import { toggleFavoriteAction } from "@/actions/book";
import { useTransition, useState } from "react";

interface BookCardProps {
  book: {
    _id: string;
    title: string;
    author?: string;
    coverImage?: string;
    status: string;
    tags?: string[];
  };
  view: "grid" | "list";
}

export function BookCard({ book, view }: BookCardProps) {
  const statusLabels: Record<string, string> = {
    not_started: "Not Started",
    reading: "Reading",
    finished: "Finished",
    dnf: "DNF",
  };

  const [isPending, startTransition] = useTransition();
  const [isFavorite, setIsFavorite] = useState(book.tags?.some(t => t.toLowerCase() === 'favorite') || false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    
    startTransition(async () => {
      const res = await toggleFavoriteAction(book._id);
      if (res.error) {
        setIsFavorite(!newStatus);
      }
    });
  };

  if (view === "list") {
    return (
      <Link href={`/library/${book._id}`}>
        <Card className="flex flex-row items-center p-3 gap-4 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors border-stone-200 dark:border-stone-800">
          <div className="relative w-12 h-16 bg-muted shrink-0 rounded-sm overflow-hidden flex items-center justify-center">
            {book.coverImage ? (
              <Image src={book.coverImage} alt={book.title} fill sizes="48px" className="object-cover" />
            ) : (
              <BookIcon className="h-6 w-6 text-stone-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-medium text-stone-800 dark:text-stone-100 truncate">{book.title}</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 truncate">{book.author || "Unknown Author"}</p>
          </div>
          <button 
             onClick={handleFavoriteClick}
             disabled={isPending}
             className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors shrink-0"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-stone-400"}`} />
          </button>
          <Badge variant="outline" className="hidden sm:inline-flex whitespace-nowrap">
            {statusLabels[book.status] || book.status}
          </Badge>
        </Card>
      </Link>
    );
  }

  // Grid View
  return (
    <Link href={`/library/${book._id}`} className="group h-full">
      <Card className="flex flex-col h-full overflow-hidden border-stone-200 dark:border-stone-800 transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 bg-white/80 dark:bg-stone-900/80">
        <div className="relative aspect-[2/3] w-full bg-muted flex items-center justify-center">
          {book.coverImage ? (
            <Image src={book.coverImage} alt={book.title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw" className="object-cover transition-transform group-hover:scale-105" />
          ) : (
            <BookIcon className="h-12 w-12 text-stone-400" />
          )}
          <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
            <Badge className="bg-black/60 hover:bg-black/80 text-white border-0 text-[10px]">
              {statusLabels[book.status]}
            </Badge>
            <button 
               onClick={handleFavoriteClick}
               disabled={isPending}
               className="bg-black/40 hover:bg-black/60 p-1.5 rounded-full backdrop-blur-sm transition-colors"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-white/80"}`} />
            </button>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-serif font-medium leading-tight text-stone-800 dark:text-stone-100 line-clamp-2 mb-1" title={book.title}>
            {book.title}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 truncate mt-auto">
            {book.author || "Unknown Author"}
          </p>
        </div>
      </Card>
    </Link>
  );
}
