import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/auth";
import { logoutAction } from "@/actions/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, LayoutDashboard, Library, PenTool, Settings } from "lucide-react";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " md:hidden"} aria-label="Open mobile menu">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-stone-50 dark:bg-stone-950 p-6">
              <div className="flex items-center gap-2 font-bold text-lg mb-8 text-[var(--accent-color,#f59e0b)]">
                <BookOpen className="w-6 h-6" />
                BookReader
              </div>
              <nav className="flex flex-col gap-4 text-sm font-medium">
                <Link href="/dashboard" className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-[var(--accent-color,#f59e0b)]"><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>
                <Link href="/library" className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-[var(--accent-color,#f59e0b)]"><Library className="w-5 h-5" /> Library</Link>
                <Link href="/reader" className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-[var(--accent-color,#f59e0b)]"><BookOpen className="w-5 h-5" /> Reader</Link>
                <Link href="/write" className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-[var(--accent-color,#f59e0b)]"><PenTool className="w-5 h-5" /> Write</Link>
                <Link href="/settings" className="flex items-center gap-3 text-stone-600 dark:text-stone-400 hover:text-[var(--accent-color,#f59e0b)]"><Settings className="w-5 h-5" /> Settings</Link>
              </nav>
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg text-[var(--accent-color,#f59e0b)] hidden xs:inline-block">BookReader</span>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium hidden sm:inline-block">
                {session.user.name || session.user.email}
              </span>
              <form action={logoutAction}>
                <button type="submit" className={buttonVariants({ variant: "ghost" })}>
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>Login</Link>
              <Link href="/register" className={buttonVariants({ variant: "default" })}>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
