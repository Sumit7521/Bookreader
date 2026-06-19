"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PDFViewer = dynamic(
  () => import("./PDFViewer").then((mod) => mod.PDFViewer),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center bg-stone-100 dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800">
        <div className="flex flex-col items-center gap-2 text-stone-500 font-serif">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading PDF Viewer...</p>
        </div>
      </div>
    )
  }
);

interface PDFViewerClientProps {
  bookId: string;
  fileUrl: string;
  initialPage: number;
}

export function PDFViewerClient(props: PDFViewerClientProps) {
  return <PDFViewer {...props} />;
}
