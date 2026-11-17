import path from 'path';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import Profile from '../models/Profile';
import Project from '../models/Project';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const PROFILE_DATA = {
  key: 'main',
  name: 'Praveen Bankhede',
  roleTitle: 'Full-Stack MERN & Frontend Engineer · React.js, Next.js, Node.js & MongoDB',
  availabilityBadge: 'Open to Full-Stack (MERN) & Frontend Opportunities · Bhopal, MP',
  location: 'Bhopal, Madhya Pradesh',
  summary:
    'Full-Stack MERN & Frontend Software Engineer with 2+ years of experience building scalable web applications using React.js, Next.js, Redux, Node.js, Express.js, and MongoDB. Trained in Full Stack Web Development at Newton School and experienced in end-to-end UI engineering, REST APIs, WebSockets, payment integrations, and performance optimization.',
  email: 'bankhedepraveen12@gmail.com',
  phone: '+91-9479779107',
  linkedin: 'https://linkedin.com/in/praveen1295',
  github: 'https://github.com/praveen1295',
  metrics: [
    { value: '2+ Yrs', label: 'Full-Stack & Frontend', color: 'indigo' },
    { value: '35%', label: 'Faster Page Load', color: 'emerald' },
    { value: '40%', label: 'Engagement Lift', color: 'amber' },
    { value: '1,500+', label: 'Live Products Hosted', color: 'sky' },
  ],
  skills: [
    {
      category: 'Frontend',
      title: 'Languages & Frontend',
      items: ['JavaScript (ES6+)', 'TypeScript', 'Java', 'React.js', 'Next.js', 'Redux', 'React Hooks', 'HTML5', 'CSS3', 'Tailwind CSS'],
    },
    {
      category: 'Backend',
      title: 'MERN Stack & Backend',
      items: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'REST APIs', 'WebSockets / Socket.IO'],
    },
    {
      category: 'UI',
      title: 'UI Component Libraries',
      items: ['Ant Design', 'Chakra UI', 'Responsive Design'],
    },
    {
      category: 'Quality',
      title: 'Performance & Testing',
      items: ['Code Splitting', 'Lazy Loading', 'Lighthouse Optimization', 'Jest (Basic)', 'React Testing Library (Basic)'],
    },
    {
      category: 'Tools',
      title: 'Developer Workflow & Tools',
      items: ['Git', 'GitHub', 'VS Code', 'Cursor IDE', 'GitHub Copilot', 'Postman'],
    },
  ],
  experiences: [
    {
      id: 'dart',
      company: 'Digital Advertising Rising Tech Pvt. Ltd.',
      role: 'Software Engineer – Frontend',
      period: 'Jan 2024 – Present',
      location: 'Noida, India',
      bullets: [
        'Led frontend development for Biotronix, a healthcare-focused e-commerce platform, supporting secure Stripe payments and improving checkout success rate by 25%.',
        'Developed Workerland, a job-matching web application connecting service providers and workers, enabling real-time job posting and profile matching for 1,000+ users.',
        'Built reusable React components using Redux and Ant Design, reducing UI development time by 30%.',
        'Optimized frontend performance using lazy loading and code splitting, improving page load time by 35%.',
      ],
      tags: ['React.js', 'Redux', 'Ant Design', 'Stripe', 'Lazy Loading', 'Code Splitting'],
    },
    {
      id: 'perpetual',
      company: 'Perpetualblock Technologies Pvt. Ltd.',
      role: 'Software Engineer – Frontend',
      period: 'Jan 2023 – Nov 2023',
      location: 'Pune, India',
      bullets: [
        'Developed a React-based chatbot UI with speech-to-text, text-to-speech, and PDF generation, used internally by enterprise clients.',
        'Implemented secure payment workflows supporting ERC-20 crypto payments, Metamask, and PayPal integrations.',
        'Improved cross-device compatibility using Ant Design and responsive layouts, reducing UI issues by 40%.',
        'Collaborated in an Agile team of 7 developers using Git-based workflows and sprint planning.',
      ],
      tags: ['React.js', 'Ant Design', 'Speech-to-Text', 'ERC-20 / Metamask', 'PayPal', 'Agile'],
    },
    {
      id: 'niral',
      company: 'Niral Networks',
      role: 'Frontend Developer Intern',
      period: 'Aug 2022 – Dec 2022',
      location: 'Remote',
      bullets: [
        'Built interactive dashboards using React.js and Chakra UI with focus on accessibility and responsiveness.',
        'Integrated REST APIs and managed global state using Redux.',
        'Applied performance optimization techniques to enhance rendering speed and UX.',
      ],
      tags: ['React.js', 'Chakra UI', 'Redux', 'REST APIs'],
    },
  ],
  education: [
    {
      typeLabel: 'Education',
      title: 'B.E. in Mechanical Engineering',
      institution: 'Vindhya Institute of Technology and Science, Indore',
      period: 'July 2013 – June 2017 · CGPA: 6.89',
    },
    {
      typeLabel: 'Certification',
      title: 'Full Stack Web Development',
      institution: 'Newton School',
      period: 'Feb 2022 – Jan 2023',
    },
  ],
  achievements: [
    '"Most Promising New Joiner" Award — Perpetualblock Technologies (2023)',
    'Winner — Robo Track Competition at VITS Indore',
  ],
};

