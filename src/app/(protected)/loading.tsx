import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <Loader2 className="w-10 h-10 text-[var(--accent-color,#f59e0b)] animate-spin" />
      <p className="mt-4 text-stone-500 dark:text-stone-400 font-medium">Loading...</p>
    </div>
  );
}
