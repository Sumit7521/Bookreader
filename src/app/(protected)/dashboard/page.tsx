import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookOpen, PenTool, Library, Star, Clock, BookUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import connectToDatabase from "@/lib/db";
import Book from "@/models/Book";
import WritingProject from "@/models/WritingProject";
import Chapter from "@/models/Chapter";
import Review from "@/models/Review";

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " secs ago";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Reader";
  const userId = session?.user?.id;
  const greeting = getGreeting();

  await connectToDatabase();

  // Stats
  const totalBooks = await Book.countDocuments({ userId });
  const writingProjectsCount = await WritingProject.countDocuments({ userId });
  const stats = {
    totalBooks,
    writingProjects: writingProjectsCount,
  };

  // Writing Projects
  const recentProjects = await WritingProject.find({ userId }).sort({ updatedAt: -1 }).limit(3).lean();
  const projectIds = recentProjects.map(p => p._id);
  const wordCounts = await Chapter.aggregate([
    { $match: { projectId: { $in: projectIds } } },
    { $group: { _id: "$projectId", totalWords: { $sum: "$wordCount" } } }
  ]);
  
  const writingProjects = recentProjects.map(p => {
    const words = wordCounts.find(wc => wc._id.toString() === p._id.toString())?.totalWords || 0;
    return {
      id: p._id.toString(),
      title: p.title,
      status: p.status,
      wordCount: words,
      lastEdited: p.updatedAt ? timeAgo(new Date(p.updatedAt)) : "Recently",
    };
  });

  // Currently Reading
  const currentlyReadingBook = await Book.findOne({ userId, status: 'reading' }).sort({ updatedAt: -1 }).lean();
  const currentlyReading = currentlyReadingBook ? {
    title: currentlyReadingBook.title,
    author: currentlyReadingBook.author || "Unknown",
    progress: 0, // Book model doesn't store total pages directly, keeping it simple
    cover: currentlyReadingBook.coverImage || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop",
  } : null;

  // Recently Opened
  const recentBooks = await Book.find({ userId }).sort({ updatedAt: -1 }).limit(4).lean();
  const recentlyOpened = recentBooks.map(b => ({
    id: b._id.toString(),
    title: b.title,
    author: b.author || "Unknown",
    cover: b.coverImage || "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=300&auto=format&fit=crop",
  }));

  // Favorites
  const topReviews = await Review.find({ userId, rating: { $gte: 4 } })
    .sort({ rating: -1, updatedAt: -1 })
    .limit(4)
    .populate('bookId')
    .lean();
    
  let favorites = topReviews.map(r => {
    const b = r.bookId as any;
    if (!b) return null;
    return {
      id: b._id.toString(),
      title: b.title,
      author: b.author || "Unknown",
      cover: b.coverImage || "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=300&auto=format&fit=crop",
    }
  }).filter(Boolean);

  if (favorites.length === 0) {
    const fallbackBooks = await Book.find({ userId, tags: { $regex: /favorite/i } }).limit(4).lean();
    favorites = fallbackBooks.map(b => ({
      id: b._id.toString(),
      title: b.title,
      author: b.author || "Unknown",
      cover: b.coverImage || "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=300&auto=format&fit=crop",
    }));
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-800 dark:text-stone-100">
          {greeting}, {userName}.
        </h1>
        <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400">
          Welcome back to your digital library.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-amber-50/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300">Total Books</CardTitle>
            <Library className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold font-serif">{stats.totalBooks}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300">Writing Projects</CardTitle>
            <PenTool className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold font-serif">{stats.writingProjects}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Reading (Featured) */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700 dark:text-amber-500" />
            <h2 className="text-lg sm:text-xl font-serif text-stone-800 dark:text-stone-100">Currently Reading</h2>
          </div>
          {currentlyReading ? (
            <Card className="overflow-hidden border-stone-200 dark:border-stone-800 shadow-md">
              <div className="flex flex-col sm:flex-row h-full">
                <div className="relative w-full sm:w-40 md:w-48 h-56 sm:h-auto bg-muted shrink-0">
                  <Image
                    src={currentlyReading.cover}
                    alt={currentlyReading.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4 sm:p-6 justify-between bg-white/80 dark:bg-stone-950/80 backdrop-blur-sm">
                  <div className="space-y-1 sm:space-y-2">
                    <Badge variant="secondary" className="mb-1 sm:mb-0 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 w-fit">
                      Active Session
                    </Badge>
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-800 dark:text-stone-100">{currentlyReading.title}</h3>
                    <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400">by {currentlyReading.author}</p>
                  </div>
                  <div className="space-y-3 mt-4 sm:mt-0">
                    {currentlyReading.progress > 0 && (
                      <>
                        <div className="flex justify-between text-sm text-stone-600 dark:text-stone-300">
                          <span>{currentlyReading.progress}% Completed</span>
                        </div>
                        <Progress value={currentlyReading.progress} className="h-2" />
                      </>
                    )}
                    <Link href="/reader" className="text-sm font-medium text-amber-700 dark:text-amber-500 hover:underline pt-2 inline-block">
                      Continue reading &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center p-8 border-stone-200 dark:border-stone-800 shadow-sm border-dashed h-40">
              <p className="text-stone-500 mb-4">You are not currently reading any books.</p>
              <Link href="/library" className="text-sm font-medium text-amber-700 dark:text-amber-500 hover:underline">
                Browse Library
              </Link>
            </Card>
          )}
        </div>

        {/* Writing Projects */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700 dark:text-amber-500" />
            <h2 className="text-lg sm:text-xl font-serif text-stone-800 dark:text-stone-100">Your Projects</h2>
          </div>
          <Card className="border-stone-200 dark:border-stone-800 shadow-sm h-auto lg:h-[calc(100%-2rem)] xl:h-[calc(100%-2.5rem)]">
            <CardContent className="p-0 flex flex-col h-full">
              {writingProjects.map((project, i) => (
                <div key={project.id} className="flex flex-col">
                  <div className="p-3 sm:p-4 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
                    <div className="flex justify-between items-start mb-1 sm:mb-2 gap-2">
                      <Link href="/write" className="font-medium text-sm sm:text-base text-stone-800 dark:text-stone-100 hover:underline leading-snug">
                        {project.title}
                      </Link>
                      <Badge variant="outline" className="text-[9px] sm:text-[10px] uppercase shrink-0 mt-0.5">{project.status}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <BookUp className="h-3 w-3" />
                        {project.wordCount.toLocaleString()} words
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.lastEdited}
                      </span>
                    </div>
                  </div>
                  {i < writingProjects.length - 1 && <Separator />}
                </div>
              ))}
              <div className="mt-auto p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/20">
                <Link href="/write" className="text-sm font-medium text-amber-700 dark:text-amber-500 hover:underline w-full text-center block">
                  View all projects
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Book Shelves */}
      <div className="space-y-6 sm:space-y-8 pt-2 sm:pt-4">
        {/* Recently Opened */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700 dark:text-amber-500" />
            <h2 className="text-lg sm:text-xl font-serif text-stone-800 dark:text-stone-100">Recently Opened</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-4">
              {recentlyOpened.map((book) => (
                <Link key={book.id} href="/library" className="group">
                  <div className="w-[150px] space-y-3">
                    <div className="overflow-hidden rounded-md border border-stone-200 dark:border-stone-800 shadow-sm transition-all group-hover:shadow-md group-hover:border-amber-300 dark:group-hover:border-amber-700 relative aspect-[2/3] bg-muted">
                      <Image
                        src={book.cover}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1 text-sm">
                      <h3 className="font-medium leading-none text-stone-800 dark:text-stone-100 truncate">{book.title}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{book.author}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Favorites */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700 dark:text-amber-500" />
            <h2 className="text-lg sm:text-xl font-serif text-stone-800 dark:text-stone-100">Favorites</h2>
          </div>
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-4">
              {favorites.map((book) => (
                <Link key={book.id} href="/library" className="group">
                  <div className="w-[150px] space-y-3">
                    <div className="overflow-hidden rounded-md border border-stone-200 dark:border-stone-800 shadow-sm transition-all group-hover:shadow-md group-hover:border-amber-300 dark:group-hover:border-amber-700 relative aspect-[2/3] bg-muted">
                      <Image
                        src={book.cover}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1 text-sm">
                      <h3 className="font-medium leading-none text-stone-800 dark:text-stone-100 truncate">{book.title}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{book.author}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
