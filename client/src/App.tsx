import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { ExternalLink, Menu, Moon, Shield, Sun, X } from 'lucide-react';
import { FALLBACK_PROFILE, FALLBACK_PROJECTS } from './data/profileData';
import AdminPanel from './components/AdminPanel';
import { ProfileData, ProjectItem } from './types/portfolio';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [dark, setDark] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [skillCat, setSkillCat] = useState('All');
  const [profile, setProfile] = useState<ProfileData>(FALLBACK_PROFILE);
  const [expId, setExpId] = useState(FALLBACK_PROFILE.experiences[0].id);
  const [projCat, setProjCat] = useState('All');
  const [projects, setProjects] = useState<ProjectItem[]>(FALLBACK_PROJECTS);
  const [modalProj, setModalProj] = useState<ProjectItem | null>(null);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const loadPortfolio = useCallback(() => {
    axios
      .get<{ success: boolean; profile?: ProfileData; projects?: ProjectItem[] }>(
        `${API_BASE}/api/portfolio`
      )
      .then((res) => {
        if (res.data?.success) {
          if (res.data.profile) {
            setProfile(res.data.profile);
            if (res.data.profile.experiences?.length) {
              setExpId((prev) => prev || res.data.profile!.experiences[0].id);
            }
          }
          if (Array.isArray(res.data.projects) && res.data.projects.length > 0) {
            setProjects(res.data.projects);
          }
        }
      })
      .catch(() => {
        // Keep fallback data if backend is offline
      });
  }, []);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      showToast(`Copied ${profile.email}`);
    } catch {
      showToast(`Email: ${profile.email}`);
    }
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/contact`, form);
      showToast(`Thanks ${form.name}! Your inquiry has been sent.`);
      setForm({ name: '', email: '', message: '' });
    } catch {
      showToast(`Thanks ${form.name}! Your inquiry has been noted.`);
      setForm({ name: '', email: '', message: '' });
    } finally {
      setSubmitting(false);
    }
  };

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white px-4 py-3 text-sm font-medium shadow-xl">
            {toast}
          </div>
        )}
        <AdminPanel
          apiBase={API_BASE}
          profile={profile}
          projects={projects}
          onPortfolioUpdated={loadPortfolio}
          onExit={() => setShowAdmin(false)}
          showToast={showToast}
        />
      </div>
    );
  }

  const skills = profile.skills || [];
  const experiences = profile.experiences || [];
  const filteredSkills = skillCat === 'All' ? skills : skills.filter((g) => g.category === skillCat);
  const filteredProjects = projCat === 'All' ? projects : projects.filter((p) => p.category === projCat);
  const selectedExp = experiences.find((e) => e.id === expId) || experiences[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white px-4 py-3 text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}

      {modalProj && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
          onClick={() => setModalProj(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {modalProj.badge}
                </span>
                <h3 className="text-xl font-bold mt-1">{modalProj.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{modalProj.period}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalProj(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">{modalProj.summary}</p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                {(modalProj.highlights || []).map((h, idx) => (
                  <li key={idx}>{h}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {(modalProj.stack || []).map((s) => (
                  <span key={s} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
              {modalProj.url && (
                <a
                  href={modalProj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-semibold"
                >
                  Visit Live Site <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                onClick={() => setModalProj(null)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#about" className="flex items-center gap-2.5 font-bold text-lg">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-extrabold">
              PB
            </span>
            <span>{profile.name}</span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#about" className="hover:text-indigo-500">About</a>
            <a href="#skills" className="hover:text-indigo-500">Skills</a>
            <a href="#experience" className="hover:text-indigo-500">Experience</a>
            <a href="#projects" className="hover:text-indigo-500">Projects</a>
            <a href="#education" className="hover:text-indigo-500">Credentials</a>
            <a href="#contact" className="hover:text-indigo-500">Contact</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdmin(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold hover:border-indigo-500"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-500" /> Admin
            </button>
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden rounded-lg border border-slate-200 dark:border-slate-800 p-2"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-2 text-sm font-medium">
            {['about', 'skills', 'experience', 'projects', 'education', 'contact'].map((sec) => (
              <a
                key={sec}
                href={`#${sec}`}
                onClick={() => setMobileOpen(false)}
                className="block py-1.5 capitalize hover:text-indigo-500"
              >
                {sec}
              </a>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-20">
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {profile.availabilityBadge}
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Hi, I'm <span className="text-indigo-600 dark:text-indigo-400">{profile.name}</span>
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-slate-700 dark:text-slate-300">
                {profile.roleTitle}
              </p>
              <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                {profile.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#projects" className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-sm font-semibold">
                Explore Projects
              </a>
              <a href="#contact" className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold">
                Contact Me
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium"
              >
                Copy Email
              </button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              {profile.linkedin && (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 font-medium">
                  LinkedIn ↗
                </a>
              )}
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 font-medium">
                  GitHub ↗
                </a>
              )}
              <a href={`tel:${profile.phone}`} className="hover:text-indigo-500 font-medium">
                {profile.phone}
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Career Impact</h2>
            <div className="grid grid-cols-2 gap-4">
              {(profile.metrics || []).map((m, i) => (
                <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-4">
                  <div className="text-2xl font-extrabold text-indigo-500">{m.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="skills" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Technical Skills</h2>
              <p className="text-sm text-slate-500 mt-1">Filter by domain to inspect my core stack.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['All', 'All'],
                ['Frontend', 'Frontend & Languages'],
                ['Backend', 'MERN & Backend'],
                ['UI', 'UI Libraries'],
                ['Quality', 'Performance & Testing'],
                ['Tools', 'Tools'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSkillCat(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    skillCat === key
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((group) => (
              <div key={group.title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                <h3 className="text-sm font-bold">{group.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {(group.items || []).map((item) => (
                    <span key={item} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedExp && (
          <section id="experience" className="space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Work Experience</h2>
              <p className="text-sm text-slate-500 mt-1">Select a role to view responsibilities and outcomes.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 flex flex-col gap-2">
                {experiences.map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setExpId(exp.id)}
                    className={`text-left rounded-xl p-4 border transition ${
                      expId === exp.id
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="text-sm font-bold">{exp.company}</div>
                    <div className="text-xs font-medium text-indigo-500 mt-0.5">{exp.role}</div>
                    <div className="text-xs text-slate-500 mt-1">{exp.period}</div>
                  </button>
                ))}
              </div>
              <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
                <div className="flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold">{selectedExp.role}</h3>
                    <p className="text-sm font-medium text-indigo-500">
                      {selectedExp.company} · {selectedExp.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold">
                    {selectedExp.period}
                  </span>
                </div>
                <ul className="mt-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                  {(selectedExp.bullets || []).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(selectedExp.tags || []).map((t) => (
                    <span key={t} className="rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 text-xs font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section id="projects" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Featured Projects</h2>
              <p className="text-sm text-slate-500 mt-1">Full-stack MERN applications, client platforms, and production systems.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['All', 'All'],
                ['MERN', 'Full-Stack (MERN)'],
                ['Client', 'Client Projects'],
                ['Production', 'Production Apps'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setProjCat(key)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold ${
                    projCat === key
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => (
              <article
                key={proj._id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 text-xs font-semibold">
                      {proj.badge}
                    </span>
                    <span className="text-xs text-slate-500">{proj.period}</span>
                  </div>
                  <h3 className="text-lg font-bold">{proj.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{proj.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(proj.stack || []).map((s) => (
                      <span key={s} className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalProj(proj)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Case Study →
                  </button>
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold hover:underline ml-auto"
                    >
                      Live Site ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="education" className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">Education, Certifications &amp; Awards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(profile.education || []).map((ed, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">{ed.typeLabel}</span>
                <h3 className="text-lg font-bold">{ed.title}</h3>
                <p className="text-sm text-slate-500">{ed.institution}</p>
                <p className="text-xs text-slate-500">{ed.period}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Achievements</span>
              <ul className="space-y-2 text-sm pt-1">
                {(profile.achievements || []).map((a, i) => (
                  <li key={i}>🏆 {a}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-2xl font-bold">Let's Connect</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Messages submitted here are saved directly to MongoDB and can be viewed or replied to from the Admin Panel.
              </p>
              <div className="space-y-2 text-sm">
                <div>Email: <a href={`mailto:${profile.email}`} className="text-indigo-500 font-medium">{profile.email}</a></div>
                <div>Phone: <a href={`tel:${profile.phone}`} className="font-medium">{profile.phone}</a></div>
                <div>Location: {profile.location}</div>
              </div>
            </div>
            <form onSubmit={handleContactSubmit} className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm"
                />
              </div>
              <textarea
                rows={3}
                required
                placeholder="Share interview details or role requirements..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500">
        © 2026 {profile.name} · Built with TypeScript, MERN Stack &amp; Tailwind CSS
      </footer>
    </div>
  );
}
