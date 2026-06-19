"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import Bookmark from "@/models/Bookmark";
import Book from "@/models/Book";

export async function saveReadingProgressAction(bookId: string, pageNumber: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    
    // Upsert the bookmark representing the last read position
    await Bookmark.findOneAndUpdate(
      { userId: session.user.id, bookId, type: 'last_read' },
      { pageNumber },
      { upsert: true, new: true }
    );

    // Also update the book status to 'reading' if it's not already
    await Book.findOneAndUpdate(
      { _id: bookId, userId: session.user.id, status: { $ne: 'finished' } },
      { status: 'reading' }
    );

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save progress" };
  }
}

export async function getReadingProgressAction(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) return { page: 1, error: "Unauthorized" };

  try {
    await connectToDatabase();
    const bookmark = await Bookmark.findOne({ userId: session.user.id, bookId, type: 'last_read' }).lean();
    if (bookmark && bookmark.pageNumber) {
      return { page: bookmark.pageNumber };
    }
    return { page: 1 };
  } catch (error) {
    console.error(error);
    return { page: 1, error: "Failed to fetch progress" };
  }
}
