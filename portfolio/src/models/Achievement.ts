import mongoose, { Schema, Document } from 'mongoose';

export interface ICertificate {
  title: string;
  url: string;
}

export interface IAchievement extends Document {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  badge: string;
  certificates: ICertificate[];
}

const CertificateSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
});

const AchievementSchema = new Schema({
  icon: { type: String, required: true, default: '🏆' },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: String, required: true, default: '#f59e0b' },
  badge: { type: String, required: true },
  certificates: [CertificateSchema],
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', AchievementSchema);
