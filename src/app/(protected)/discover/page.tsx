import { getPublicReviewsAction } from "@/actions/social";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover - Bookreader",
};

export default async function DiscoverPage() {
  const reviews = await getPublicReviewsAction();

  return (
    <div className="container max-w-6xl py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif text-stone-800 dark:text-stone-100 mb-2">Discover</h1>
        <p className="text-stone-500 dark:text-stone-400">See what the community is reading and recommending.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 text-stone-500">
          <p>No public reviews yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {reviews.map((review: any) => (
            <Card key={review._id} className="break-inside-avoid shadow-sm hover:shadow-md transition-shadow border-stone-200 dark:border-stone-800">
              <CardHeader className="pb-3 border-b border-stone-100 dark:border-stone-800 flex flex-row items-center gap-4">
                <div className="relative h-16 w-12 flex-shrink-0 bg-stone-100 dark:bg-stone-800 rounded overflow-hidden">
                  {review.bookId?.coverImage ? (
                    <Image src={review.bookId.coverImage} alt={review.bookId.title || "Book"} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-stone-400">No Cover</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-serif truncate" title={review.bookId?.title}>
                    {review.bookId?.title || "Unknown Book"}
                  </CardTitle>
                  <p className="text-xs text-stone-500 truncate">{review.bookId?.author}</p>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    {review.userId?.name || review.userId?.email?.split('@')[0] || "Anonymous"}
                  </p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-3 w-3 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-stone-200 dark:text-stone-800"}`} 
                      />
                    ))}
                  </div>
                </div>

                {review.content && (
                  <p className="text-sm text-stone-700 dark:text-stone-300 italic whitespace-pre-wrap">
                    "{review.content}"
                  </p>
                )}

                {review.keyTakeaways && (
                  <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-md text-sm border border-stone-100 dark:border-stone-800">
                    <span className="font-semibold block mb-1 text-xs uppercase tracking-wider text-stone-500">Takeaway</span>
                    {review.keyTakeaways}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
