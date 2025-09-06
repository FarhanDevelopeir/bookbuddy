
import dbConnect from '@/lib/db';
import Warning from '@/models/Warning';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { status } = await request.json();

    const warning = await Warning.findByIdAndUpdate(
      id,
      {
        $set: {
          status: status || "resolved",
          isResolved: true,
          resolvedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!warning) {
      return NextResponse.json({ error: "Warning not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Warning resolved successfully",
      warning,
    });
  } catch (error) {
    console.error("Error resolving warning:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
