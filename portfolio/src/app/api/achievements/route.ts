import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Achievement from '@/models/Achievement';

export async function GET() {
  try {
    await connectToDatabase();
    // Sort by order ascending, then by createdAt descending as fallback
    const achievements = await Achievement.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newAchievement = await Achievement.create(data);
    return NextResponse.json(newAchievement, { status: 201 });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json({ error: 'Failed to create achievement' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Check if it's a bulk reorder array
    if (Array.isArray(data)) {
      const bulkOps = data.map((item, index) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { order: index } }
        }
      }));
      await Achievement.bulkWrite(bulkOps);
      return NextResponse.json({ success: true, message: 'Reordered successfully' });
    } else {
      // Single item update
      const { _id, ...updateData } = data;
      if (!_id) return NextResponse.json({ error: 'ID required for update' }, { status: 400 });
      
      const updated = await Achievement.findByIdAndUpdate(_id, updateData, { new: true });
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json({ error: 'Failed to update achievement' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await Achievement.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json({ error: 'Failed to delete achievement' }, { status: 500 });
  }
}
