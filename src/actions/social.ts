'use server';

import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';
import Book from '@/models/Book';
import { revalidatePath } from 'next/cache';

export async function getPublicReviewsAction() {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  try {
    await connectToDatabase();

    // Ensure models are registered
    User.schema;
    Book.schema;

    const reviews = await Review.find({ isPublic: true })
      .populate('userId', 'name email')
      .populate('bookId', 'title author coverImage filePublicId')
      .sort({ updatedAt: -1 })
      .lean();

    const userBooks = await Book.find({ userId: session.user.id }).select('filePublicId _id').lean();

    const reviewsWithStatus = reviews.map((review: any) => {
      let userBookId = null;
      if (review.bookId?.filePublicId) {
        const userBook = userBooks.find(b => b.filePublicId === review.bookId.filePublicId);
        if (userBook) {
          userBookId = userBook._id;
        }
      }
      return {
        ...review,
        userBookId
      };
    });

    return JSON.parse(JSON.stringify(reviewsWithStatus));
  } catch (error) {
    console.error("Error fetching public reviews:", error);
    return [];
  }
}

export async function addPublicBookToLibraryAction(originalBookId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  try {
    await connectToDatabase();

    const originalBook = await Book.findById(originalBookId);
    if (!originalBook) {
      return { error: 'Book not found' };
    }

    // Check if user already has a book with the same filePublicId
    const existingBook = await Book.findOne({
      userId: session.user.id,
      filePublicId: originalBook.filePublicId
    });

    if (existingBook) {
      return { success: true, newBookId: existingBook._id.toString(), message: 'Already in library' };
    }

    // Create a copy of the book for the current user
    const newBook = await Book.create({
      userId: session.user.id,
      title: originalBook.title,
      author: originalBook.author,
      coverImage: originalBook.coverImage,
      fileUrl: originalBook.fileUrl,
      filePublicId: originalBook.filePublicId,
      status: 'not_started',
      tags: originalBook.tags || []
    });

    revalidatePath('/library');
    return { success: true, newBookId: newBook._id.toString() };
  } catch (error) {
    console.error("Error adding public book to library:", error);
    return { error: 'Failed to add book to library' };
  }
}
