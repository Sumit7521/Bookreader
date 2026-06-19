import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookOpen, PenTool, Library, Star, Clock, BookUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock Data
const currentlyReading = {
  title: "The Name of the Wind",
  author: "Patrick Rothfuss",
  progress: 68,
  cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300&auto=format&fit=crop",
};

const recentlyOpened = [
  { id: 1, title: "Dune", author: "Frank Herbert", cover: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=300&auto=format&fit=crop" },
  { id: 2, title: "1984", author: "George Orwell", cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=300&auto=format&fit=crop" },
  { id: 3, title: "Project Hail Mary", author: "Andy Weir", cover: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=300&auto=format&fit=crop" },
  { id: 4, title: "Fahrenheit 451", author: "Ray Bradbury", cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=300&auto=format&fit=crop" },
];

const favorites = [
  { id: 4, title: "The Hobbit", author: "J.R.R. Tolkien", cover: "https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=300&auto=format&fit=crop" },
  { id: 5, title: "Pride and Prejudice", author: "Jane Austen", cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop" },
];

const writingProjects = [
  { id: 1, title: "The Midnight Library", status: "Draft", wordCount: 15420, lastEdited: "2 hours ago" },
  { id: 2, title: "Sci-Fi Short Story", status: "Outlining", wordCount: 3200, lastEdited: "Yesterday" },
];

const stats = {
  totalBooks: 142,
  writingProjects: 2,
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Reader";
  const greeting = getGreeting();

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-serif text-stone-800 dark:text-stone-100">
          {greeting}, {userName}.
        </h1>
        <p className="text-stone-500 dark:text-stone-400">
          Welcome back to your digital library.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-amber-50/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">Total Books</CardTitle>
            <Library className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{stats.totalBooks}</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">Writing Projects</CardTitle>
            <PenTool className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-serif">{stats.writingProjects}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Reading (Featured) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100">Currently Reading</h2>
          </div>
          <Card className="overflow-hidden border-stone-200 dark:border-stone-800 shadow-md">
            <div className="flex flex-col sm:flex-row h-full">
              <div className="relative w-full sm:w-48 h-64 sm:h-auto bg-muted shrink-0">
                <Image 
                  src={currentlyReading.cover} 
                  alt={currentlyReading.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col flex-1 p-6 justify-between bg-white/80 dark:bg-stone-950/80 backdrop-blur-sm">
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100">
                    Active Session
                  </Badge>
                  <h3 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100">{currentlyReading.title}</h3>
                  <p className="text-stone-500 dark:text-stone-400">by {currentlyReading.author}</p>
                </div>
                <div className="space-y-3 mt-6 sm:mt-0">
                  <div className="flex justify-between text-sm text-stone-600 dark:text-stone-300">
                    <span>{currentlyReading.progress}% Completed</span>
                  </div>
                  <Progress value={currentlyReading.progress} className="h-2" />
                  <Link href="/reader" className="text-sm font-medium text-amber-700 dark:text-amber-500 hover:underline pt-2 inline-block">
                    Continue reading &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Writing Projects */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100">Your Projects</h2>
          </div>
          <Card className="border-stone-200 dark:border-stone-800 shadow-sm h-[calc(100%-2.5rem)]">
            <CardContent className="p-0 flex flex-col h-full">
              {writingProjects.map((project, i) => (
                <div key={project.id} className="flex flex-col">
                  <div className="p-4 hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <Link href="/write" className="font-medium text-stone-800 dark:text-stone-100 hover:underline">
                        {project.title}
                      </Link>
                      <Badge variant="outline" className="text-[10px] uppercase">{project.status}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
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
      <div className="space-y-8 pt-4">
        {/* Recently Opened */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100">Recently Opened</h2>
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
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-700 dark:text-amber-500" />
            <h2 className="text-xl font-serif text-stone-800 dark:text-stone-100">Favorites</h2>
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
