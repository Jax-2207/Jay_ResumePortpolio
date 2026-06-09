import mongoose, { Schema, Document } from 'mongoose';

export interface ITopSkill extends Document {
  name: string;
  pct: number;
  order: number;
}

const TopSkillSchema: Schema = new Schema({
  name: { type: String, required: true },
  pct: { type: Number, required: true, min: 0, max: 100 },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.TopSkill || mongoose.model<ITopSkill>('TopSkill', TopSkillSchema);
