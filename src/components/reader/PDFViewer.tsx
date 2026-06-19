"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ReaderToolbar } from "./ReaderToolbar";
import { AnnotationsSidebar } from "./AnnotationsSidebar";
import { saveReadingProgressAction } from "@/actions/reader";
import { getAnnotationsAction, saveAnnotationAction, deleteAnnotationAction, updateAnnotationNoteAction } from "@/actions/annotations";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

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

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024;
      setIsMobileOrTablet(isMobile);
      setShowSidebar(!isMobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
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
    <div className="flex h-[calc(100vh-6rem)] bg-stone-100 dark:bg-stone-950 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800" ref={containerRef}>
      
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
      
        <div className="flex-1 overflow-auto bg-stone-200 dark:bg-stone-900 flex justify-center p-4 custom-scrollbar">
          {fileUrl ? (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center gap-2 justify-center h-full text-stone-500 font-serif">
                  <Loader2 className="h-5 w-5 animate-spin" /> Opening book...
                </div>
              }
              error={
                <div className="flex items-center justify-center h-full text-red-500 font-serif">
                  Failed to load PDF.
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale} 
                className="shadow-xl"
                renderAnnotationLayer={true}
                renderTextLayer={true}
                customTextRenderer={textRenderer}
              />
            </Document>
          ) : (
            <div className="flex items-center justify-center h-full text-stone-500 font-serif">
              No PDF linked to this book.
            </div>
          )}
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
