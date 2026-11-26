import React from 'react';
import { Award, CheckCircle2, MessageSquareQuote, Target } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader, ProgressBar, StatusBadge } from '../../components/UI';

export default function MyPerformance() {
  const { data, currentEmployee } = useApp();

  if (!currentEmployee) return null;

  const review = data.performanceReviews.find(
    (r) => r.employeeId === currentEmployee.id
  );
  const score = review?.score ?? currentEmployee.performanceScore ?? 88;
  const myTasks = data.tasks.filter((t) => t.assigneeId === currentEmployee.id);
  const completedTasks = myTasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Performance"
        subtitle="Review your latest performance score, quarterly goals, and manager feedback"
        breadcrumbs={['Employee', 'My Performance']}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overall Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {review?.cycle || 'Q4 2026'} Evaluation
              </span>
              <StatusBadge status={review?.reviewStatus || 'Completed'} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {score}
              </span>
              <span className="text-sm text-slate-400">/ 100</span>
            </div>
            <div className="mt-3">
              <ProgressBar value={score} color="auto" height="h-2.5" />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Task Completion</span>
            <span className="font-bold">
              {completedTasks} / {myTasks.length} completed
            </span>
          </div>
        </div>

        {/* Manager Feedback */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <MessageSquareQuote className="h-[18px] w-[18px] text-indigo-600" />
            Manager Feedback
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            {review?.feedback ||
              'Consistent contributor with strong engineering execution and positive cross-team collaboration.'}
          </p>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-500" /> Key Achievements
            </h4>
            <div className="space-y-2">
              {(review?.achievements || ['Maintained high sprint velocity and code quality']).map(
                (ach, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{ach}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card">
        <h3 className="text-base font-bold flex items-center gap-2 mb-4">
          <Target className="h-[18px] w-[18px] text-emerald-600" />
          Quarterly Goals & Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(review?.goals || []).map((g) => (
            <div
              key={g.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-2.5"
            >
              <p className="text-xs font-bold text-slate-900 dark:text-white">{g.title}</p>
              <ProgressBar value={g.progress} color="emerald" showLabel />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
