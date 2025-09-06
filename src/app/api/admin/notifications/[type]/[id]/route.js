import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/books';
import Contact from '@/models/Contact';
import User from '@/models/User';
import Report from '@/models/Report';

// export async function PUT(request, { params }) {
//   try {
//     // Ensure database connection
//     await dbConnect();
    
//     const { type, id } = await params;
//     const { is_read } = await request.json();
    
//     // Validate input
//     if (typeof is_read !== 'boolean') {
//       return NextResponse.json(
//         { error: 'is_read must be a boolean value' }, 
//         { status: 400 }
//       );
//     }
    
//     let model;
//     switch (type) {
//       case 'report': 
//         model = Report; 
//         break;
//       case 'user': 
//         model = User; 
//         break;
//       case 'book': 
//         model = Book; 
//         break;
//       case 'contact': 
//         model = Contact; 
//         break;
//       default: 
//         return NextResponse.json(
//           { error: 'Invalid type. Must be one of: report, warning, user, book, contact' }, 
//           { status: 400 }
//         );
//     }
    
//     // Check if document exists and update it
//     const updatedDocument = await model.findByIdAndUpdate(
//       id, 
//       { is_read },
//       { new: true, runValidators: true }
//     );
    
//     if (!updatedDocument) {
//       return NextResponse.json(
//         { error: `${type} with id ${id} not found` }, 
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({ 
//       success: true, 
//       data: updatedDocument 
//     });
    
//   } catch (error) {
//     console.error('Error updating notification:', error);
    
//     // Handle specific MongoDB errors
//     if (error.name === 'CastError') {
//       return NextResponse.json(
//         { error: 'Invalid ID format' }, 
//         { status: 400 }
//       );
//     }
    
//     return NextResponse.json(
//       { error: 'Failed to update notification' }, 
//       { status: 500 }
//     );
//   }
// }

export async function PUT(request, { params }) {
  try {
    // Ensure database connection
    await dbConnect();
    
    const { type, id } = await params;
    const { is_read } = await request.json();
    
    // Validate input
    if (typeof is_read !== 'boolean') {
      return NextResponse.json(
        { error: 'is_read must be a boolean value' }, 
        { status: 400 }
      );
    }
    
    let model;
    switch (type) {
      case 'report': 
        model = Report; 
        break;
      case 'warning': // Add warning type
      case 'warning_response': // Add warning_response type
        model = Warning;
        break;
      case 'user': 
        model = User; 
        break;
      case 'book': 
        model = Book; 
        break;
      case 'contact': 
        model = Contact; 
        break;
      default: 
        return NextResponse.json(
          { error: 'Invalid type. Must be one of: report, warning, warning_response, user, book, contact' }, 
          { status: 400 }
        );
    }
    
    // For warning responses, we need to update admin_read instead of is_read
    let updateData = {};
    if (type === 'warning_response') {
      updateData = { 
        is_read: is_read,
        ...(is_read && { response_read_at: new Date() })
      };
    } else {
      updateData = { is_read };
    }
    
    // Check if document exists and update it
    const updatedDocument = await model.findByIdAndUpdate(
      id, 
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedDocument) {
      return NextResponse.json(
        { error: `${type} with id ${id} not found` }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: updatedDocument 
    });
    
  } catch (error) {
    console.error('Error updating notification:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Invalid ID format' }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update notification' }, 
      { status: 500 }
    );
  }
}