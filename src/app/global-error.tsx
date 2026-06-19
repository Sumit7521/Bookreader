"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-stone-50 dark:bg-[#1a1a1a] text-stone-900 dark:text-stone-100">
          <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold mb-2">Something went catastrophically wrong!</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-md text-center">
            A critical error occurred at the root level of the application. 
            {error.message ? ` Details: ${error.message}` : ""}
          </p>
          <Button onClick={() => reset()} size="lg">
            Try to recover
          </Button>
        </div>
      </body>
    </html>
  );
}
