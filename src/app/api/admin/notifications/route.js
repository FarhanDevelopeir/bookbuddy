import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/books';
import Contact from '@/models/Contact';
import User from '@/models/User';
import Report from '@/models/Report';
import Warning from '@/models/Warning';

export async function GET() {
  try {
    await dbConnect();

    const [reports, warnings, users, books, contacts,warningResponses] = await Promise.all([
      Report.find({ is_read: { $ne: true } }).populate('reporter reportedBook reportedUser').sort({ createdAt: -1 }),
      User.find({ is_read: { $ne: true } }).sort({ createdAt: -1 }),
      Book.find({ is_read: { $ne: true } }).populate('seller').sort({ createdAt: -1 }),
      Contact.find({ is_read: { $ne: true } }).sort({ createdAt: -1 }),
         Warning.find({ 
        response: { $exists: true, $ne: null },
        is_read: { $ne: true }
      }).populate('userId bookId').sort({ respondedAt: -1 })
    ]);

    return NextResponse.json({
      reports: reports || [],
      users: users || [],
      books: books || [],
      contacts: contacts || [],
      warningResponses: warningResponses || []
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}