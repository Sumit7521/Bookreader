"use client";

import { useState } from "react";
import { Download, FileText, File, FileType2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { exportToDocxAction, exportToTxtAction } from "@/actions/export";

type ChapterType = { _id: string, title: string, content?: string };
type ProjectType = { _id: string, title: string, category: string, synopsis?: string };

export function ExportDropdown({ project, chapters }: { project: ProjectType, chapters: ChapterType[] }) {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const downloadFile = (data: BlobPart, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportTxt = async () => {
    setIsExporting("txt");
    try {
      const res = await exportToTxtAction(project._id);
      if (res.success && res.text) {
        downloadFile(res.text, `${res.title || "Project"}.txt`, "text/plain");
      }
    } catch (e) {
      console.error(e);
    }
    setIsExporting(null);
  };

  const handleExportDocx = async () => {
    setIsExporting("docx");
    try {
      const res = await exportToDocxAction(project._id);
      if (res.success && res.base64) {
        const binaryString = window.atob(res.base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        downloadFile(bytes, `${res.title || "Project"}.docx`, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      }
    } catch (e) {
      console.error(e);
    }
    setIsExporting(null);
  };

  const handleExportPdf = async () => {
    setIsExporting("pdf");
    try {

      const html2pdf = (await import("html2pdf.js")).default;
      
      const element = document.createElement("div");
      element.className = "prose prose-stone max-w-none p-8";
      
      let htmlContent = `
        <div style="text-align: center; margin-bottom: 50px;">
          <h1 style="font-size: 3em; margin-bottom: 10px;">${project.title}</h1>
        </div>
        <div style="page-break-after: always;"></div>
      `;

      chapters.forEach((chapter) => {
        htmlContent += `
          <h2 style="font-size: 2em; margin-top: 20px;">${chapter.title}</h2>
          ${chapter.content || ""}
          <div style="page-break-after: always;"></div>
        `;
      });

      element.innerHTML = htmlContent;
      
      const opt = {
        margin:       1,
        filename:     `${project.title || "Project"}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error(e);
    }
    setIsExporting(null);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-950 disabled:pointer-events-none disabled:opacity-50 border border-stone-200 hover:bg-stone-100 hover:text-stone-900 h-8 px-3 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-50 bg-white dark:text-stone-100 text-stone-900" disabled={!!isExporting}>
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
        <DropdownMenuItem onClick={handleExportPdf} disabled={!!isExporting} className="cursor-pointer">
          <FileType2 className="w-4 h-4 mr-2 text-red-500" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportDocx} disabled={!!isExporting} className="cursor-pointer">
          <File className="w-4 h-4 mr-2 text-blue-500" />
          Export as DOCX
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-stone-200 dark:bg-stone-800" />
        <DropdownMenuItem onClick={handleExportTxt} disabled={!!isExporting} className="cursor-pointer">
          <FileText className="w-4 h-4 mr-2 text-stone-500" />
          Export as TXT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
