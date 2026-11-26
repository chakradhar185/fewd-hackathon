import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Cake,
  CalendarCheck,
  CalendarDays,
  CalendarOff,
  Check,
  CreditCard,
  FolderPlus,
  Megaphone,
  Plus,
  Sparkles,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Avatar,
  Modal,
  PageHeader,
  StatCard,
  StatusBadge,
} from '../../components/UI';
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  getGreeting,
  getLocalDateStr,
} from '../../utils/formatters';

const DEPT_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function AdminDashboard() {
  const { data, auth, reviewLeaveRequest, createAnnouncement } = useApp();
  const navigate = useNavigate();
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [annForm, setAnnForm] = useState({
    title: '',
    description: '',
    category: 'Company Event',
    priority: 'Normal',
    pinned: false,
  });

  const today = getLocalDateStr(0);

  const stats = useMemo(() => {
    const total = data.employees.length;
    const active = data.employees.filter((e) => e.status === 'Active').length;
    const todayRecs = data.attendance.filter((a) => a.date === today);
    const presentToday = todayRecs.filter(
      (a) => a.status === 'Present' || a.status === 'Late'
    ).length;
    const onLeave = data.employees.filter((e) => e.status === 'On Leave').length;
    const pendingLeaves = data.leaveRequests.filter((l) => l.status === 'Pending');
    const monthlyPayroll = data.employees.reduce((sum, e) => sum + Number(e.salary || 0), 0);

    return {
      total,
      active,
      presentToday,
      onLeave,
      pendingLeaves,
      monthlyPayroll,
    };
  }, [data.employees, data.attendance, data.leaveRequests, today]);

  const weeklyAttendanceData = useMemo(() => {
    const days = [];
    for (let i = -6; i <= 0; i++) {
      const dateStr = getLocalDateStr(i);
      const recs = data.attendance.filter((a) => a.date === dateStr);
      const present = recs.filter((a) => a.status === 'Present').length;
      const late = recs.filter((a) => a.status === 'Late').length;
      const absentOrLeave = recs.filter(
        (a) => a.status === 'Absent' || a.status === 'On Leave'
      ).length;
      days.push({
        day: i === 0 ? 'Today' : formatShortDate(dateStr),
        Present: present,
        Late: late,
        Away: absentOrLeave,
      });
    }
    return days;
  }, [data.attendance]);

  const deptDistribution = useMemo(() => {
    const counts = data.employees.reduce((acc, e) => {
      acc[e.department] = (acc[e.department] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data.employees]);

  const hiringGrowthData = useMemo(() => {
    const base = Math.max(8, data.employees.length - 6);
    return [
      { month: 'Jun', headcount: base },
      { month: 'Jul', headcount: base + 1 },
      { month: 'Aug', headcount: base + 2 },
      { month: 'Sep', headcount: base + 4 },
      { month: 'Oct', headcount: base + 5 },
      { month: 'Nov', headcount: data.employees.length },
    ];
  }, [data.employees.length]);

  const departmentStats = useMemo(() => {
    return data.departments.map((d) => {
      const members = data.employees.filter((e) => e.department === d.name);
      const avgPerf = members.length
        ? Math.round(members.reduce((s, e) => s + (e.performanceScore || 85), 0) / members.length)
        : 0;
      return {
        name: d.name.replace('Human Resources', 'HR'),
        Employees: members.length,
        AvgScore: avgPerf,
      };
    });
  }, [data.departments, data.employees]);

  const upcomingBirthdays = useMemo(() => {
    return [...data.employees]
      .filter((e) => e.birthday >= today)
      .sort((a, b) => a.birthday.localeCompare(b.birthday))
      .slice(0, 4);
  }, [data.employees, today]);

  const topTeams = useMemo(() => {
    return [...departmentStats].sort((a, b) => b.AvgScore - a.AvgScore).slice(0, 3);
  }, [departmentStats]);

  const handleQuickAnnounce = (e) => {
    e.preventDefault();
    if (!annForm.title.trim() || !annForm.description.trim()) return;
    createAnnouncement({ ...annForm, publishDate: today });
    setAnnForm({ title: '', description: '', category: 'Company Event', priority: 'Normal', pinned: false });
    setAnnounceOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getGreeting(auth?.name?.split(' ')[0] || 'Admin')} 👋`}
        subtitle={`Workforce command center • ${formatDate(today)}`}
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate('/admin/matcher')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Smart Project Matcher
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/employees?add=1')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              <UserPlus className="h-4 w-4 text-indigo-600" />
              Add Employee
            </button>
          </>
        }
      />

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Add Employee', icon: UserPlus, onClick: () => navigate('/admin/employees?add=1') },
          { label: 'Assign Task', icon: Plus, onClick: () => navigate('/admin/projects?newTask=1') },
          { label: 'Create Project', icon: FolderPlus, onClick: () => navigate('/admin/projects?newProject=1') },
          { label: 'Approve Leave', icon: CalendarCheck, onClick: () => navigate('/admin/leaves') },
          { label: 'Post Announcement', icon: Megaphone, onClick: () => setAnnounceOpen(true) },
        ].map((qa) => {
          const Icon = qa.icon;
          return (
            <button
              key={qa.label}
              type="button"
              onClick={qa.onClick}
              className="flex items-center gap-2.5 px-3.5 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 hover:shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all"
            >
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Icon className="h-4 w-4" />
              </div>
              <span className="truncate">{qa.label}</span>
            </button>
          );
        })}
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Employees"
          value={stats.total}
          subtitle={`${data.departments.length} departments`}
          icon={Users}
          accent="indigo"
          onClick={() => navigate('/admin/employees')}
        />
        <StatCard
          title="Active Employees"
          value={stats.active}
          trend={`${Math.round((stats.active / Math.max(1, stats.total)) * 100)}%`}
          subtitle="of workforce"
          icon={UserCheck}
          accent="emerald"
          onClick={() => navigate('/admin/employees')}
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          subtitle="Checked in"
          icon={CalendarCheck}
          accent="blue"
          onClick={() => navigate('/admin/attendance')}
        />
        <StatCard
          title="On Leave"
          value={stats.onLeave}
          subtitle="Approved today"
          icon={CalendarOff}
          accent="violet"
          onClick={() => navigate('/admin/leaves')}
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves.length}
          subtitle="Need review"
          icon={CalendarDays}
          accent="amber"
          onClick={() => navigate('/admin/leaves')}
        />
        <StatCard
          title="Monthly Payroll"
          value={formatCurrency(stats.monthlyPayroll)}
          subtitle="Gross estimate"
          icon={CreditCard}
          accent="indigo"
          onClick={() => navigate('/admin/payroll')}
        />
      </div>

      {/* Primary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Attendance Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Attendance Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                7-day breakdown of on-time, late, and away employees
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="Present" stackId="a" fill="#4f46e5" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Late" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Away" stackId="a" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Distribution by Department */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Department Distribution
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Headcount split across teams
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={3}
                >
                  {deptDistribution.map((entry, idx) => (
                    <Cell key={entry.name} fill={DEPT_COLORS[idx % DEPT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {deptDistribution.map((d, idx) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: DEPT_COLORS[idx % DEPT_COLORS.length] }}
                />
                <span className="truncate text-slate-600 dark:text-slate-300">{d.name}</span>
                <span className="font-semibold ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hiring Growth */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Hiring & Headcount Growth
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            6-month organizational growth trajectory
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hiringGrowthData}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="headcount"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#growthGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Statistics */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Department Performance & Size
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Average performance score by department
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="AvgScore" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Operational Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pending Leave Approvals */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pending Leave Approvals
            </h3>
            <button
              type="button"
              onClick={() => navigate('/admin/leaves')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all
            </button>
          </div>
          {stats.pendingLeaves.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              All caught up — no pending requests.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.pendingLeaves.slice(0, 4).map((lv) => {
                const emp = data.employees.find((e) => e.id === lv.employeeId);
                return (
                  <div
                    key={lv.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar name={emp?.name || lv.employeeId} color={emp?.avatarColor} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {emp?.name || lv.employeeId}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {lv.leaveType} • {lv.days}d ({formatShortDate(lv.startDate)})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => reviewLeaveRequest(lv.id, 'Approved')}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                        title="Approve"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reviewLeaveRequest(lv.id, 'Rejected')}
                        className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
                        title="Reject"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3.5">
            {data.activities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    <span className="font-semibold text-slate-900 dark:text-white">{act.actor}</span>{' '}
                    {act.action}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Birthdays, Holidays & Top Teams */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Top-Performing Teams
            </h3>
            <div className="space-y-2.5">
              {topTeams.map((t, i) => (
                <div key={t.name} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {i + 1}. {t.name} ({t.Employees})
                  </span>
                  <StatusBadge status={`${t.AvgScore}% avg`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Cake className="h-4 w-4 text-rose-500" />
              Upcoming Birthdays & Holidays
            </h3>
            <div className="space-y-2 text-xs">
              {upcomingBirthdays.slice(0, 2).map((emp) => (
                <div key={emp.id} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>🎂 {emp.name}</span>
                  <span className="text-slate-400">{formatShortDate(emp.birthday)}</span>
                </div>
              ))}
              {data.holidays.slice(0, 2).map((hol) => (
                <div key={hol.id} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>📅 {hol.name}</span>
                  <span className="text-slate-400">{formatShortDate(hol.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Announcement Modal */}
      <Modal
        open={announceOpen}
        onClose={() => setAnnounceOpen(false)}
        title="Post Company Announcement"
        subtitle="Immediately visible in the Employee Portal"
      >
        <form onSubmit={handleQuickAnnounce} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Title</label>
            <input
              type="text"
              required
              value={annForm.title}
              onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
              placeholder="e.g., Q4 All-Hands Meeting"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={annForm.category}
                onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option>Company Event</option>
                <option>HR & People</option>
                <option>Engineering</option>
                <option>Policy</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select
                value={annForm.priority}
                onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option>Normal</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={annForm.description}
              onChange={(e) => setAnnForm({ ...annForm, description: e.target.value })}
              placeholder="Write announcement details..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={annForm.pinned}
              onChange={(e) => setAnnForm({ ...annForm, pinned: e.target.checked })}
            />
            Pin this announcement to top
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAnnounceOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Publish Announcement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
