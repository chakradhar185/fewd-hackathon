import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarCheck,
  CalendarOff,
  CheckCircle2,
  Clock,
  CreditCard,
  FolderKanban,
  LogIn,
  LogOut,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader, StatCard, StatusBadge } from '../../components/UI';
import {
  formatCurrency,
  formatDate,
  formatShortDate,
  formatTime12h,
  getGreeting,
  getLocalDateStr,
} from '../../utils/formatters';

export default function EmployeeDashboard() {
  const { data, currentEmployee, checkIn, checkOut, updateTaskStatus } = useApp();
  const navigate = useNavigate();
  const today = getLocalDateStr(0);

  const weeklyHoursChart = useMemo(() => {
    const out = [];
    for (let i = -6; i <= 0; i++) {
      const d = getLocalDateStr(i);
      const rec = currentEmployee
        ? data.attendance.find(
            (a) => a.employeeId === currentEmployee.id && a.date === d
          )
        : null;
      out.push({
        day: i === 0 ? 'Today' : formatShortDate(d),
        Hours: rec?.hours || 0,
      });
    }
    return out;
  }, [data.attendance, currentEmployee]);

  if (!currentEmployee) return null;

  const firstName = currentEmployee.name.split(' ')[0];
  const todayRecord = data.attendance.find(
    (a) => a.employeeId === currentEmployee.id && a.date === today
  );
  const hasCheckedIn = Boolean(todayRecord && todayRecord.checkIn !== '--:--');
  const hasCheckedOut = Boolean(todayRecord && todayRecord.checkOut !== '--:--');

  const totalLeaveBalance =
    (currentEmployee.leaveBalance?.casual || 0) +
    (currentEmployee.leaveBalance?.sick || 0) +
    (currentEmployee.leaveBalance?.earned || 0);

  const myTasks = data.tasks.filter((t) => t.assigneeId === currentEmployee.id);
  const pendingTasks = myTasks.filter((t) => t.status !== 'Completed');
  const myLeaves = data.leaveRequests.filter((l) => l.employeeId === currentEmployee.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getGreeting(firstName)} 👋`}
        subtitle={`${currentEmployee.designation} • ${currentEmployee.department} • ${formatDate(today)}`}
        actions={
          <div className="flex items-center gap-2">
            {!hasCheckedIn ? (
              <button
                type="button"
                onClick={() => checkIn(currentEmployee.id)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Check In Now
              </button>
            ) : !hasCheckedOut ? (
              <button
                type="button"
                onClick={() => checkOut(currentEmployee.id)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Check Out
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                Shift Completed ({todayRecord.hours} hrs)
              </span>
            )}
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Attendance Status"
          value={todayRecord?.status || 'Not Checked In'}
          subtitle={hasCheckedIn ? `In at ${formatTime12h(todayRecord.checkIn)}` : 'Ready to check in'}
          icon={CalendarCheck}
          accent={hasCheckedIn ? 'emerald' : 'amber'}
          onClick={() => navigate('/employee/attendance')}
        />
        <StatCard
          title="Hours Today"
          value={todayRecord?.hours ? `${todayRecord.hours}h` : hasCheckedIn ? 'Active' : '0h'}
          subtitle={hasCheckedOut ? `Out at ${formatTime12h(todayRecord.checkOut)}` : 'Shift tracker'}
          icon={Clock}
          accent="blue"
          onClick={() => navigate('/employee/attendance')}
        />
        <StatCard
          title="Leave Balance"
          value={`${totalLeaveBalance} days`}
          subtitle="Casual, Sick & Earned"
          icon={CalendarOff}
          accent="violet"
          onClick={() => navigate('/employee/leaves')}
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length}
          subtitle={`${myTasks.length} total assigned`}
          icon={FolderKanban}
          accent="amber"
          onClick={() => navigate('/employee/tasks')}
        />
        <StatCard
          title="Monthly Salary"
          value={formatCurrency(currentEmployee.salary)}
          subtitle="Gross compensation"
          icon={CreditCard}
          accent="indigo"
          onClick={() => navigate('/employee/payslips')}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Attendance Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold">My Weekly Working Hours</h3>
              <p className="text-xs text-slate-500">Logged hours over the last 7 days</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/employee/attendance')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Attendance
            </button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHoursChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="Hours" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <h3 className="text-base font-bold mb-3">Upcoming Holidays</h3>
          <div className="space-y-2.5">
            {data.holidays.slice(0, 4).map((h) => (
              <div
                key={h.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{h.name}</p>
                  <p className="text-[11px] text-slate-500">{h.type}</p>
                </div>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatShortDate(h.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Tasks, Announcements, Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* My Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold">My Tasks</h3>
            <button
              type="button"
              onClick={() => navigate('/employee/tasks')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Manage
            </button>
          </div>
          {myTasks.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No tasks assigned yet.</p>
          ) : (
            <div className="space-y-2.5">
              {myTasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{t.title}</p>
                    <p className="text-[11px] text-slate-500">Due {formatShortDate(t.deadline)}</p>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => updateTaskStatus(t.id, e.target.value, currentEmployee.name)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Announcements */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold flex items-center gap-1.5">
              <Megaphone className="h-4 w-4 text-indigo-600" />
              Announcements
            </h3>
            <button
              type="button"
              onClick={() => navigate('/employee/announcements')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-2.5">
            {data.announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                onClick={() => navigate('/employee/announcements')}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {ann.title}
                  </span>
                  <StatusBadge status={ann.priority} />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ann.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Status & Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold">Leave Request Status</h3>
            <button
              type="button"
              onClick={() => navigate('/employee/leaves')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Apply Leave
            </button>
          </div>
          <div className="space-y-2.5 mb-4">
            {myLeaves.slice(0, 3).map((lv) => (
              <div
                key={lv.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold">{lv.leaveType}</p>
                  <p className="text-[11px] text-slate-500">
                    {formatShortDate(lv.startDate)} • {lv.days}d
                  </p>
                </div>
                <StatusBadge status={lv.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
