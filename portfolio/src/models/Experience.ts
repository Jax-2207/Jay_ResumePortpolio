import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience extends Document {
  role: string;
  company: string;
  period: string;
  type: string;
  typeColor: string;
  points: string[];
  stack: string[];
  icon: string;
  order: number;
}

const ExperienceSchema: Schema = new Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  period: { type: String, required: true },
  type: { type: String, required: true },
  typeColor: { type: String, required: true, default: '#00d4aa' },
  points: { type: [String], default: [] },
  stack: { type: [String], default: [] },
  icon: { type: String, required: true, default: '💼' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Experience || mongoose.model<IExperience>('Experience', ExperienceSchema);
