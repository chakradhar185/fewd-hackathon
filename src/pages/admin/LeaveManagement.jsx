import React, { useMemo, useState } from 'react';
import { Calendar, Check, Eye, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, Modal, PageHeader, StatCard, StatusBadge } from '../../components/UI';
import { formatDate } from '../../utils/formatters';

export default function LeaveManagement() {
  const { data, reviewLeaveRequest } = useApp();
  const [filter, setFilter] = useState('All');
  const [selectedLeave, setSelectedLeave] = useState(null);

  const counts = useMemo(() => {
    const pending = data.leaveRequests.filter((l) => l.status === 'Pending').length;
    const approved = data.leaveRequests.filter((l) => l.status === 'Approved').length;
    const rejected = data.leaveRequests.filter((l) => l.status === 'Rejected').length;
    return { pending, approved, rejected };
  }, [data.leaveRequests]);

  const filtered = useMemo(() => {
    if (filter === 'All') return data.leaveRequests;
    return data.leaveRequests.filter((l) => l.status === filter);
  }, [data.leaveRequests, filter]);

  const approvedUpcoming = useMemo(() => {
    return data.leaveRequests
      .filter((l) => l.status === 'Approved')
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [data.leaveRequests]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        subtitle="Approvals sync immediately to the Employee Portal and leave balances"
        breadcrumbs={['Owner', 'Leaves']}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pending Requests" value={counts.pending} subtitle="Awaiting action" accent="amber" />
        <StatCard title="Approved Leaves" value={counts.approved} subtitle="Confirmed time off" accent="emerald" />
        <StatCard title="Rejected Requests" value={counts.rejected} subtitle="Declined requests" accent="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Leave Requests Table */}
        <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    filter === tab
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filtered.map((lv) => {
                  const emp = data.employees.find((e) => e.id === lv.employeeId);
                  return (
                    <tr key={lv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={emp?.name || lv.employeeId} color={emp?.avatarColor} size="sm" />
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {emp?.name || lv.employeeId}
                            </p>
                            <p className="text-[11px] text-slate-400">{emp?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{lv.leaveType}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(lv.startDate)} – {formatDate(lv.endDate)}
                      </td>
                      <td className="py-3 px-4 font-semibold">{lv.days}d</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={lv.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {lv.status === 'Pending' && (
                            <>
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
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedLeave({ lv, emp })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Calendar Overview */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
          <h3 className="text-base font-bold flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-indigo-600" />
            Approved Leave Calendar
          </h3>
          <p className="text-xs text-slate-500 mb-4">Scheduled absences across teams</p>
          <div className="space-y-3">
            {approvedUpcoming.length === 0 ? (
              <p className="text-xs text-slate-500">No approved leaves scheduled.</p>
            ) : (
              approvedUpcoming.map((lv) => {
                const emp = data.employees.find((e) => e.id === lv.employeeId);
                return (
                  <div
                    key={lv.id}
                    className="p-3 rounded-xl bg-violet-50/60 dark:bg-violet-950/30 border border-violet-200/60 dark:border-violet-800/40 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {emp?.name || lv.employeeId}
                      </span>
                      <span className="font-semibold text-violet-700 dark:text-violet-300">
                        {lv.days}d
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1">
                      {formatDate(lv.startDate)} → {formatDate(lv.endDate)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{lv.leaveType}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Leave Detail Modal */}
      <Modal
        open={Boolean(selectedLeave)}
        onClose={() => setSelectedLeave(null)}
        title="Leave Request Details"
      >
        {selectedLeave && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <Avatar
                name={selectedLeave.emp?.name || selectedLeave.lv.employeeId}
                color={selectedLeave.emp?.avatarColor}
              />
              <div>
                <p className="text-sm font-bold">{selectedLeave.emp?.name}</p>
                <p className="text-slate-500">
                  {selectedLeave.emp?.designation} • {selectedLeave.emp?.department}
                </p>
              </div>
              <div className="ml-auto">
                <StatusBadge status={selectedLeave.lv.status} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>
                <p className="text-slate-400">Leave Type</p>
                <p className="font-semibold mt-0.5">{selectedLeave.lv.leaveType}</p>
              </div>
              <div>
                <p className="text-slate-400">Duration</p>
                <p className="font-semibold mt-0.5">{selectedLeave.lv.days} day(s)</p>
              </div>
              <div>
                <p className="text-slate-400">Start Date</p>
                <p className="font-semibold mt-0.5">{formatDate(selectedLeave.lv.startDate)}</p>
              </div>
              <div>
                <p className="text-slate-400">End Date</p>
                <p className="font-semibold mt-0.5">{formatDate(selectedLeave.lv.endDate)}</p>
              </div>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Reason</p>
              <p className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                {selectedLeave.lv.reason}
              </p>
            </div>
            {selectedLeave.lv.status === 'Pending' && (
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    reviewLeaveRequest(selectedLeave.lv.id, 'Rejected');
                    setSelectedLeave(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reviewLeaveRequest(selectedLeave.lv.id, 'Approved');
                    setSelectedLeave(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
