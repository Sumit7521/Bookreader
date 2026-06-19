import { getLibraryDataAction } from "@/actions/library";
import { LibraryManager } from "@/components/library/LibraryManager";
import { Library } from "lucide-react";

export default async function LibraryPage() {
  const data = await getLibraryDataAction();

  if (data.error) {
    return <div className="p-8 text-red-500">Error loading library: {data.error}</div>;
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Library className="h-8 w-8 text-stone-800 dark:text-stone-100" />
          <h1 className="text-3xl sm:text-4xl font-serif text-stone-800 dark:text-stone-100">
            Your Library
          </h1>
        </div>
        <p className="text-stone-500 dark:text-stone-400 max-w-2xl">
          Organize, browse, and upload your books. Support for PDF uploading directly from this page.
        </p>
      </div>

      <LibraryManager initialData={{ folders: data.folders, books: data.books }} />
    </div>
  );
}
