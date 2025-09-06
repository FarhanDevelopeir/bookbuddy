
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Warning from '@/models/Warning';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();

    const { userId, message, severity, bookId } = await request.json(); 
    
    if (!userId || !message || !severity) {
      return NextResponse.json(
        { error: 'userId, message and severity are required' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high'].includes(severity)) {
      return NextResponse.json(
        { error: 'Invalid severity level' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const warning = await Warning.create({
      userId,
      adminId: 'abc',
      message,
      severity,
      bookId: bookId || null,
      status: 'active',
      isResolved: false,
      resolvedAt: null
    });

    await User.findByIdAndUpdate(userId, {
      $push: { warnings: warning._id }
    });

    return NextResponse.json(warning, { status: 201 });
  } catch (error) {
    console.error('Error creating warning:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// export async function GET(request) {
//   try {
//     await dbConnect();

//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get("userId");
//     const includeResolved = searchParams.get("includeResolved") === "true";

//     if (!userId) {
//       return Response.json({ error: "userId is required" }, { status: 400 });
//     }

//     const query = { userId };
//     if (!includeResolved) {
//       query.status = "active";
//       query.isResolved = false;
//     }

//     const warnings = await Warning.find(query)
//     .populate('bookId', 'title price year department')
//     .select('+response +respondedAt')
//     .sort({ createdAt: -1 });

//     return Response.json(warnings);
//   } catch (err) {
//     console.error("Error fetching warnings:", err);
//     return Response.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    // Remove the includeResolved parameter since we're fetching everything
    // const includeResolved = searchParams.get("includeResolved") === "true";

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    // Only filter by userId - remove all status filtering
    const query = { userId };
    // Remove these lines:
    // if (!includeResolved) {
    //   query.status = "active";
    //   query.isResolved = false;
    // }

    // Fetch ALL warnings for this user, regardless of status
    const warnings = await Warning.find(query)
      .populate('bookId', 'title price year department')
      .select('+response +respondedAt')
      .sort({ createdAt: -1 });

    return Response.json(warnings);
  } catch (err) {
    console.error("Error fetching warnings:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}


export async function PUT(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userId, bookId } = body;
    
    console.log("Resolve warnings request received:", { userId, bookId });

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const query = { userId, status: "active" };
    if (bookId) {
      query.bookId = bookId;
    }

    const result = await Warning.updateMany(
      query,
      { 
        $set: { 
          status: "resolved",
          isResolved: true,
          resolvedAt: new Date(),
        } 
      }
    );

    console.log(`Resolved ${result.modifiedCount} warning(s)`);

    return Response.json({ 
      message: `${result.modifiedCount} warning(s) resolved successfully`,
      resolvedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error resolving warnings:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}