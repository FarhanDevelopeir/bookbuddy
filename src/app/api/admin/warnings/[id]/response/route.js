import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Warning from '@/models/Warning';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const { response } = await request.json();
    
    if (!response || !response.trim()) {
      return NextResponse.json(
        { error: "Response message is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid warning ID format" },
        { status: 400 }
      );
    }

    const existingWarning = await Warning.findById(id);
    
    if (!existingWarning) {
      console.error("Warning not found in database for ID:", id);
      return NextResponse.json(
        { error: "Warning not found" },
        { status: 404 }
      );
    }

    const updatedWarning = await Warning.findByIdAndUpdate(
      id,
      {
        response: response.trim(),
        respondedAt: new Date(),
        status: 'active',
        isResolved: false
      },
      { new: true }
    ).populate('bookId', 'title price');

    return NextResponse.json(
      { 
        success: true, 
        message: "Response submitted successfully",
        warning: updatedWarning 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}