import { Request, Response } from 'express';
import Profile from '../models/Profile';
import Project from '../models/Project';
import ContactMessage from '../models/ContactMessage';
import { signToken } from '../middleware/auth';
import { isSmtpConfigured, sendReplyEmail } from '../utils/mailer';

export const getPortfolio = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [profile, projects] = await Promise.all([
      Profile.findOne({ key: 'main' }),
      Project.find({}).sort({ order: 1, createdAt: -1 }),
    ]);
    res.json({ success: true, profile, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    const filter =
      typeof category === 'string' && category !== 'All' ? { category } : {};
    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message } = req.body as {
      name?: string;
      email?: string;
      message?: string;
    };
    if (!name || !email || !message) {
      res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
      return;
    }

    const saved = await ContactMessage.create({ name, email, message });
    res.status(201).json({ success: true, message: 'Inquiry saved successfully.', inquiry: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body as { password?: string };
  const expected = process.env.ADMIN_PASSWORD || 'admin123';

  if (!password || password !== expected) {
    res.status(401).json({ success: false, message: 'Invalid admin password' });
    return;
  }

  const token = signToken({
    role: 'admin',
    exp: Date.now() + 24 * 60 * 60 * 1000,
  });

  res.json({ success: true, token, smtpConfigured: isSmtpConfigured() });
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body as Record<string, unknown>;
    const profile = await Profile.findOneAndUpdate(
      { key: 'main' },
      { $set: { ...updates, key: 'main' } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as { slug?: string; name?: string } & Record<string, unknown>;
    const slug =
      body.slug ||
      `${(body.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const project = await Project.create({ ...body, slug });
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const getMessages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, messages, smtpConfigured: isSmtpConfigured() });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const markMessageRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'READ' } },
      { new: true }
    );
    if (!msg) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }
    res.json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const replyToMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subject, body } = req.body as { subject?: string; body?: string };
    if (!subject || !body) {
      res.status(400).json({ success: false, message: 'Subject and reply body are required.' });
      return;
    }

    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }

    const emailResult = await sendReplyEmail({ to: msg.email, subject, text: body });

    msg.status = 'REPLIED';
    msg.replySubject = subject;
    msg.replyBody = body;
    msg.repliedAt = new Date();
    await msg.save();

    res.json({
      success: true,
      emailSent: emailResult.sent,
      reason: emailResult.reason || null,
      inquiry: msg,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
