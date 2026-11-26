import React, { useState } from 'react';
import { Award, Edit3, Plus, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, Modal, PageHeader, ProgressBar, StatusBadge } from '../../components/UI';

export default function PerformanceManagement() {
  const { data, upsertPerformanceReview } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: data.employees[0]?.id || '',
    cycle: 'Q4 2026',
    score: 90,
    reviewStatus: 'Completed',
    feedback: '',
    goalTitle: '',
    goalProgress: 70,
  });

  const openEditor = (emp, existingReview) => {
    setForm({
      employeeId: emp.id,
      cycle: existingReview?.cycle || 'Q4 2026',
      score: existingReview?.score ?? emp.performanceScore ?? 85,
      reviewStatus: existingReview?.reviewStatus || 'In Review',
      feedback: existingReview?.feedback || '',
      goalTitle: existingReview?.goals?.[0]?.title || '',
      goalProgress: existingReview?.goals?.[0]?.progress ?? 60,
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const existing = data.performanceReviews.find((r) => r.employeeId === form.employeeId);
    let goals = existing?.goals ? [...existing.goals] : [];
    if (form.goalTitle.trim()) {
      if (goals.length > 0) {
        goals[0] = { ...goals[0], title: form.goalTitle.trim(), progress: Number(form.goalProgress) };
      } else {
        goals = [{ id: `G-${Date.now()}`, title: form.goalTitle.trim(), progress: Number(form.goalProgress) }];
      }
    }
    upsertPerformanceReview({
      employeeId: form.employeeId,
      cycle: form.cycle,
      score: Number(form.score),
      reviewStatus: form.reviewStatus,
      feedback: form.feedback,
      goals,
    });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Management"
        subtitle="Track employee scores, quarterly goals, task completion, and manager feedback"
        breadcrumbs={['Owner', 'Performance']}
        actions={
          <button
            type="button"
            onClick={() => openEditor(data.employees[0], null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add / Update Review
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {data.employees.map((emp) => {
          const review = data.performanceReviews.find((r) => r.employeeId === emp.id);
          const empTasks = data.tasks.filter((t) => t.assigneeId === emp.id);
          const completedTasks = empTasks.filter((t) => t.status === 'Completed').length;
          const score = review?.score ?? emp.performanceScore ?? 85;

          return (
            <div
              key={emp.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={emp.name} color={emp.avatarColor} size="md" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {emp.designation} • {emp.department}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={review?.reviewStatus || 'Pending'} />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <Award className="h-3.5 w-3.5 text-indigo-600" />
                      Performance Score
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {score}/100
                    </span>
                  </div>
                  <ProgressBar value={score} color="auto" />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Task Completion</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {completedTasks}/{empTasks.length} tasks
                  </span>
                </div>

                {review?.goals && review.goals.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Target className="h-3 w-3" /> Active Goals
                    </p>
                    {review.goals.slice(0, 2).map((g) => (
                      <div key={g.id} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="truncate pr-2">{g.title}</span>
                          <span className="font-semibold">{g.progress}%</span>
                        </div>
                        <ProgressBar value={g.progress} color="emerald" height="h-1.5" />
                      </div>
                    ))}
                  </div>
                )}

                {review?.feedback && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2">
                    "{review.feedback}"
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => openEditor(emp, review)}
                className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Update Score, Goals & Feedback
              </button>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Performance Review & Goals"
        subtitle="Updates appear immediately in the employee's My Performance view"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Employee</label>
              <select
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {data.employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Review Status</label>
              <select
                value={form.reviewStatus}
                onChange={(e) => setForm({ ...form, reviewStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option>Completed</option>
                <option>In Review</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              Performance Score: {form.score}/100
            </label>
            <input
              type="range"
              min={40}
              max={100}
              value={form.score}
              onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold mb-1">Primary Goal</label>
              <input
                type="text"
                value={form.goalTitle}
                onChange={(e) => setForm({ ...form, goalTitle: e.target.value })}
                placeholder="e.g., Ship Q4 Checkout Redesign"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Progress %</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.goalProgress}
                onChange={(e) => setForm({ ...form, goalProgress: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Manager Feedback</label>
            <textarea
              rows={3}
              required
              value={form.feedback}
              onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              placeholder="Write constructive feedback and recognition..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Save Review
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
