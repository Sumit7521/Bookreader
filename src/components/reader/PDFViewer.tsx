"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ReaderToolbar } from "./ReaderToolbar";
import { AnnotationsSidebar } from "./AnnotationsSidebar";
import { saveReadingProgressAction } from "@/actions/reader";
import { getAnnotationsAction, saveAnnotationAction, deleteAnnotationAction, updateAnnotationNoteAction } from "@/actions/annotations";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  bookId: string;
  fileUrl: string;
  initialPage: number;
}

export function PDFViewer({ bookId, fileUrl, initialPage }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(initialPage);
  const [jumpTo, setJumpTo] = useState("");
  const [scale, setScale] = useState<number>(1.0);
  const [searchText, setSearchText] = useState<string>("");
  const [annotations, setAnnotations] = useState<{ _id: string, bookId: string, pageNumber: number, type: "highlight" | "margin", selectedText?: string, color?: string, note?: string, createdAt: string }[]>([]);
  const [selectionRect, setSelectionRect] = useState<{ top: number, left: number } | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const saveProgressTimeout = useRef<NodeJS.Timeout | null>(null);

  const [showSidebar, setShowSidebar] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  const [containerWidth, setContainerWidth] = useState<number>();
  const pdfWrapperRef = useRef<HTMLDivElement>(null);

  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024;
      setIsMobileOrTablet(isMobile);
      setShowSidebar(!isMobile);
      
      if (pdfWrapperRef.current) {
        // Use full clientWidth on mobile (no padding), otherwise subtract padding
        const padding = isMobile ? 0 : 32; 
        setContainerWidth(pdfWrapperRef.current.clientWidth - padding);
      } else if (isMobile) {
        setContainerWidth(window.innerWidth);
      }
    };

    checkMobile();
    // Allow layout to settle before checking again
    const timeoutId = setTimeout(checkMobile, 100);
    
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleToggleSidebar = () => {
    if (isMobileOrTablet) {
      setMobileSidebarOpen(prev => !prev);
    } else {
      setShowSidebar(prev => !prev);
    }
  };

  // Fetch annotations on mount
  useEffect(() => {
    getAnnotationsAction(bookId).then(res => {
      if (res.success) setAnnotations(res.annotations);
    });
  }, [bookId]);

  // Auto-save progress when page changes, debounced to avoid spamming
  useEffect(() => {
    if (pageNumber !== initialPage) {
      if (saveProgressTimeout.current) clearTimeout(saveProgressTimeout.current);
      saveProgressTimeout.current = setTimeout(() => {
        saveReadingProgressAction(bookId, pageNumber);
      }, 1000);
    }
    return () => {
      if (saveProgressTimeout.current) clearTimeout(saveProgressTimeout.current);
    };
  }, [pageNumber, bookId, initialPage]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  
  const handleFullscreen = () => {
    if (isPseudoFullscreen) {
      setIsPseudoFullscreen(false);
      return;
    }

    if (containerRef.current) {
      const doc = document as any;
      const elem = containerRef.current as any;

      if (doc.fullscreenElement || doc.webkitFullscreenElement) {
        if (doc.exitFullscreen) {
          doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        }
      } else {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().catch((err: any) => {
            console.warn(`Fullscreen API failed, falling back: ${err.message}`);
            setIsPseudoFullscreen(true);
          });
        } else if (elem.webkitRequestFullscreen) { 
          // desktop Safari
          elem.webkitRequestFullscreen();
        } else {
          // iOS Safari doesn't support requestFullscreen on div
          setIsPseudoFullscreen(true);
        }
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Calculate coordinates relative to container to render toolbar
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setSelectionRect({ 
          top: rect.top - containerRect.top - 40, 
          left: rect.left - containerRect.left + (rect.width / 2) 
        });
      }
      setSelectedText(selection.toString().trim());
    } else {
      // Don't immediately hide if they are clicking a toolbar button, 
      // but setTimeout allows the click to register first if needed.
      setTimeout(() => {
        if (!window.getSelection()?.toString().trim()) {
          setSelectionRect(null);
          setSelectedText("");
        }
      }, 200);
    }
  };

  const handleHighlight = async (color: string) => {
    if (!selectedText) return;
    const res = await saveAnnotationAction({
      bookId,
      pageNumber,
      type: "highlight",
      selectedText,
      color,
      note: ""
    });
    if (res.success && res.annotation) {
      setAnnotations(prev => [res.annotation, ...prev]);
    }
    setSelectionRect(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleAddMarginNote = async (note: string) => {
    const res = await saveAnnotationAction({
      bookId,
      pageNumber,
      type: "margin",
      note
    });
    if (res.success && res.annotation) {
      setAnnotations(prev => [res.annotation, ...prev]);
    }
  };

  const handleDeleteAnnotation = async (id: string) => {
    setAnnotations(prev => prev.filter(a => a._id !== id));
    await deleteAnnotationAction(id);
  };

  const handleUpdateNote = async (id: string, note: string) => {
    setAnnotations(prev => prev.map(a => a._id === id ? { ...a, note } : a));
    await updateAnnotationNoteAction(id, note);
  };

  // Custom text renderer to highlight search text AND saved highlights natively
  const textRenderer = useCallback(
    (textItem: { str: string }) => {
      let highlightedStr = textItem.str;

      // 1. Highlight search text (dynamic, temporary)
      if (searchText && textItem.str.toLowerCase().includes(searchText.toLowerCase())) {
        const regex = new RegExp(`(${searchText})`, 'gi');
        highlightedStr = highlightedStr.replace(regex, "<mark style='background-color: #fcd34d; padding: 0; border-radius: 2px;'>$1</mark>");
      }

      // 2. Highlight saved annotations (persistent)
      const pageHighlights = annotations.filter(a => a.pageNumber === pageNumber && a.type === "highlight" && a.selectedText);
      
      const highlightColors: Record<string, string> = {
        yellow: "#fef08a", // tailwind yellow-200
        pink: "#fbcfe8", // tailwind pink-200
        blue: "#bfdbfe", // tailwind blue-200
        green: "#bbf7d0", // tailwind green-200
      };

      pageHighlights.forEach(anno => {
        if (anno.selectedText && textItem.str.includes(anno.selectedText)) {
          // simple substring replacement for the highlight
          const colorHex = highlightColors[anno.color as string] || highlightColors.yellow;
          // Note: if the string is already HTML formatted by search, this might break tags.
          // For V1, we apply sequential replacements.
          const escapedText = anno.selectedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(${escapedText})`, 'g');
          highlightedStr = highlightedStr.replace(regex, `<mark style='background-color: ${colorHex}; padding: 0;'>$1</mark>`);
        }
      });

      return highlightedStr;
    },
    [searchText, annotations, pageNumber]
  );

  return (
    <div 
      className={
        isPseudoFullscreen 
        ? "fixed inset-0 z-[100] flex flex-col h-[100dvh] w-[100dvw] bg-stone-100 dark:bg-stone-950 overflow-hidden" 
        : "flex h-auto lg:h-full bg-stone-100 dark:bg-stone-950 rounded-lg lg:overflow-hidden border border-stone-200 dark:border-stone-800"
      } 
      ref={containerRef}
    >
      
      {/* PDF View Area */}
      <div className="flex-1 flex flex-col min-w-0 relative" onMouseUp={handleMouseUp}>
        <ReaderToolbar 
          pageNumber={pageNumber}
          numPages={numPages}
          scale={scale}
          onPageChange={handlePageChange}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFullscreen={handleFullscreen}
          onSearch={setSearchText}
          showSidebar={isMobileOrTablet ? mobileSidebarOpen : showSidebar}
          onToggleSidebar={handleToggleSidebar}
        />
      
        <div className="flex-1 lg:overflow-auto bg-stone-200 dark:bg-stone-900 flex justify-center p-0 sm:p-4 custom-scrollbar" ref={pdfWrapperRef}>
          {fileUrl ? (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="flex flex-col items-center justify-center min-h-full w-full"
              loading={
                <div className="flex items-center gap-2 justify-center h-full text-stone-500 font-serif w-full">
                  <Loader2 className="h-5 w-5 animate-spin" /> Opening book...
                </div>
              }
              error={
                <div className="flex items-center justify-center h-full text-red-500 font-serif w-full">
                  Failed to load PDF.
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                width={isMobileOrTablet ? containerWidth : undefined}
                className="shadow-xl"
                renderAnnotationLayer={true}
                renderTextLayer={true}
                customTextRenderer={textRenderer}
              />
            </Document>
          ) : (
            <div className="flex items-center justify-center h-full text-stone-500 font-serif w-full">
              No PDF linked to this book.
            </div>
          )}
        </div>

        {/* Bottom Pagination Bar */}
        <div className="p-2 bg-[#fdfbf7] dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex justify-center items-center gap-2 shrink-0 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handlePageChange(pageNumber - 1)}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            const p = parseInt(jumpTo, 10);
            if (p && p > 0 && (!numPages || p <= numPages)) {
              handlePageChange(p);
              setJumpTo("");
            }
          }} className="flex items-center gap-1">
            <Input 
              value={jumpTo}
              onChange={(e) => setJumpTo(e.target.value)}
              placeholder={pageNumber.toString()}
              className="w-12 h-8 text-center text-sm px-1 bg-white dark:bg-stone-950"
            />
            <span className="text-xs font-medium text-stone-500 whitespace-nowrap">
              / {numPages || "?"}
            </span>
          </form>

          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => handlePageChange(pageNumber + 1)}
            disabled={numPages ? pageNumber >= numPages : false}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Floating Selection Toolbar */}
        {selectionRect && (
          <div 
            className="absolute z-50 bg-white dark:bg-stone-800 shadow-lg border border-stone-200 dark:border-stone-700 rounded-md p-1.5 flex gap-1 transform -translate-x-1/2 flex items-center"
            style={{ top: selectionRect.top, left: selectionRect.left }}
          >
            <button className="h-6 w-6 rounded-full bg-yellow-200 hover:scale-110 transition-transform" onClick={() => handleHighlight("yellow")} />
            <button className="h-6 w-6 rounded-full bg-pink-200 hover:scale-110 transition-transform" onClick={() => handleHighlight("pink")} />
            <button className="h-6 w-6 rounded-full bg-blue-200 hover:scale-110 transition-transform" onClick={() => handleHighlight("blue")} />
            <button className="h-6 w-6 rounded-full bg-green-200 hover:scale-110 transition-transform" onClick={() => handleHighlight("green")} />
          </div>
        )}
      </div>

      {/* Annotations Sidebar - Desktop (shown inline) */}
      {!isMobileOrTablet && showSidebar && (
        <AnnotationsSidebar 
          bookId={bookId}
          annotations={annotations}
          currentPage={pageNumber}
          onAddMarginNote={handleAddMarginNote}
          onDelete={handleDeleteAnnotation}
          onUpdateNote={handleUpdateNote}
          onJumpToPage={handlePageChange}
        />
      )}

      {/* Annotations Sidebar - Mobile / Tablet (shown in Sheet) */}
      {isMobileOrTablet && (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="right" className="p-0 w-80 sm:w-96 border-l border-stone-200 dark:border-stone-800 bg-[#fdfbf7] dark:bg-stone-900">
            <AnnotationsSidebar 
              bookId={bookId}
              annotations={annotations}
              currentPage={pageNumber}
              onAddMarginNote={handleAddMarginNote}
              onDelete={handleDeleteAnnotation}
              onUpdateNote={handleUpdateNote}
              onJumpToPage={(page) => {
                handlePageChange(page);
                setMobileSidebarOpen(false);
              }}
              className="w-full h-full flex flex-col overflow-hidden"
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
