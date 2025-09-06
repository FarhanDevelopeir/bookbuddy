
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/books';
import Contact from '@/models/Contact';
import User from '@/models/User';
import Report from '@/models/Report';
import Warning from '@/models/Warning';

export async function PUT() {
  try {
    // Ensure database connection
    await dbConnect();
    
    const results = await Promise.all([
      Report.updateMany({}, { is_read: true }),
      User.updateMany({}, { is_read: true }),
      Book.updateMany({}, { is_read: true }),
      Contact.updateMany({}, { is_read: true }),
      Warning.updateMany({}, { is_read: true }),
    ]);
    
    // Calculate total updated documents
    const totalUpdated = results.reduce((sum, result) => sum + result.modifiedCount, 0);
    
    return NextResponse.json({ 
      success: true,
      message: `Marked ${totalUpdated} notifications as read`,
      details: {
        reports: results[0].modifiedCount,
        users: results[1].modifiedCount,
        books: results[2].modifiedCount,
        contacts: results[3].modifiedCount,
        warningResponses: results[4].modifiedCount
      }
    });
    
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all as read' }, 
      { status: 500 }
    );
  }
}