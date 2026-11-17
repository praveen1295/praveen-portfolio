import React, { FormEvent, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { ArrowLeft, Edit3, Lock, LogOut, Mail, Plus, Save, Send, Trash2 } from 'lucide-react';
import { ContactInquiry, ProfileData, ProjectCategory, ProjectItem } from '../types/portfolio';

interface AdminPanelProps {
  apiBase: string;
  profile: ProfileData;
  projects: ProjectItem[];
  onPortfolioUpdated: () => void;
  onExit: () => void;
  showToast: (msg: string) => void;
}

interface ProjectFormState {
  name: string;
  category: ProjectCategory;
  badge: string;
  period: string;
  url: string;
  summary: string;
  highlightsText: string;
  stackText: string;
}

const EMPTY_PROJECT: ProjectFormState = {
  name: '',
  category: 'MERN',
  badge: 'Full-Stack MERN',
  period: '',
  url: '',
  summary: '',
  highlightsText: '',
  stackText: '',
};

export default function AdminPanel({
  apiBase,
  profile,
  projects,
  onPortfolioUpdated,
  onExit,
  showToast,
}: AdminPanelProps) {
  const [token, setToken] = useState<string>(() => {
    try {
      return localStorage.getItem('pb_admin_token') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<'projects' | 'profile' | 'messages'>('projects');
  const [messages, setMessages] = useState<ContactInquiry[]>([]);
  const [smtpConfigured, setSmtpConfigured] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [projForm, setProjForm] = useState<ProjectFormState>(EMPTY_PROJECT);

  const [profForm, setProfForm] = useState({
    name: profile.name || '',
    roleTitle: profile.roleTitle || '',
    availabilityBadge: profile.availabilityBadge || '',
    location: profile.location || '',
    summary: profile.summary || '',
    email: profile.email || '',
    phone: profile.phone || '',
    linkedin: profile.linkedin || '',
    github: profile.github || '',
    skillsJson: JSON.stringify(profile.skills || [], null, 2),
    experiencesJson: JSON.stringify(profile.experiences || [], null, 2),
  });

  const [replyTarget, setReplyTarget] = useState<ContactInquiry | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const handleLogout = () => {
    try {
      localStorage.removeItem('pb_admin_token');
    } catch {}
    setToken('');
    showToast('Logged out');
  };

  const fetchMessages = async (activeToken = token) => {
    if (!activeToken) return;
    try {
      const { data } = await axios.get<{
        success: boolean;
        messages: ContactInquiry[];
        smtpConfigured: boolean;
      }>(`${apiBase}/api/admin/messages`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (data.success) {
        setMessages(data.messages || []);
        setSmtpConfigured(Boolean(data.smtpConfigured));
      }
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchMessages(token);
    }
  }, [token]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post<{
        success: boolean;
        token: string;
        smtpConfigured: boolean;
      }>(`${apiBase}/api/admin/login`, { password });
      if (data.success && data.token) {
        try {
          localStorage.setItem('pb_admin_token', data.token);
        } catch {}
        setToken(data.token);
        setSmtpConfigured(Boolean(data.smtpConfigured));
        setPassword('');
        showToast('Admin logged in');
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      showToast(axiosErr.response?.data?.message || 'Invalid password');
    }
  };

  const startEditProject = (p: ProjectItem) => {
    setEditingId(p._id);
    setProjForm({
      name: p.name || '',
      category: p.category || 'MERN',
      badge: p.badge || '',
      period: p.period || '',
      url: p.url || '',
      summary: p.summary || '',
      highlightsText: (p.highlights || []).join('\n'),
      stackText: (p.stack || []).join(', '),
    });
  };

  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: projForm.name,
      category: projForm.category,
      badge: projForm.badge,
      period: projForm.period,
      url: projForm.url,
      summary: projForm.summary,
      highlights: projForm.highlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      stack: projForm.stackText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await axios.put(`${apiBase}/api/admin/projects/${editingId}`, payload, authHeaders);
        showToast('Project updated');
      } else {
        await axios.post(`${apiBase}/api/admin/projects`, payload, authHeaders);
        showToast('Project added');
      }
      setEditingId(null);
      setProjForm(EMPTY_PROJECT);
      onPortfolioUpdated();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      showToast(axiosErr.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await axios.delete(`${apiBase}/api/admin/projects/${id}`, authHeaders);
      showToast('Project deleted');
      onPortfolioUpdated();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      showToast(axiosErr.response?.data?.message || 'Delete failed');
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const parsedSkills = JSON.parse(profForm.skillsJson);
      const parsedExp = JSON.parse(profForm.experiencesJson);

      await axios.put(
        `${apiBase}/api/admin/profile`,
        {
          name: profForm.name,
          roleTitle: profForm.roleTitle,
          availabilityBadge: profForm.availabilityBadge,
          location: profForm.location,
          summary: profForm.summary,
          email: profForm.email,
          phone: profForm.phone,
          linkedin: profForm.linkedin,
          github: profForm.github,
          skills: parsedSkills,
          experiences: parsedExp,
        },
        authHeaders
      );
      showToast('Profile & details updated');
      onPortfolioUpdated();
    } catch (err) {
      const error = err as Error;
      showToast(error.message.includes('JSON') ? 'Invalid JSON in Skills or Experience' : 'Failed to update profile');
    }
  };

  const openReplyModal = (msg: ContactInquiry) => {
    setReplyTarget(msg);
    setReplySubject(`Re: Portfolio Inquiry from ${msg.name}`);
    setReplyBody(`Hi ${msg.name},\n\nThank you for reaching out!\n\nBest regards,\n${profile.name}`);
  };

  const handleSendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyTarget) return;
    setSendingReply(true);
    try {
      const { data } = await axios.post<{ success: boolean; emailSent: boolean }>(
        `${apiBase}/api/admin/messages/${replyTarget._id}/reply`,
        { subject: replySubject, body: replyBody },
        authHeaders
      );
      if (data.emailSent) {
        showToast(`Email sent to ${replyTarget.email}`);
      } else {
        showToast('Reply saved (SMTP not configured — use Open Mail App if needed)');
      }
      setReplyTarget(null);
      fetchMessages();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      showToast(axiosErr.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await axios.delete(`${apiBase}/api/admin/messages/${id}`, authHeaders);
      showToast('Message deleted');
      fetchMessages();
    } catch {
      showToast('Failed to delete message');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold">Portfolio Admin Login</h2>
            </div>
            <button type="button" onClick={onExit} className="text-xs text-slate-500 hover:underline">
              ← Back
            </button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              placeholder="Enter ADMIN_PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 text-sm font-semibold"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Public Site
          </button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          {(
            [
              ['projects', `Projects (${projects.length})`],
              ['profile', 'Profile & Details'],
              ['messages', `Messages (${messages.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold ${
                tab === key
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 text-red-500 px-3 py-1.5 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {tab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveProject}
            className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 h-fit"
          >
            <h2 className="text-base font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" />
              {editingId ? 'Edit Project' : 'Add New Project'}
            </h2>
            <input
              type="text"
              required
              placeholder="Project Name"
              value={projForm.name}
              onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={projForm.category}
                onChange={(e) =>
                  setProjForm({ ...projForm, category: e.target.value as ProjectCategory })
                }
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              >
                <option value="MERN">MERN</option>
                <option value="Client">Client</option>
                <option value="Production">Production</option>
              </select>
              <input
                type="text"
                required
                placeholder="Badge (e.g. Full-Stack MERN)"
                value={projForm.badge}
                onChange={(e) => setProjForm({ ...projForm, badge: e.target.value })}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Period (e.g. 2024 – Present)"
                value={projForm.period}
                onChange={(e) => setProjForm({ ...projForm, period: e.target.value })}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              />
              <input
                type="url"
                placeholder="Live URL (optional)"
                value={projForm.url}
                onChange={(e) => setProjForm({ ...projForm, url: e.target.value })}
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
              />
            </div>
            <textarea
              rows={2}
              required
              placeholder="Project summary..."
              value={projForm.summary}
              onChange={(e) => setProjForm({ ...projForm, summary: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <textarea
              rows={3}
              placeholder="Highlights (one per line)"
              value={projForm.highlightsText}
              onChange={(e) => setProjForm({ ...projForm, highlightsText: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Tech stack (comma separated)"
              value={projForm.stackText}
              onChange={(e) => setProjForm({ ...projForm, stackText: e.target.value })}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-semibold"
              >
                <Save className="w-4 h-4" /> {editingId ? 'Update Project' : 'Add Project'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setProjForm(EMPTY_PROJECT);
                  }}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {projects.map((p) => (
              <div
                key={p._id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-semibold text-indigo-500">
                    {p.badge} · {p.period}
                  </div>
                  <div className="font-bold">{p.name}</div>
                  <p className="text-xs text-slate-500 mt-1">{p.summary}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditProject(p)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 hover:text-indigo-500"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(p._id)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
        >
          <h2 className="text-base font-bold">Edit Portfolio Profile &amp; Resume Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={profForm.name}
              onChange={(e) => setProfForm({ ...profForm, name: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Role Title"
              value={profForm.roleTitle}
              onChange={(e) => setProfForm({ ...profForm, roleTitle: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Availability Badge"
              value={profForm.availabilityBadge}
              onChange={(e) => setProfForm({ ...profForm, availabilityBadge: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Location"
              value={profForm.location}
              onChange={(e) => setProfForm({ ...profForm, location: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={profForm.email}
              onChange={(e) => setProfForm({ ...profForm, email: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Phone"
              value={profForm.phone}
              onChange={(e) => setProfForm({ ...profForm, phone: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <input
              type="url"
              placeholder="LinkedIn URL"
              value={profForm.linkedin}
              onChange={(e) => setProfForm({ ...profForm, linkedin: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <input
              type="url"
              placeholder="GitHub URL"
              value={profForm.github}
              onChange={(e) => setProfForm({ ...profForm, github: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            rows={3}
            placeholder="Professional Summary"
            value={profForm.summary}
            onChange={(e) => setProfForm({ ...profForm, summary: e.target.value })}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Skills (JSON)</label>
              <textarea
                rows={8}
                value={profForm.skillsJson}
                onChange={(e) => setProfForm({ ...profForm, skillsJson: e.target.value })}
                className="w-full font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Experiences (JSON)</label>
              <textarea
                rows={8}
                value={profForm.experiencesJson}
                onChange={(e) => setProfForm({ ...profForm, experiencesJson: e.target.value })}
                className="w-full font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3"
              />
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-sm font-semibold"
          >
            <Save className="w-4 h-4" /> Save All Profile Changes
          </button>
        </form>
      )}

      {tab === 'messages' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Email Reply Engine:{' '}
              <strong className={smtpConfigured ? 'text-emerald-500' : 'text-amber-500'}>
                {smtpConfigured
                  ? 'SMTP Active (Nodemailer)'
                  : 'SMTP Not Configured (Replies saved to DB; use Open Mail App fallback)'}
              </strong>
            </span>
          </div>

          {messages.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-slate-500">
              No messages yet.
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m._id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold">{m.name}</span>{' '}
                    <span className="text-xs text-indigo-500">&lt;{m.email}&gt;</span>
                    <span className="ml-2 text-xs text-slate-500">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      m.status === 'REPLIED'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-amber-500/15 text-amber-500'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{m.message}</p>
                {m.status === 'REPLIED' && m.replyBody && (
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/70 p-3 text-xs border-l-2 border-emerald-500">
                    <strong>Replied ({m.replySubject}):</strong> {m.replyBody}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openReplyModal(m)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" /> Reply via Email
                  </button>
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent('Re: Portfolio Inquiry')}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5" /> Open Mail App
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(m._id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-red-500 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {replyTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={() => setReplyTarget(null)}
        >
          <form
            onSubmit={handleSendReply}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold">
              Reply to {replyTarget.name} ({replyTarget.email})
            </h3>
            <input
              type="text"
              required
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              placeholder="Email Subject"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <textarea
              rows={5}
              required
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write your reply..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingReply}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                <Send className="w-4 h-4" /> {sendingReply ? 'Sending...' : 'Send Email Reply'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
