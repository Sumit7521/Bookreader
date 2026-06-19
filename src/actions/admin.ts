'use server';

import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Book from '@/models/Book';
import { revalidatePath } from 'next/cache';

export async function getUsersWithBooks() {
  const session = await auth();
  
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const users = await User.aggregate([
    {
      $lookup: {
        from: 'books', // The actual collection name for books
        localField: '_id',
        foreignField: 'userId',
        as: 'books'
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);

  // Convert ObjectIds and Dates to strings to pass to Client Components safely
  return JSON.parse(JSON.stringify(users));
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const session = await auth();
  
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  await User.findByIdAndUpdate(userId, {
    isActive: !currentStatus
  });

  revalidatePath('/admin/users');
}
