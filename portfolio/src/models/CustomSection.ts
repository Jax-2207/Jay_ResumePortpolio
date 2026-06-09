import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomSectionItem {
  title: string;
  subtitle?: string;
  description?: string;
  link?: string;
  icon?: string;
  tags?: string[];
  color?: string;
}

export interface ICustomSection extends Document {
  sectionId: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  items: ICustomSectionItem[];
  order: number;
}

const CustomSectionItemSchema = new Schema<ICustomSectionItem>({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  link: { type: String },
  icon: { type: String, default: '✨' },
  tags: { type: [String], default: [] },
  color: { type: String, default: '#00d4aa' },
});

const CustomSectionSchema: Schema = new Schema({
  sectionId: { type: String, required: true, unique: true }, // e.g. 'inside-the-machine'
  sectionTitle: { type: String, required: true },
  sectionSubtitle: { type: String },
  items: [CustomSectionItemSchema],
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.CustomSection || mongoose.model<ICustomSection>('CustomSection', CustomSectionSchema);
