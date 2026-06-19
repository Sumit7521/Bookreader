import { getBookDetailsAction } from "@/actions/book";
import { getReviewAction } from "@/actions/review";
import { BookDetailsClient } from "./BookDetailsClient";
import { redirect } from "next/navigation";

export default async function BookDetailsPage({ params }: { params: { bookId: string } }) {
  const resolvedParams = await params;
  const bookRes = await getBookDetailsAction(resolvedParams.bookId);
  
  if (!bookRes.success || !bookRes.book) {
    redirect("/library");
  }

  const reviewRes = await getReviewAction(resolvedParams.bookId);
  const review = reviewRes.success ? reviewRes.review : null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <BookDetailsClient book={bookRes.book} initialReview={review} />
    </div>
  );
}