const PROJECTS = [
  {
    slug: 'pulsetrack',
    name: 'PulseTrack — Live Activity Monitor',
    category: 'MERN' as const,
    badge: 'Full-Stack MERN',
    period: 'Interview Project',
    url: '',
    summary:
      'Real-time MERN stack system activity tracker that monitors keyboard/mouse input and logs Not Working reports after 10 minutes of inactivity.',
    highlights: [
      'Built REST APIs and real-time Socket.IO events with Node.js, Express.js, and MongoDB/Mongoose.',
      'Implemented throttled keyboard/mouse tracking, 10-minute inactivity detection, and CSV report export in React.',
    ],
    stack: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Socket.IO'],
    order: 1,
  },
  {
    slug: 'poshmom',
    name: 'PoshMom.com',
    category: 'MERN' as const,
    badge: 'Full-Stack MERN · Client',
    period: 'May 2023 – Dec 2023',
    url: 'https://PoshMom.com',
    summary: 'Live-stream shopping platform hosting 1,500+ products with real-time user interactions.',
    highlights: [
      'Built a live-stream shopping platform hosting 1,500+ products with real-time interactions.',
      'Implemented WebSocket-based live features and optimized UI performance for mobile users.',
    ],
    stack: ['React.js', 'Node.js', 'MongoDB', 'WebSockets'],
    order: 2,
  },
  {
    slug: 'talktalesconnect',
    name: 'TalkTalesConnect.com',
    category: 'Client' as const,
    badge: 'Client Project',
    period: 'Jan 2024 – June 2024',
    url: 'https://TalkTalesConnect.com',
    summary: 'Booking platform for expert-led classes designed for seamless desktop and mobile experiences.',
    highlights: [
      'Developed a booking platform for expert-led classes, increasing user engagement by 40%.',
      'Designed responsive UI components ensuring seamless experience across desktop and mobile.',
    ],
    stack: ['React.js', 'Ant Design', 'Responsive UI'],
    order: 3,
  },
  {
    slug: 'biotronix',
    name: 'Biotronix Healthcare E-Commerce',
    category: 'Production' as const,
    badge: 'Production App · DART',
    period: '2024 – Present',
    url: '',
    summary: 'Healthcare-focused e-commerce platform with Stripe payment integration and optimized checkout.',
    highlights: [
      'Led frontend development supporting secure Stripe payments.',
      'Improved checkout success rate by 25% and page load time by 35% via lazy loading and code splitting.',
    ],
    stack: ['React.js', 'Redux', 'Ant Design', 'Stripe'],
    order: 4,
  },
  {
    slug: 'workerland',
    name: 'Workerland Job-Matching App',
    category: 'Production' as const,
    badge: 'Production App · DART',
    period: '2024 – Present',
    url: '',
    summary: 'Job-matching web application connecting service providers and workers in real time.',
    highlights: [
      'Enabled real-time job posting and profile matching for 1,000+ users.',
      'Built reusable React + Ant Design component library reducing UI development time by 30%.',
    ],
    stack: ['React.js', 'Redux', 'Ant Design'],
    order: 5,
  },
];

async function seed(): Promise<void> {
  await connectDB();
  await Profile.findOneAndUpdate({ key: 'main' }, PROFILE_DATA, { upsert: true, new: true });
  await Project.deleteMany({});
  await Project.insertMany(PROJECTS);
  console.log(`Seeded main profile and ${PROJECTS.length} portfolio projects.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
