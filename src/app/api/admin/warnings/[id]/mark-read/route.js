import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Warning from '@/models/Warning';

export async function POST(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const updatedWarning = await Warning.findByIdAndUpdate(
      id,
      {
        is_read: true,
        response_read_at: new Date()
      },
      { new: true }
    );

    if (!updatedWarning) {
      return NextResponse.json(
        { error: "Warning not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Warning response marked as read",
        warning: updatedWarning 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error marking warning as read:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}