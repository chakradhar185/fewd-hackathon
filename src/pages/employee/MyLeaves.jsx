import React, { useState } from 'react';
import { CalendarOff, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal, PageHeader, StatCard, StatusBadge } from '../../components/UI';
import { formatDate, getDaysInclusive, getLocalDateStr } from '../../utils/formatters';

export default function MyLeaves() {
  const { data, currentEmployee, submitLeaveRequest } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    leaveType: 'Casual Leave',
    startDate: getLocalDateStr(2),
    endDate: getLocalDateStr(3),
    reason: '',
  });

  if (!currentEmployee) return null;

  const myLeaves = data.leaveRequests.filter(
    (l) => l.employeeId === currentEmployee.id
  );
  const lb = currentEmployee.leaveBalance || { casual: 0, sick: 0, earned: 0 };
  const daysPreview = getDaysInclusive(form.startDate, form.endDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    const created = submitLeaveRequest({
      employeeId: currentEmployee.id,
      ...form,
    });
    if (!created) return;
    setForm({
      leaveType: 'Casual Leave',
      startDate: getLocalDateStr(2),
      endDate: getLocalDateStr(3),
      reason: '',
    });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leaves"
        subtitle="Check remaining balances and apply for time off — requests appear immediately in the Owner Portal"
        breadcrumbs={['Employee', 'My Leaves']}
        actions={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Apply for Leave
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Casual Leave" value={`${lb.casual} days`} subtitle="Available balance" icon={CalendarOff} accent="indigo" />
        <StatCard title="Sick Leave" value={`${lb.sick} days`} subtitle="Available balance" icon={CalendarOff} accent="emerald" />
        <StatCard title="Earned Leave" value={`${lb.earned} days`} subtitle="Available balance" icon={CalendarOff} accent="violet" />
      </div>

      {/* Request History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold">Leave Request History ({myLeaves.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Applied On</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {myLeaves.map((lv) => (
                <tr key={lv.id}>
                  <td className="py-3 px-4 font-semibold">{lv.leaveType}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {formatDate(lv.startDate)} – {formatDate(lv.endDate)}
                  </td>
                  <td className="py-3 px-4 font-bold">{lv.days}d</td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{lv.reason}</td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(lv.appliedOn)}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={lv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Apply for Leave">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Leave Type</label>
            <select
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="Casual Leave">Casual Leave ({lb.casual}d left)</option>
              <option value="Sick Leave">Sick Leave ({lb.sick}d left)</option>
              <option value="Earned Leave">Earned Leave ({lb.earned}d left)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Start Date</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">End Date</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 text-xs font-medium text-indigo-700 dark:text-indigo-300">
            Total Requested Duration: <strong>{daysPreview} day(s)</strong>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Reason *</label>
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Briefly explain your leave request..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
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
              Submit Request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
