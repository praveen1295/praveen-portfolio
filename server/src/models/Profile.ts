import mongoose, { Document, Schema } from 'mongoose';

export interface IMetric {
  value: string;
  label: string;
  color: string;
}

export interface ISkillGroup {
  category: string;
  title: string;
  items: string[];
}

export interface IExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
  tags: string[];
}

export interface IEducation {
  typeLabel: string;
  title: string;
  institution: string;
  period: string;
}

export interface IProfile extends Document {
  key: string;
  name: string;
  roleTitle: string;
  availabilityBadge: string;
  location: string;
  summary: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  metrics: IMetric[];
  skills: ISkillGroup[];
  experiences: IExperience[];
  education: IEducation[];
  achievements: string[];
}

const profileSchema = new Schema<IProfile>(
  {
    key: { type: String, default: 'main', unique: true },
    name: { type: String, required: true },
    roleTitle: { type: String, required: true },
    availabilityBadge: { type: String, required: true },
    location: { type: String, required: true },
    summary: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    metrics: [{ value: String, label: String, color: { type: String, default: 'indigo' } }],
    skills: [{ category: String, title: String, items: [String] }],
    experiences: [
      {
        id: String,
        company: String,
        role: String,
        period: String,
        location: String,
        bullets: [String],
        tags: [String],
      },
    ],
    education: [{ typeLabel: String, title: String, institution: String, period: String }],
    achievements: [String],
  },
  { timestamps: true }
);

export default mongoose.model<IProfile>('Profile', profileSchema);
