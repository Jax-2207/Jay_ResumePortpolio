import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  subtitle: string;
  description: string;
  live?: string;
  github?: string;
  tags: string[];
  metric: string;
  metricColor: string;
  accent: string;
  icon: string;
  order: number;
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  live: { type: String },
  github: { type: String },
  tags: { type: [String], default: [] },
  metric: { type: String, required: true },
  metricColor: { type: String, required: true, default: '#22c55e' },
  accent: { type: String, required: true, default: '#00d4aa' },
  icon: { type: String, required: true, default: '🚀' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
