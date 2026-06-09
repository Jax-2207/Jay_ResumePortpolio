import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillGroup extends Document {
  title: string;
  icon: string;
  tags: string[];
  order: number;
}

const SkillGroupSchema: Schema = new Schema({
  title: { type: String, required: true },
  icon: { type: String, required: true, default: '💻' },
  tags: { type: [String], default: [] },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.SkillGroup || mongoose.model<ISkillGroup>('SkillGroup', SkillGroupSchema);
