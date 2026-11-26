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
import { CheckCircle2, CreditCard, Eye, Printer, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, Modal, PageHeader, StatCard, StatusBadge } from '../../components/UI';
import { formatCurrency } from '../../utils/formatters';

export default function PayrollManagement() {
  const { data, markPayslipPaid } = useApp();
  const months = useMemo(
    () => Array.from(new Set(data.payslips.map((p) => p.month))).sort().reverse(),
    [data.payslips]
  );
  const [selectedMonth, setSelectedMonth] = useState(months[0] || '2026-11');
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const monthPayslips = useMemo(
    () => data.payslips.filter((p) => p.month === selectedMonth),
    [data.payslips, selectedMonth]
  );

  const totalNet = useMemo(
    () => monthPayslips.reduce((s, p) => s + p.netSalary, 0),
    [monthPayslips]
  );

  const paidCount = monthPayslips.filter((p) => p.status === 'Paid').length;

  const deptSalaryChart = useMemo(() => {
    const map = {};
    monthPayslips.forEach((p) => {
      const emp = data.employees.find((e) => e.id === p.employeeId);
      if (!emp) return;
      map[emp.department] = (map[emp.department] || 0) + p.netSalary;
    });
    return Object.entries(map).map(([department, total]) => ({
      department: department.replace('Human Resources', 'HR'),
      total,
    }));
  }, [monthPayslips, data.employees]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Management"
        subtitle="Simulated monthly salary overview and employee payslips (no real payments processed)"
        breadcrumbs={['Owner', 'Payroll']}
        actions={
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                Cycle: {m}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Net Payroll"
          value={formatCurrency(totalNet)}
          subtitle={`Cycle ${selectedMonth}`}
          icon={Wallet}
          accent="indigo"
        />
        <StatCard
          title="Employees Covered"
          value={monthPayslips.length}
          subtitle="Active payroll runs"
          icon={CreditCard}
          accent="blue"
        />
        <StatCard
          title="Disbursement Status"
          value={`${paidCount}/${monthPayslips.length} Paid`}
          subtitle="Simulated ledger"
          icon={CheckCircle2}
          accent="emerald"
        />
      </div>

      {/* Salary Distribution Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
        <h3 className="text-base font-bold mb-1">Salary Distribution by Department</h3>
        <p className="text-xs text-slate-500 mb-4">Total net monthly compensation per team</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptSalaryChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip formatter={(val) => formatCurrency(val)} />
              <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Basic</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {monthPayslips.map((p) => {
                const emp = data.employees.find((e) => e.id === p.employeeId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={emp?.name || p.employeeId} color={emp?.avatarColor} size="sm" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {emp?.name || p.employeeId}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {p.employeeId} • {emp?.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{formatCurrency(p.basicSalary)}</td>
                    <td className="py-3 px-4 text-emerald-600">+{formatCurrency(p.allowances)}</td>
                    <td className="py-3 px-4 text-rose-600">-{formatCurrency(p.deductions)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(p.netSalary)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {p.status !== 'Paid' && (
                          <button
                            type="button"
                            onClick={() => markPayslipPaid(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedPayslip({ payslip: p, emp })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                          title="View payslip"
                        >
                          <Eye className="h-4 w-4" />
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

      {/* Payslip Modal */}
      <Modal
        open={Boolean(selectedPayslip)}
        onClose={() => setSelectedPayslip(null)}
        title="Employee Payslip"
        subtitle={`Simulated Payroll Statement • ${selectedPayslip?.payslip?.month || ''}`}
      >
        {selectedPayslip && (
          <div className="space-y-4 text-xs print-only-card">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div>
                <p className="text-sm font-bold">{selectedPayslip.emp?.name}</p>
                <p className="text-slate-500">
                  {selectedPayslip.payslip.employeeId} • {selectedPayslip.emp?.designation}
                </p>
              </div>
              <StatusBadge status={selectedPayslip.payslip.status} />
            </div>

            <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Basic Salary</span>
                <span className="font-semibold">
                  {formatCurrency(selectedPayslip.payslip.basicSalary)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allowances & Benefits</span>
                <span className="font-semibold text-emerald-600">
                  +{formatCurrency(selectedPayslip.payslip.allowances)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax & Statutory Deductions</span>
                <span className="font-semibold text-rose-600">
                  -{formatCurrency(selectedPayslip.payslip.deductions)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold">
                <span>Net Payable</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(selectedPayslip.payslip.netSalary)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Payslip
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
