"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Book, PenTool, MessageSquare, Bookmark, Loader2, Search } from "lucide-react";
import { globalSearchAction, SearchResult } from "@/actions/search";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, SearchResult[]>>({});
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults({});
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      const res = await globalSearchAction(query);
      if (res.success && res.results) {
        setResults(res.results);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const onSelect = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setOpen(false)}>
      <div className="w-full max-w-2xl px-4" onClick={(e) => e.stopPropagation()}>
        <Command 
          className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col"
          shouldFilter={false} // Backend handles filtering
          loop
          onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
        >
          <div className="flex items-center px-4 border-b border-stone-200 dark:border-stone-800">
            <Search className="w-5 h-5 text-stone-400 mr-2 shrink-0" />
            <Command.Input 
              autoFocus 
              placeholder="Search books, authors, notes, projects... (CMD+K)" 
              value={query} 
              onValueChange={setQuery} 
              className="flex-1 h-14 bg-transparent outline-none text-stone-800 dark:text-stone-100 placeholder:text-stone-400"
            />
            {loading && <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />}
            <button className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-1 rounded ml-2 border border-stone-200 dark:border-stone-700" onClick={() => setOpen(false)}>ESC</button>
          </div>

          <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-stone-700">
            {!loading && query && Object.values(results).every(arr => !arr || arr.length === 0) && (
              <div className="p-8 text-center text-stone-500">No results found for &quot;{query}&quot;.</div>
            )}
            
            {results.books && results.books.length > 0 && (
              <Command.Group heading={<div className="px-2 py-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-2 mb-1">Library</div>}>
                {results.books.map((item) => (
                  <Command.Item 
                    key={item.id} 
                    onSelect={() => onSelect(item.url)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/50 aria-selected:bg-stone-100 dark:aria-selected:bg-stone-800/50 transition-colors"
                  >
                    <Book className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">{item.title}</span>
                      {item.description && <span className="text-xs text-stone-500 truncate">{item.description}</span>}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.projects && results.projects.length > 0 && (
              <Command.Group heading={<div className="px-2 py-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-2 mb-1">Writing Projects</div>}>
                {results.projects.map((item) => (
                  <Command.Item 
                    key={item.id} 
                    onSelect={() => onSelect(item.url)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/50 aria-selected:bg-stone-100 dark:aria-selected:bg-stone-800/50 transition-colors"
                  >
                    <PenTool className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">{item.title}</span>
                      {item.description && <span className="text-xs text-stone-500 truncate">{item.description}</span>}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.annotations && results.annotations.length > 0 && (
              <Command.Group heading={<div className="px-2 py-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-2 mb-1">Notes & Annotations</div>}>
                {results.annotations.map((item) => (
                  <Command.Item 
                    key={item.id} 
                    onSelect={() => onSelect(item.url)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/50 aria-selected:bg-stone-100 dark:aria-selected:bg-stone-800/50 transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">{item.title}</span>
                      {item.description && <span className="text-xs text-stone-500 truncate">{item.description}</span>}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.reviews && results.reviews.length > 0 && (
              <Command.Group heading={<div className="px-2 py-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mt-2 mb-1">Reviews</div>}>
                {results.reviews.map((item) => (
                  <Command.Item 
                    key={item.id} 
                    onSelect={() => onSelect(item.url)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/50 aria-selected:bg-stone-100 dark:aria-selected:bg-stone-800/50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">{item.title}</span>
                      {item.description && <span className="text-xs text-stone-500 truncate">{item.description}</span>}
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
