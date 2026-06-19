import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/auth";
import { logoutAction } from "@/actions/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, BookOpen, LayoutDashboard, Library, PenTool, Settings } from "lucide-react";

import { MobileNav } from "./MobileNav";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <div className="flex w-full items-center justify-between">
        <MobileNav />
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
