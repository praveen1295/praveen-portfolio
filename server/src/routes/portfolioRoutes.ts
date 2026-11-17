import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import {
  adminLogin,
  createProject,
  deleteMessage,
  deleteProject,
  getMessages,
  getPortfolio,
  getProjects,
  markMessageRead,
  replyToMessage,
  submitContact,
  updateProfile,
  updateProject,
} from '../controllers/portfolioController';

const router = Router();

router.get('/portfolio', getPortfolio);
router.get('/projects', getProjects);
router.post('/contact', submitContact);

router.post('/admin/login', adminLogin);

router.put('/admin/profile', requireAdmin, updateProfile);
router.post('/admin/projects', requireAdmin, createProject);
router.put('/admin/projects/:id', requireAdmin, updateProject);
router.delete('/admin/projects/:id', requireAdmin, deleteProject);

router.get('/admin/messages', requireAdmin, getMessages);
router.patch('/admin/messages/:id/read', requireAdmin, markMessageRead);
router.post('/admin/messages/:id/reply', requireAdmin, replyToMessage);
router.delete('/admin/messages/:id', requireAdmin, deleteMessage);

export default router;
