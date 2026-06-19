import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Book as BookIcon } from "lucide-react";

interface BookCardProps {
  book: {
    _id: string;
    title: string;
    author?: string;
    coverImage?: string;
    status: string;
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
          <div className="absolute top-2 right-2">
            <Badge className="bg-black/60 hover:bg-black/80 text-white border-0 text-[10px]">
              {statusLabels[book.status]}
            </Badge>
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
