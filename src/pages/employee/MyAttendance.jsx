import React, { useMemo } from 'react';
import { Calendar, CheckCircle2, Clock, LogIn, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader, StatCard, StatusBadge } from '../../components/UI';
import { formatDate, formatTime12h, getLocalDateStr } from '../../utils/formatters';

export default function MyAttendance() {
  const { data, currentEmployee, checkIn, checkOut } = useApp();
  const today = getLocalDateStr(0);

  const myRecords = useMemo(
    () =>
      currentEmployee
        ? data.attendance
            .filter((a) => a.employeeId === currentEmployee.id)
            .sort((a, b) => b.date.localeCompare(a.date))
        : [],
    [data.attendance, currentEmployee]
  );

  // Build simple current month calendar grid
  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ empty: true, key: `e-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const rec = myRecords.find((r) => r.date === dateStr);
      cells.push({
        empty: false,
        key: dateStr,
        day: d,
        dateStr,
        status: rec?.status || null,
        isToday: dateStr === today,
      });
    }
    return cells;
  }, [myRecords, today]);

  if (!currentEmployee) return null;

  const todayRec = myRecords.find((a) => a.date === today);
  const hasCheckedIn = Boolean(todayRec && todayRec.checkIn !== '--:--');
  const hasCheckedOut = Boolean(todayRec && todayRec.checkOut !== '--:--');

  const presentCount = myRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
  const lateCount = myRecords.filter((r) => r.status === 'Late').length;
  const totalHours = myRecords.reduce((s, r) => s + Number(r.hours || 0), 0).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Attendance"
        subtitle="Check in/out daily — updates synchronize immediately with the Owner Attendance board"
        breadcrumbs={['Employee', 'My Attendance']}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={hasCheckedIn}
              onClick={() => checkIn(currentEmployee.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              {hasCheckedIn ? `Checked In (${formatTime12h(todayRec.checkIn)})` : 'Check In'}
            </button>
            <button
              type="button"
              disabled={!hasCheckedIn || hasCheckedOut}
              onClick={() => checkOut(currentEmployee.id)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              {hasCheckedOut ? `Checked Out (${formatTime12h(todayRec.checkOut)})` : 'Check Out'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Today's Status"
          value={todayRec?.status || 'Not Checked In'}
          subtitle={todayRec?.hours ? `${todayRec.hours} hrs logged` : 'Shift active'}
          icon={CheckCircle2}
          accent={hasCheckedIn ? 'emerald' : 'amber'}
        />
        <StatCard
          title="Days Logged"
          value={presentCount}
          subtitle={`${lateCount} late arrival(s)`}
          icon={Calendar}
          accent="indigo"
        />
        <StatCard
          title="Total Logged Hours"
          value={`${totalHours} hrs`}
          subtitle="Recent attendance window"
          icon={Clock}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Calendar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <h3 className="text-base font-bold mb-1">Monthly Attendance Calendar</h3>
          <p className="text-xs text-slate-500 mb-4">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold text-slate-400 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell) => {
              if (cell.empty) return <div key={cell.key} />;
              const badgeColor =
                cell.status === 'Present'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : cell.status === 'Late'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : cell.status === 'On Leave'
                  ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300'
                  : cell.status === 'Absent'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300';

              return (
                <div
                  key={cell.key}
                  title={cell.status || 'No log'}
                  className={`h-10 rounded-xl flex flex-col items-center justify-center text-xs font-semibold ${badgeColor} ${
                    cell.isToday ? 'ring-2 ring-indigo-600' : ''
                  }`}
                >
                  <span>{cell.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <h3 className="text-base font-bold mb-4">Attendance History</h3>
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto">
            {myRecords.map((r) => (
              <div
                key={r.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold">{formatDate(r.date)}</p>
                  <p className="text-[11px] text-slate-500">
                    In: {formatTime12h(r.checkIn)} • Out: {formatTime12h(r.checkOut)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{r.hours ? `${r.hours}h` : '—'}</span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
