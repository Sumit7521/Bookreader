"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/lib/db";
import Book from "@/models/Book";
import { revalidatePath } from "next/cache";

export async function getBookDetailsAction(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const book = await Book.findOne({ _id: bookId, userId: session.user.id }).lean();
    if (!book) return { error: "Book not found" };
    return { success: true, book: JSON.parse(JSON.stringify(book)) };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get book details" };
  }
}

export async function updateBookStatusAction(bookId: string, status: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    await Book.findOneAndUpdate({ _id: bookId, userId: session.user.id }, { status });
    revalidatePath(`/library/${bookId}`);
    revalidatePath(`/library`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update book status" };
  }
}

export async function updateBookTagsAction(bookId: string, tags: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    await Book.findOneAndUpdate({ _id: bookId, userId: session.user.id }, { tags });
    revalidatePath(`/library/${bookId}`);
    revalidatePath(`/library`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update book tags" };
  }
}

export async function deleteBookAction(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    
    const book = await Book.findOne({ _id: bookId, userId: session.user.id });
    if (!book) return { error: "Book not found" };

    if (book.filePublicId) {
      const otherBooksWithSameFile = await Book.countDocuments({ filePublicId: book.filePublicId, _id: { $ne: bookId } });
      
      if (otherBooksWithSameFile === 0) {
        const resourceType = book.fileUrl?.includes("/raw/") ? "raw" : "image";
        const type = book.fileUrl?.includes("/authenticated/") ? "authenticated" : "upload";
        try {
          const cloudinary = (await import("@/lib/cloudinary")).default;
          await cloudinary.uploader.destroy(book.filePublicId, {
            resource_type: resourceType,
            type: type
          });
        } catch (cloudinaryError) {
          console.error("Cloudinary delete failed:", cloudinaryError);
        }
      }
    }

    await Book.deleteOne({ _id: bookId, userId: session.user.id });

    const Review = (await import("@/models/Review")).default;
    const Annotation = (await import("@/models/Annotation")).default;
    const Bookmark = (await import("@/models/Bookmark")).default;
    const ReadingSession = (await import("@/models/ReadingSession")).default;

    await Review.deleteMany({ bookId, userId: session.user.id });
    await Annotation.deleteMany({ bookId, userId: session.user.id });
    await Bookmark.deleteMany({ bookId, userId: session.user.id });
    await ReadingSession.deleteMany({ bookId, userId: session.user.id });

    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete book" };
  }
}

export async function toggleFavoriteAction(bookId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    await connectToDatabase();
    const book = await Book.findOne({ _id: bookId, userId: session.user.id });
    if (!book) return { error: "Book not found" };

    const tags = book.tags || [];
    const isFavorite = tags.some((t: string) => t.toLowerCase() === 'favorite');
    
    let newTags;
    if (isFavorite) {
      newTags = tags.filter((t: string) => t.toLowerCase() !== 'favorite');
    } else {
      newTags = [...tags, 'favorite'];
    }

    await Book.findOneAndUpdate({ _id: bookId, userId: session.user.id }, { tags: newTags });
    revalidatePath(`/library/${bookId}`);
    revalidatePath(`/library`);
    revalidatePath(`/dashboard`);
    return { success: true, isFavorite: !isFavorite };
  } catch (error) {
    console.error(error);
    return { error: "Failed to toggle favorite" };
  }
}
