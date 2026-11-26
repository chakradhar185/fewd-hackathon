import React from 'react';
import { Calendar, FolderKanban } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmptyState, PageHeader, StatusBadge } from '../../components/UI';
import { formatDate } from '../../utils/formatters';

const STATUSES = ['To Do', 'In Progress', 'Completed'];

export default function MyTasks() {
  const { data, currentEmployee, updateTaskStatus } = useApp();

  if (!currentEmployee) return null;

  const myTasks = data.tasks.filter((t) => t.assigneeId === currentEmployee.id);
  const myProjects = data.projects.filter(
    (p) =>
      p.assignedEmployees.includes(currentEmployee.id) ||
      myTasks.some((t) => t.projectId === p.id)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks & Projects"
        subtitle="Track your assigned deliverables and update task progress"
        breadcrumbs={['Employee', 'My Tasks']}
      />

      {/* Relevant Projects */}
      {myProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-card"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {p.department} Project
                </span>
                <StatusBadge status={p.status} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{p.description}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex flex-wrap gap-1">
                  {(p.requiredSkills || []).map((sk) => (
                    <span
                      key={sk}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due {formatDate(p.deadline)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* My Kanban / Task Columns */}
      {myTasks.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No tasks assigned yet"
          description="Tasks assigned to you by your manager or owner will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {STATUSES.map((col) => {
            const colTasks = myTasks.filter((t) => t.status === col);
            return (
              <div
                key={col}
                className="bg-slate-100/80 dark:bg-slate-900/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 min-h-[260px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold">{col}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800">
                    {colTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {colTasks.map((t) => {
                    const proj = data.projects.find((p) => p.id === t.projectId);
                    return (
                      <div
                        key={t.id}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                            {proj?.title || 'Assigned Task'}
                          </span>
                          <StatusBadge status={t.priority} />
                        </div>
                        <h4 className="text-xs font-bold">{t.title}</h4>
                        {t.description && (
                          <p className="text-[11px] text-slate-500">{t.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                          <span className="text-slate-400">Due {formatDate(t.deadline)}</span>
                          <select
                            value={t.status}
                            onChange={(e) =>
                              updateTaskStatus(t.id, e.target.value, currentEmployee.name)
                            }
                            className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
