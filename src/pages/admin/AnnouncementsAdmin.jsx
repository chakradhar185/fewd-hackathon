import React, { useState } from 'react';
import { Megaphone, Pin, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog, Modal, PageHeader, StatusBadge } from '../../components/UI';
import { formatDate, getLocalDateStr } from '../../utils/formatters';

export default function AnnouncementsAdmin() {
  const { data, createAnnouncement, deleteAnnouncement } = useApp();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'HR & People',
    publishDate: getLocalDateStr(0),
    priority: 'Normal',
    pinned: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    createAnnouncement(form);
    setForm({
      title: '',
      description: '',
      category: 'HR & People',
      publishDate: getLocalDateStr(0),
      priority: 'Normal',
      pinned: false,
    });
    setOpen(false);
  };

  const sorted = [...data.announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Broadcast updates, policy changes, and company events to all employees"
        breadcrumbs={['Owner', 'Announcements']}
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </button>
        }
      />

      <div className="space-y-4">
        {sorted.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-card ${
              ann.pinned
                ? 'border-indigo-200 dark:border-indigo-800/70'
                : 'border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {ann.pinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {ann.category}
                  </span>
                  <StatusBadge status={ann.priority} />
                  <span className="text-xs text-slate-400">
                    Published {formatDate(ann.publishDate)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-indigo-600 shrink-0" />
                  {ann.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ann.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(ann)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 self-start"
                title="Delete announcement"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option>HR & People</option>
                <option>Engineering</option>
                <option>Policy</option>
                <option>Company Event</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option>Normal</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Publish Date</label>
              <input
                type="date"
                value={form.publishDate}
                onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
            />
            Pin to top of announcements
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Publish
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteAnnouncement(deleteTarget.id)}
        title="Delete Announcement"
        message={`Remove "${deleteTarget?.title}" from company announcements?`}
        confirmLabel="Delete"
      />
    </div>
  );
}
