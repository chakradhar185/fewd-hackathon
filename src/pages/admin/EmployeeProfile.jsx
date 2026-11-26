import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, EmptyState, PageHeader, ProgressBar, StatusBadge } from '../../components/UI';
import { formatCurrency, formatDate, formatTime12h } from '../../utils/formatters';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'attendance', label: 'Attendance & Leaves' },
  { id: 'projects', label: 'Assigned Projects' },
  { id: 'performance', label: 'Skills & Performance' },
];

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useApp();
  const [tab, setTab] = useState('overview');

  const employee = data.employees.find((e) => e.id === id);

  if (!employee) {
    return (
      <EmptyState
        icon={UserCheck}
        title="Employee not found"
        description="The requested employee record could not be located."
        action={
          <button
            type="button"
            onClick={() => navigate('/admin/employees')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Back to Directory
          </button>
        }
      />
    );
  }

  const empAttendance = data.attendance
    .filter((a) => a.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const empLeaves = data.leaveRequests.filter((l) => l.employeeId === employee.id);
  const empProjects = data.projects.filter((p) =>
    p.assignedEmployees.includes(employee.id)
  );
  const empTasks = data.tasks.filter((t) => t.assigneeId === employee.id);
  const empReview = data.performanceReviews.find((r) => r.employeeId === employee.id);
  const empActivities = data.activities.filter((a) => a.employeeId === employee.id);

  const totalLeaveDays =
    (employee.leaveBalance?.casual || 0) +
    (employee.leaveBalance?.sick || 0) +
    (employee.leaveBalance?.earned || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.name}
        subtitle={`${employee.designation} • ${employee.department}`}
        breadcrumbs={['Owner', 'Employees', employee.id]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/admin/employees')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </button>
        }
      />

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar
            name={employee.name}
            color={employee.avatarColor}
            src={employee.avatarUrl}
            size="xl"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {employee.name}
              </h2>
              <StatusBadge status={employee.status} />
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {employee.id}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {employee.designation} • {employee.department} ({employee.employmentType})
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                {employee.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                {employee.phone || 'Not provided'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Joined {formatDate(employee.joiningDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-center">
            <p className="text-[11px] text-slate-500">Performance</p>
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {employee.performanceScore}%
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-center">
            <p className="text-[11px] text-slate-500">Leave Balance</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{totalLeaveDays}d</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-center">
            <p className="text-[11px] text-slate-500">Salary</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(employee.salary)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold">Employment Details</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Reporting Manager</span>
                <span className="font-semibold">{employee.manager || 'Executive Board'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Experience</span>
                <span className="font-semibold">{employee.experience} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Workload</span>
                <span className="font-semibold">{employee.workload}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location</span>
                <span className="font-semibold inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {employee.address || 'San Francisco, CA'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold">Leave Balance Breakdown</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span>Casual Leave</span>
                <span className="font-bold">{employee.leaveBalance?.casual ?? 0} days</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span>Sick Leave</span>
                <span className="font-bold">{employee.leaveBalance?.sick ?? 0} days</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span>Earned Leave</span>
                <span className="font-bold">{employee.leaveBalance?.earned ?? 0} days</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-3">
            <h3 className="text-sm font-bold">Recent Activity</h3>
            {empActivities.length === 0 ? (
              <p className="text-xs text-slate-500">No recent activity logged for this employee.</p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {empActivities.slice(0, 4).map((a) => (
                  <div key={a.id} className="border-l-2 border-indigo-500 pl-3 py-0.5">
                    <p className="text-slate-700 dark:text-slate-200">{a.action}</p>
                    <p className="text-[11px] text-slate-400">{a.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
            <h3 className="text-sm font-bold mb-3">Recent Attendance Logs</h3>
            <div className="space-y-2">
              {empAttendance.slice(0, 8).map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
                >
                  <span className="font-medium">{formatDate(a.date)}</span>
                  <span className="text-slate-500">
                    {formatTime12h(a.checkIn)} – {formatTime12h(a.checkOut)}
                  </span>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
            <h3 className="text-sm font-bold mb-3">Leave History</h3>
            {empLeaves.length === 0 ? (
              <p className="text-xs text-slate-500">No leave requests found.</p>
            ) : (
              <div className="space-y-2.5">
                {empLeaves.map((lv) => (
                  <div
                    key={lv.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold">
                        {lv.leaveType} ({lv.days}d)
                      </p>
                      <p className="text-slate-500">
                        {formatDate(lv.startDate)} – {formatDate(lv.endDate)}
                      </p>
                    </div>
                    <StatusBadge status={lv.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'projects' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              Assigned Projects ({empProjects.length})
            </h3>
            {empProjects.length === 0 ? (
              <p className="text-xs text-slate-500">Not assigned to any project yet.</p>
            ) : (
              <div className="space-y-3">
                {empProjects.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{p.title}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
            <h3 className="text-sm font-bold mb-3">Assigned Tasks ({empTasks.length})</h3>
            {empTasks.length === 0 ? (
              <p className="text-xs text-slate-500">No tasks assigned.</p>
            ) : (
              <div className="space-y-2.5">
                {empTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-slate-500">Due {formatDate(t.deadline)}</p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              Skill Proficiency Matrix
            </h3>
            <div className="space-y-3">
              {Object.entries(employee.skills || {}).map(([skill, val]) => (
                <div key={skill}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{skill}</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {val}%
                    </span>
                  </div>
                  <ProgressBar value={val} color="auto" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-600" />
              Performance & Goals
            </h3>
            {empReview ? (
              <>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <p className="font-semibold mb-1">Manager Feedback ({empReview.cycle})</p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {empReview.feedback}
                  </p>
                </div>
                <div className="space-y-2.5">
                  {(empReview.goals || []).map((g) => (
                    <div key={g.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{g.title}</span>
                        <span className="font-semibold">{g.progress}%</span>
                      </div>
                      <ProgressBar value={g.progress} color="emerald" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-500">
                Current score: {employee.performanceScore}/100. No detailed review notes logged yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
