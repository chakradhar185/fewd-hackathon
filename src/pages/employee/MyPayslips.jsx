import React, { useState } from 'react';
import { CreditCard, Eye, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal, PageHeader, StatusBadge } from '../../components/UI';
import { formatCurrency } from '../../utils/formatters';

export default function MyPayslips() {
  const { data, currentEmployee } = useApp();
  const [selected, setSelected] = useState(null);

  if (!currentEmployee) return null;

  const myPayslips = data.payslips
    .filter((p) => p.employeeId === currentEmployee.id)
    .sort((a, b) => b.month.localeCompare(a.month));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Payslips"
        subtitle="Simulated monthly compensation statements and browser print support"
        breadcrumbs={['Employee', 'My Payslips']}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {myPayslips.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{p.month}</h3>
                  <p className="text-[11px] text-slate-400">Monthly Payslip</p>
                </div>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Basic + Allowances</span>
                <span>{formatCurrency(p.basicSalary + p.allowances)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deductions</span>
                <span className="text-rose-600">-{formatCurrency(p.deductions)}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
                <span>Net Pay</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(p.netSalary)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelected(p)}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Eye className="h-3.5 w-3.5" />
                View Details
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelected(p);
                  setTimeout(() => window.print(), 200);
                }}
                className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={`Payslip Breakdown — ${selected?.month || ''}`}
        subtitle={`${currentEmployee.name} (${currentEmployee.id})`}
      >
        {selected && (
          <div className="space-y-4 text-xs print-only-card">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm">{currentEmployee.name}</p>
                <p className="text-slate-500">
                  {currentEmployee.designation} • {currentEmployee.department}
                </p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Basic Salary</span>
                <span className="font-semibold">{formatCurrency(selected.basicSalary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allowances</span>
                <span className="font-semibold text-emerald-600">
                  +{formatCurrency(selected.allowances)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax & Deductions</span>
                <span className="font-semibold text-rose-600">
                  -{formatCurrency(selected.deductions)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
                <span>Net Salary</span>
                <span className="text-indigo-600">{formatCurrency(selected.netSalary)}</span>
              </div>
            </div>

            <div className="flex justify-end no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                Download / Print PDF
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
