"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Protected route error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-300">
      <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-full mb-6">
        <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400" />
      </div>
      <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
        Oops! Something went wrong here.
      </h2>
      <p className="text-stone-500 dark:text-stone-400 mb-8 max-w-md">
        We encountered an unexpected error while loading this section. You can try refreshing the page or navigating back.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="default">
          Try again
        </Button>
        <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
