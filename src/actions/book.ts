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
