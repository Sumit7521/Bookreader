"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Book as BookIcon, ChevronLeft, Star, Save, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateBookStatusAction, deleteBookAction } from "@/actions/book";
import { saveReviewAction } from "@/actions/review";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface BookDetailsProps {
  book: {
    _id: string;
    title: string;
    author?: string;
    coverImage?: string;
    status: string;
  };
  initialReview: {
    rating?: number;
    content?: string;
    plotSummary?: string;
    keyTakeaways?: string;
    favoriteQuotes?: string;
    characterNotes?: string;
  } | null;
}

export function BookDetailsClient({ book, initialReview }: BookDetailsProps) {
  const router = useRouter();
  const [status, setStatus] = useState(book.status || "not_started");
  const [review, setReview] = useState({
    rating: initialReview?.rating || 0,
    content: initialReview?.content || "",
    plotSummary: initialReview?.plotSummary || "",
    keyTakeaways: initialReview?.keyTakeaways || "",
    favoriteQuotes: initialReview?.favoriteQuotes || "",
    characterNotes: initialReview?.characterNotes || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteBookAction(book._id);
    setIsDeleting(false);
    if (res.success) {
      setDeleteOpen(false);
      router.push("/library");
    } else {
      alert(res.error || "Failed to delete book");
    }
  };

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return;
    setStatus(newStatus);
    await updateBookStatusAction(book._id, newStatus);
  };

  const handleReviewChange = (field: string, value: string | number) => {
    setReview(prev => ({ ...prev, [field]: value }));
  };

  const saveReview = async () => {
    setIsSaving(true);
    await saveReviewAction(book._id, review);
    setIsSaving(false);
  };

  const statusOptions = [
    { value: "not_started", label: "Not Started" },
    { value: "reading", label: "Currently Reading" },
    { value: "finished", label: "Finished" },
    { value: "dnf", label: "DNF (Did Not Finish)" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/library" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 transition-colors">
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Library
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Book Info */}
        <div className="space-y-6">
          <Card className="border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative aspect-[2/3] w-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              {book.coverImage ? (
                <Image src={book.coverImage} alt={book.title} fill className="object-cover" />
              ) : (
                <BookIcon className="h-16 w-16 text-stone-300 dark:text-stone-700" />
              )}
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <h1 className="font-serif text-2xl font-semibold text-stone-800 dark:text-stone-100 leading-tight mb-1">{book.title}</h1>
                <p className="text-stone-500 dark:text-stone-400">{book.author || "Unknown Author"}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Reading Status</label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full bg-stone-50 dark:bg-stone-950">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <Link href={`/reader/${book._id}`} className={buttonVariants({ className: "w-full bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors" })}>
                  Read PDF
                </Link>
                
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#fdfbf7] dark:bg-stone-950 border-stone-200 dark:border-stone-800">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-xl text-stone-800 dark:text-stone-100">Delete Book</DialogTitle>
                      <DialogDescription className="text-stone-500 dark:text-stone-400">
                        Are you sure you want to delete <strong className="font-semibold text-stone-700 dark:text-stone-300">"{book.title}"</strong>? This will permanently delete the book file from Cloudinary and all associated data, including reviews and highlights.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting} className="border-stone-200 dark:border-stone-800">
                        Cancel
                      </Button>
                      <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white">
                        {isDeleting ? "Deleting..." : "Permanently Delete"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Review & Notes */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-stone-200 dark:border-stone-800 shadow-sm bg-white dark:bg-stone-900">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <CardTitle className="font-serif text-xl text-stone-800 dark:text-stone-100">My Review & Notes</CardTitle>
              <Button size="sm" variant="outline" onClick={saveReview} disabled={isSaving} className="h-8 border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-950/30">
                <Save className="h-4 w-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div className="space-y-3 p-4 bg-stone-50 dark:bg-stone-950/50 rounded-lg border border-stone-100 dark:border-stone-800">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleReviewChange("rating", star)}
                      className={`p-1 transition-transform hover:scale-110 focus:outline-none`}
                    >
                      <Star 
                        className={`h-8 w-8 ${star <= review.rating ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-stone-300 dark:text-stone-700"}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm font-medium text-stone-500">{review.rating > 0 ? `${review.rating} / 5` : "Unrated"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Review</label>
                <Textarea 
                  value={review.content}
                  onChange={(e) => handleReviewChange("content", e.target.value)}
                  placeholder="What did you think of the book?"
                  className="min-h-[120px] bg-white dark:bg-stone-950 resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Plot Summary</label>
                  <Textarea 
                    value={review.plotSummary}
                    onChange={(e) => handleReviewChange("plotSummary", e.target.value)}
                    placeholder="Briefly summarize the plot..."
                    className="min-h-[100px] bg-white dark:bg-stone-950"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Key Takeaways</label>
                  <Textarea 
                    value={review.keyTakeaways}
                    onChange={(e) => handleReviewChange("keyTakeaways", e.target.value)}
                    placeholder="What did you learn?"
                    className="min-h-[100px] bg-white dark:bg-stone-950"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Favorite Quotes</label>
                  <Textarea 
                    value={review.favoriteQuotes}
                    onChange={(e) => handleReviewChange("favoriteQuotes", e.target.value)}
                    placeholder="Drop your favorite lines here..."
                    className="min-h-[100px] bg-white dark:bg-stone-950"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Character Notes</label>
                  <Textarea 
                    value={review.characterNotes}
                    onChange={(e) => handleReviewChange("characterNotes", e.target.value)}
                    placeholder="Thoughts on the protagonist, antagonist..."
                    className="min-h-[100px] bg-white dark:bg-stone-950"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
