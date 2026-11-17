import mongoose, { Document, Schema } from 'mongoose';

export type ProjectCategory = 'MERN' | 'Client' | 'Production';

export interface IProject extends Document {
  slug: string;
  name: string;
  category: ProjectCategory;
  badge: string;
  period: string;
  url: string;
  summary: string;
  highlights: string[];
  stack: string[];
  order: number;
}

const projectSchema = new Schema<IProject>(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['MERN', 'Client', 'Production'], required: true },
    badge: { type: String, required: true },
    period: { type: String, required: true },
    url: { type: String, default: '' },
    summary: { type: String, required: true },
    highlights: [{ type: String }],
    stack: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', projectSchema);
