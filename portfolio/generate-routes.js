const fs = require('fs');
const path = require('path');

const models = [
  { name: 'Project', route: 'projects' },
  { name: 'SkillGroup', route: 'skill-groups' },
  { name: 'TopSkill', route: 'top-skills' },
  { name: 'Experience', route: 'experience' },
  { name: 'Contact', route: 'contact' },
  { name: 'CustomSection', route: 'custom-sections' }
];

const template = (modelName) => `import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ${modelName} from '@/models/${modelName}';

export async function GET() {
  try {
    await connectToDatabase();
    const items = await ${modelName}.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching ${modelName.toLowerCase()}:', error);
    return NextResponse.json({ error: 'Failed to fetch ${modelName.toLowerCase()}' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== \`Bearer \${process.env.ADMIN_PASSWORD}\`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newItem = await ${modelName}.create(data);
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating ${modelName.toLowerCase()}:', error);
    return NextResponse.json({ error: 'Failed to create ${modelName.toLowerCase()}' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== \`Bearer \${process.env.ADMIN_PASSWORD}\`) {
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
      await ${modelName}.bulkWrite(bulkOps);
      return NextResponse.json({ success: true, message: 'Reordered successfully' });
    } else {
      const { _id, ...updateData } = data;
      if (!_id) return NextResponse.json({ error: 'ID required for update' }, { status: 400 });
      
      const updated = await ${modelName}.findByIdAndUpdate(_id, updateData, { new: true });
      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error('Error updating ${modelName.toLowerCase()}:', error);
    return NextResponse.json({ error: 'Failed to update ${modelName.toLowerCase()}' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== \`Bearer \${process.env.ADMIN_PASSWORD}\`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await ${modelName}.findByIdAndDelete(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting ${modelName.toLowerCase()}:', error);
    return NextResponse.json({ error: 'Failed to delete ${modelName.toLowerCase()}' }, { status: 500 });
  }
}`;

models.forEach(({ name, route }) => {
  const dirPath = path.join(process.cwd(), 'src', 'app', 'api', route);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, 'route.ts'), template(name));
});
console.log('Successfully created API routes');
