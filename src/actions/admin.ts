'use server';

import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import Book from '@/models/Book';
import Review from '@/models/Review';
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

export async function getAdminAnalyticsAction() {
  const session = await auth();
  
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  await connectToDatabase();

  const totalUsers = await User.countDocuments();
  const totalBooks = await Book.countDocuments();
  const totalReviews = await Review.countDocuments();

  // Get signups for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const signupsData = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        signups: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Fill in missing dates with 0
  const chartData = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const match = signupsData.find(s => s._id === dateStr);
    chartData.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      signups: match ? match.signups : 0
    });
  }

  // Get books by status
  const booksByStatus = await Book.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const bookStatusData = booksByStatus.map(b => ({
    status: b._id,
    count: b.count,
    fill: `var(--color-${b._id})` // For recharts
  }));

  return {
    totalUsers,
    totalBooks,
    totalReviews,
    chartData,
    bookStatusData
  };
}
