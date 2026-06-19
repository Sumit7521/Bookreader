"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Library, PenTool, Settings, Compass } from "lucide-react";

export function Sidebar() {
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
    <aside className="hidden md:flex flex-col border-r border-stone-200/60 dark:border-stone-800/60 bg-stone-50 dark:bg-[#0a0a0a] w-64 h-full flex-shrink-0 shadow-sm z-10">
      <div className="flex h-14 items-center px-6 lg:h-[60px] border-b border-stone-200/60 dark:border-stone-800/60">
        <Link href="/dashboard" className="flex items-center gap-2 font-serif font-bold text-xl text-amber-600 dark:text-amber-500 transition-opacity hover:opacity-80">
          <BookOpen className="w-6 h-6" />
          <span>BookReader</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-amber-100/80 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm" 
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-amber-600 dark:text-amber-500" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-stone-200/60 dark:border-stone-800/60 text-xs text-stone-400 text-center">
        BookReader &copy; {new Date().getFullYear()}
      </div>
    </aside>
  );
}
