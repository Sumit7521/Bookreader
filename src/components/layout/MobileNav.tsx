"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { Menu, BookOpen, LayoutDashboard, Library, PenTool, Settings, Compass } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/library", label: "Library", icon: Library },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/reader", label: "Reader", icon: BookOpen },
    { href: "/write", label: "Write", icon: PenTool },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="md:hidden flex items-center gap-2">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " md:hidden"} aria-label="Open mobile menu">
          <Menu className="w-5 h-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] bg-stone-50 dark:bg-[#0a0a0a] p-0 border-r border-stone-200 dark:border-stone-800 shadow-2xl">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="p-6 pb-6 border-b border-stone-200/60 dark:border-stone-800/60">
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 font-serif font-bold text-2xl text-amber-600 dark:text-amber-500 transition-opacity hover:opacity-80">
                <BookOpen className="w-7 h-7" />
                <span>BookReader</span>
              </Link>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 active:scale-95 ${
                      isActive 
                        ? "bg-amber-100/80 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm" 
                        : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-amber-600 dark:text-amber-500" : ""}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-stone-200/60 dark:border-stone-800/60 text-xs text-stone-400 text-center">
              BookReader &copy; {new Date().getFullYear()}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <span className="font-serif font-bold text-xl text-amber-600 dark:text-amber-500 hidden xs:inline-block ml-1">BookReader</span>
    </div>
  );
}
