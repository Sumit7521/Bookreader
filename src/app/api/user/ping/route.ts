import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    await User.findByIdAndUpdate(session.user.id, {
      lastActiveAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update activity ping:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
