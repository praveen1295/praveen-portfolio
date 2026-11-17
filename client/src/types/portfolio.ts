export type ProjectCategory = 'MERN' | 'Client' | 'Production';

export interface MetricItem {
  value: string;
  label: string;
  color: string;
}

export interface SkillGroup {
  category: string;
  title: string;
  items: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
  tags: string[];
}

export interface EducationItem {
  typeLabel: string;
  title: string;
  institution: string;
  period: string;
}

export interface ProfileData {
  name: string;
  roleTitle: string;
  availabilityBadge: string;
  location: string;
  summary: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  metrics: MetricItem[];
  skills: SkillGroup[];
  experiences: ExperienceItem[];
  education: EducationItem[];
  achievements: string[];
}

export interface ProjectItem {
  _id: string;
  name: string;
  category: ProjectCategory;
  badge: string;
  period: string;
  url: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED';
  replySubject?: string;
  replyBody?: string;
  repliedAt?: string | null;
  createdAt: string;
}
