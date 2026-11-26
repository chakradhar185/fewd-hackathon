import React, { useState } from 'react';
import { CheckCheck, Megaphone, Pin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal, PageHeader, StatusBadge } from '../../components/UI';
import { formatDate } from '../../utils/formatters';

export default function EmployeeAnnouncements() {
  const { data, currentEmployee, markAnnouncementRead } = useApp();
  const [selected, setSelected] = useState(null);

  if (!currentEmployee) return null;

  const sorted = [...data.announcements].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned)
  );

  const openDetail = (ann) => {
    markAnnouncementRead(ann.id, currentEmployee.id);
    setSelected(ann);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Announcements"
        subtitle="Stay up to date with leadership updates, engineering rollouts, and events"
        breadcrumbs={['Employee', 'Announcements']}
      />

      <div className="space-y-4">
        {sorted.map((ann) => {
          const isRead = (ann.readBy || []).includes(currentEmployee.id);
          return (
            <div
              key={ann.id}
              onClick={() => openDetail(ann)}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-card hover:shadow-card-hover cursor-pointer transition-all ${
                !isRead
                  ? 'border-indigo-300 dark:border-indigo-700'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  {!isRead && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-600 text-white">
                      Unread
                    </span>
                  )}
                  {ann.pinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      <Pin className="h-3 w-3" /> Pinned
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800">
                    {ann.category}
                  </span>
                  <StatusBadge status={ann.priority} />
                </div>
                <span className="text-xs text-slate-400">{formatDate(ann.publishDate)}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-indigo-600 shrink-0" />
                {ann.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2">
                {ann.description}
              </p>

              {isRead && (
                <p className="mt-2.5 text-[11px] text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                  <CheckCheck className="h-3.5 w-3.5" /> Read
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title || 'Announcement'}
        subtitle={`${selected?.category || ''} • Published ${formatDate(selected?.publishDate)}`}
      >
        {selected && (
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2">
              <StatusBadge status={selected.priority} />
              {selected.pinned && <StatusBadge status="Pinned" />}
            </div>
            <p>{selected.description}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
