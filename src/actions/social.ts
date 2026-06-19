'use server';

import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';
import Book from '@/models/Book';

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
      .populate('bookId', 'title author coverImage')
      .sort({ updatedAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(reviews));
  } catch (error) {
    console.error("Error fetching public reviews:", error);
    return [];
  }
}
