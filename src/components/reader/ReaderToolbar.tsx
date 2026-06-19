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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-[#fdfbf7] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-sm z-10 sticky top-0">
      
      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <form onSubmit={handleJump} className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap hidden sm:inline">Page</span>
          <Input 
            value={jumpTo}
            onChange={(e) => setJumpTo(e.target.value)}
            placeholder={pageNumber.toString()}
            className="w-16 h-9 text-center bg-white dark:bg-stone-950"
          />
          <span className="text-sm font-medium whitespace-nowrap">of {numPages || "?"}</span>
        </form>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={numPages ? pageNumber >= numPages : false}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Center - Search */}
      <div className="flex-1 w-full max-w-sm flex justify-center">
        {isSearching ? (
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-1 w-full relative">
            <Input 
              autoFocus
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search text..."
              className="pr-8 bg-white dark:bg-stone-950 h-9"
            />
            {searchText && (
              <Button type="button" variant="ghost" size="icon" className="absolute right-8 h-7 w-7" onClick={clearSearch}>
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button type="submit" size="sm" variant="secondary" className="h-9">Find</Button>
          </form>
        ) : (
          <Button variant="ghost" className="text-stone-500 w-full sm:w-auto" onClick={() => setIsSearching(true)}>
            <Search className="h-4 w-4 mr-2" />
            Search inside PDF
          </Button>
        )}
      </div>

      {/* Right - View Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-white dark:bg-stone-950 rounded-md border border-stone-200 dark:border-stone-800 p-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={onZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm" onClick={onZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="icon" onClick={onFullscreen} title="Toggle fullscreen">
          <Maximize className="h-4 w-4" />
        </Button>
        <Button 
          variant={showSidebar ? "secondary" : "outline"} 
          size="icon" 
          onClick={onToggleSidebar}
          title={showSidebar ? "Hide sidebar" : "Show sidebar"}
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
