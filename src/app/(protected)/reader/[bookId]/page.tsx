import { getReadingProgressAction } from "@/actions/reader";
import { PDFViewerClient } from "@/components/reader/PDFViewerClient";
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

  // Generate a signed URL to bypass Cloudinary's strict PDF delivery restrictions
  let signedFileUrl = (book as { fileUrl?: string }).fileUrl || "";
  const publicId = (book as { filePublicId?: string }).filePublicId;
  
  if (signedFileUrl.includes("cloudinary.com") && publicId) {
    const resourceType = signedFileUrl.includes("/raw/") ? "raw" : "image";
    let targetPublicId = publicId;
    
    // Cloudinary requires the exact path to be signed. 
    // If it's an image resource, we must request the .pdf format.
    if (resourceType === "image" && !targetPublicId.endsWith(".pdf")) {
      targetPublicId += ".pdf";
    }

    const cloudinary = (await import("@/lib/cloudinary")).default;
    signedFileUrl = cloudinary.utils.url(targetPublicId, {
      secure: true,
      sign_url: true,
      type: "authenticated",
      resource_type: resourceType,
      analytics: false,
    });
  }

  return (
    <div className="flex flex-col h-auto min-h-full lg:h-full space-y-4">
      <div className="flex items-center gap-4 px-2 shrink-0">
        <Link href="/library" className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-serif font-medium text-stone-800 dark:text-stone-100 truncate">
          {book.title as string}
        </h1>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <PDFViewerClient 
          bookId={bookId} 
          fileUrl={signedFileUrl} 
          initialPage={initialPage} 
        />
      </div>
    </div>
  );
}
