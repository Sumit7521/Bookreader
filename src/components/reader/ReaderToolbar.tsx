import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Search, 
  X,
  PanelRight
} from "lucide-react";
import { useState } from "react";

interface ReaderToolbarProps {
  pageNumber: number;
  numPages: number | null;
  scale: number;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
  onSearch: (text: string) => void;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

export function ReaderToolbar({
  pageNumber,
  numPages,
  scale,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onSearch,
  showSidebar,
  onToggleSidebar
}: ReaderToolbarProps) {
  const [jumpTo, setJumpTo] = useState("");
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpTo, 10);
    if (p && p > 0 && (!numPages || p <= numPages)) {
      onPageChange(p);
      setJumpTo("");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchText);
  };

  const clearSearch = () => {
    setSearchText("");
    onSearch("");
    setIsSearching(false);
  };

  return (
    <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2 bg-[#fdfbf7] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-sm z-10 sticky top-0">
      
      {/* Search */}
      <div className="flex-1 flex justify-center w-full sm:w-auto max-w-sm">
        {isSearching ? (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1 w-full relative">
            <Input 
              autoFocus
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search..."
              className="pr-8 bg-white dark:bg-stone-950 h-8 text-sm"
            />
            {searchText && (
              <Button type="button" variant="ghost" size="icon" className="absolute right-8 h-6 w-6" onClick={clearSearch}>
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button type="submit" size="sm" variant="secondary" className="h-8 px-2 text-xs">Find</Button>
          </form>
        ) : (
          <Button variant="ghost" size="sm" className="text-stone-500 h-8 px-2 text-xs w-full justify-start sm:justify-center sm:w-auto" onClick={() => setIsSearching(true)}>
            <Search className="h-4 w-4 sm:mr-2" />
            <span className="inline">Search PDF</span>
          </Button>
        )}
      </div>

      {/* Right - View Controls */}
      <div className="flex items-center gap-1">
        <div className="flex items-center bg-white dark:bg-stone-950 rounded-md border border-stone-200 dark:border-stone-800 p-0.5">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={onZoomOut}>
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[10px] font-medium w-9 text-center hidden xs:inline-block">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={onZoomIn}>
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
        <Button variant="outline" size="icon" className="h-8 w-8 flex" onClick={onFullscreen} title="Toggle fullscreen">
          <Maximize className="h-3.5 w-3.5" />
        </Button>
        <Button 
          variant={showSidebar ? "secondary" : "outline"} 
          size="icon" 
          className="h-8 w-8"
          onClick={onToggleSidebar}
          title={showSidebar ? "Hide sidebar" : "Show sidebar"}
        >
          <PanelRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
