import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import TopSkill from '@/models/TopSkill';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await TopSkill.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching topskill:', error);
    return NextResponse.json({ error: 'Failed to fetch topskill' }, { status: 500 });
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

    const newItem = await TopSkill.create(data);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating topskill:', error);
    return NextResponse.json({ error: 'Failed to create topskill' }, { status: 500 });
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

    if (Array.isArray(data)) {
      const bulkOps = data.map((item, index) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { order: index } }
        }
      }));
      await TopSkill.bulkWrite(bulkOps);
      return NextResponse.json({ success: true, message: 'Reordered successfully' });
    } else {
      const { _id, ...updateData } = data;
      if (!_id) return NextResponse.json({ error: 'ID required for update' }, { status: 400 });
      
      const updated = await TopSkill.findByIdAndUpdate(_id, updateData, { new: true });
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('Error updating topskill:', error);
    return NextResponse.json({ error: 'Failed to update topskill' }, { status: 500 });
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

    await TopSkill.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting topskill:', error);
    return NextResponse.json({ error: 'Failed to delete topskill' }, { status: 500 });
  }
}