import { getBookDetailsAction } from "@/actions/book";
import { getReviewAction } from "@/actions/review";
import { BookDetailsClient } from "./BookDetailsClient";
import { redirect } from "next/navigation";
import Folder from "@/models/Folder";
import { auth } from "@/auth";

export default async function BookDetailsPage({ params }: { params: { bookId: string } }) {
  const session = await auth();
  if (!session?.user?.id) return redirect("/login");

  const resolvedParams = await params;
  const bookRes = await getBookDetailsAction(resolvedParams.bookId);
  
  if (!bookRes.success || !bookRes.book) {
    redirect("/library");
  }

  const reviewRes = await getReviewAction(resolvedParams.bookId);
  const review = reviewRes.success ? reviewRes.review : null;

  const folders = await Folder.find({ userId: session.user.id, type: "library" })
    .lean()
    .exec()
    .then(docs => docs.map(d => ({ _id: d._id.toString(), name: d.name })));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <BookDetailsClient book={bookRes.book} initialReview={review} folders={folders} />
    </div>
  );
}
