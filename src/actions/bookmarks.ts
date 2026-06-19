"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import Bookmark from "@/models/Bookmark";
import { revalidatePath } from "next/cache";

export async function addBookmarkAction(bookId: string, pageNumber: number, label: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    const newBookmark = await Bookmark.create({
      userId: session.user.id,
      bookId,
      pageNumber,
      label,
      type: "bookmark",
    });

    revalidatePath(`/reader/${bookId}`);
    return { success: true, bookmark: JSON.parse(JSON.stringify(newBookmark)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to add bookmark" };
  }
}

export async function getBookmarksAction(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", bookmarks: [] };

  try {
    await connectToDatabase();
    const bookmarks = await Bookmark.find({ userId: session.user.id, bookId, type: "bookmark" })
      .sort({ pageNumber: 1 })
      .lean();

    const serialized = bookmarks.map(b => ({
      ...b,
      _id: b._id.toString(),
      userId: b.userId.toString(),
      bookId: b.bookId.toString(),
      createdAt: (b.createdAt as Date).toISOString(),
      updatedAt: (b.updatedAt as Date).toISOString(),
    }));

    return { success: true, bookmarks: serialized };
  } catch (error) {
    console.error(error);
    return { error: "Failed to fetch bookmarks", bookmarks: [] };
  }
}

export async function deleteBookmarkAction(bookmarkId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await connectToDatabase();
    await Bookmark.findOneAndDelete({ _id: bookmarkId, userId: session.user.id });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete bookmark" };
  }
}
