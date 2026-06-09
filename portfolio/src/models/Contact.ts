import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  label: string;
  value: string;
  href: string;
  icon: string;
  color: string;
  description: string;
  order: number;
}

const ContactSchema: Schema = new Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  href: { type: String, required: true },
  icon: { type: String, required: true, default: '📧' }, // Will use emoji instead of Lucide icons
  color: { type: String, required: true, default: '#00d4aa' },
  description: { type: String, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
