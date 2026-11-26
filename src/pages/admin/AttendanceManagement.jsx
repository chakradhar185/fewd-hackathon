import React, { useMemo, useState } from 'react';
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
  Clock,
  Search,
  UserCheck,
  UserMinus,
  UserX,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, PageHeader, StatCard, StatusBadge } from '../../components/UI';
import { formatShortDate, formatTime12h, getLocalDateStr } from '../../utils/formatters';

export default function AttendanceManagement() {
  const { data } = useApp();
  const [selectedDate, setSelectedDate] = useState(getLocalDateStr(0));
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.employees
      .filter((emp) => {
        if (deptFilter !== 'All' && emp.department !== deptFilter) return false;
        if (q && !emp.name.toLowerCase().includes(q) && !emp.id.toLowerCase().includes(q)) {
          return false;
        }
        return true;
      })
      .map((emp) => {
        const rec = data.attendance.find(
          (a) => a.employeeId === emp.id && a.date === selectedDate
        );
        return {
          employee: emp,
          checkIn: rec?.checkIn || '--:--',
          checkOut: rec?.checkOut || '--:--',
          hours: rec?.hours || 0,
          status: rec?.status || 'Not Checked In',
        };
      });
  }, [data.employees, data.attendance, selectedDate, search, deptFilter]);

  const summary = useMemo(() => {
    const present = rows.filter((r) => r.status === 'Present').length;
    const late = rows.filter((r) => r.status === 'Late').length;
    const onLeave = rows.filter((r) => r.status === 'On Leave').length;
    const absent = rows.filter((r) => r.status === 'Absent').length;
    const pct = rows.length ? Math.round(((present + late) / rows.length) * 100) : 0;
    return { present, late, onLeave, absent, pct };
  }, [rows]);

  const weeklyChart = useMemo(() => {
    const out = [];
    for (let i = -6; i <= 0; i++) {
      const d = getLocalDateStr(i);
      const recs = data.attendance.filter((a) => a.date === d);
      out.push({
        day: i === 0 ? 'Today' : formatShortDate(d),
        Present: recs.filter((r) => r.status === 'Present').length,
        Late: recs.filter((r) => r.status === 'Late').length,
        Absent: recs.filter((r) => r.status === 'Absent' || r.status === 'On Leave').length,
      });
    }
    return out;
  }, [data.attendance]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        subtitle="Real-time check-ins synced directly with the Employee Portal"
        breadcrumbs={['Owner', 'Attendance']}
        actions={
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          />
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Present" value={summary.present} subtitle="On time" icon={UserCheck} accent="emerald" />
        <StatCard title="Late" value={summary.late} subtitle="After grace period" icon={Clock} accent="amber" />
        <StatCard title="On Leave" value={summary.onLeave} subtitle="Approved leave" icon={UserMinus} accent="violet" />
        <StatCard title="Absent" value={summary.absent} subtitle="Unplanned away" icon={UserX} accent="rose" />
        <StatCard title="Attendance %" value={`${summary.pct}%`} subtitle="Present + Late" icon={CalendarCheck} accent="indigo" />
      </div>

      {/* Weekly Attendance Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold">7-Day Attendance Overview</h3>
            <p className="text-xs text-slate-500">Daily presence across all departments</p>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Absent" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="All">All Departments</option>
            {data.departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Working Hours</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {rows.map((r) => (
                <tr key={r.employee.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.employee.name} color={r.employee.avatarColor} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {r.employee.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{r.employee.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {r.employee.department}
                  </td>
                  <td className="py-3 px-4 font-medium">{formatTime12h(r.checkIn)}</td>
                  <td className="py-3 px-4 font-medium">{formatTime12h(r.checkOut)}</td>
                  <td className="py-3 px-4 font-semibold">
                    {r.hours > 0 ? `${r.hours} hrs` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
