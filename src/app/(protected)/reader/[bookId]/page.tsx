import { getReadingProgressAction } from "@/actions/reader";
import { PDFViewer } from "@/components/reader/PDFViewer";
import connectToDatabase from "@/lib/db";
import Book from "@/models/Book";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ReaderPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await connectToDatabase();
  const book = await Book.findOne({ _id: bookId, userId: session.user.id }).lean();

  if (!book) {
    return <div className="p-8 text-center text-red-500 font-serif">Book not found.</div>;
  }

  const progressResult = await getReadingProgressAction(bookId);
  const initialPage = progressResult.page || 1;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center gap-4 px-2">
        <Link href="/library" className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-serif font-medium text-stone-800 dark:text-stone-100 truncate">
          {book.title as string}
        </h1>
      </div>
      
      {/* We pass the secure URL. We need to tell TS that fileUrl exists */}
      <PDFViewer 
        bookId={bookId} 
        fileUrl={(book as { fileUrl?: string }).fileUrl || ""} 
        initialPage={initialPage} 
      />
    </div>
  );
}
