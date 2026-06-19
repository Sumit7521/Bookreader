"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import Review from "@/models/Review";
import { revalidatePath } from "next/cache";

export async function getReviewAction(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const review = await Review.findOne({ bookId, userId: session.user.id }).lean();
    return { success: true, review: review ? JSON.parse(JSON.stringify(review)) : null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get review" };
  }
}

export async function saveReviewAction(bookId: string, data: Partial<{ rating: number; content: string; plotSummary: string; keyTakeaways: string; favoriteQuotes: string; characterNotes: string; isPublic: boolean }>) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const review = await Review.findOneAndUpdate(
      { bookId, userId: session.user.id },
      { ...data },
      { upsert: true, returnDocument: 'after' }
    ).lean();
    revalidatePath(`/library/${bookId}`);
    revalidatePath('/discover');
    return { success: true, review: JSON.parse(JSON.stringify(review)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save review" };
  }
}
