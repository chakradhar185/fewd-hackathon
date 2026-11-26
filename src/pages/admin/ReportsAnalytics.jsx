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
import { Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/UI';
import { exportToCSV, formatCurrency, getLocalDateStr } from '../../utils/formatters';

const REPORT_TYPES = [
  { id: 'attendance', label: 'Attendance Report' },
  { id: 'headcount', label: 'Headcount Report' },
  { id: 'department', label: 'Department Report' },
  { id: 'leave', label: 'Leave Report' },
  { id: 'payroll', label: 'Payroll Report' },
  { id: 'performance', label: 'Performance Report' },
];

export default function ReportsAnalytics() {
  const { data, showToast } = useApp();
  const [reportType, setReportType] = useState('attendance');
  const [fromDate, setFromDate] = useState(getLocalDateStr(-14));
  const [toDate, setToDate] = useState(getLocalDateStr(0));

  const reportData = useMemo(() => {
    if (reportType === 'attendance') {
      const filtered = data.attendance.filter(
        (a) => a.date >= fromDate && a.date <= toDate
      );
      const map = {};
      filtered.forEach((a) => {
        map[a.status] = (map[a.status] || 0) + 1;
      });
      const chart = Object.entries(map).map(([name, value]) => ({ name, value }));
      const rows = filtered.slice(0, 40).map((a) => {
        const emp = data.employees.find((e) => e.id === a.employeeId);
        return {
          Date: a.date,
          Employee: emp?.name || a.employeeId,
          Department: emp?.department || '—',
          Status: a.status,
          Hours: a.hours,
        };
      });
      return { chart, rows, metricLabel: 'Records' };
    }

    if (reportType === 'headcount' || reportType === 'department') {
      const rows = data.departments.map((d) => {
        const members = data.employees.filter((e) => e.department === d.name);
        const payroll = members.reduce((s, e) => s + Number(e.salary || 0), 0);
        return {
          Department: d.name,
          Manager: d.manager,
          Headcount: members.length,
          Budget: formatCurrency(d.budget),
          MonthlyPayroll: formatCurrency(payroll),
        };
      });
      const chart = rows.map((r) => ({
        name: r.Department.replace('Human Resources', 'HR'),
        value: r.Headcount,
      }));
      return { chart, rows, metricLabel: 'Employees' };
    }

    if (reportType === 'leave') {
      const byType = {};
      data.leaveRequests.forEach((l) => {
        byType[l.leaveType] = (byType[l.leaveType] || 0) + l.days;
      });
      const chart = Object.entries(byType).map(([name, value]) => ({ name, value }));
      const rows = data.leaveRequests.map((l) => {
        const emp = data.employees.find((e) => e.id === l.employeeId);
        return {
          Employee: emp?.name || l.employeeId,
          Type: l.leaveType,
          Start: l.startDate,
          End: l.endDate,
          Days: l.days,
          Status: l.status,
        };
      });
      return { chart, rows, metricLabel: 'Days' };
    }

    if (reportType === 'payroll') {
      const latestMonth = data.payslips[0]?.month || '2026-11';
      const current = data.payslips.filter((p) => p.month === latestMonth);
      const deptMap = {};
      current.forEach((p) => {
        const emp = data.employees.find((e) => e.id === p.employeeId);
        if (!emp) return;
        deptMap[emp.department] = (deptMap[emp.department] || 0) + p.netSalary;
      });
      const chart = Object.entries(deptMap).map(([name, value]) => ({
        name: name.replace('Human Resources', 'HR'),
        value,
      }));
      const rows = current.map((p) => {
        const emp = data.employees.find((e) => e.id === p.employeeId);
        return {
          Employee: emp?.name || p.employeeId,
          Department: emp?.department || '—',
          Month: p.month,
          NetSalary: formatCurrency(p.netSalary),
          Status: p.status,
        };
      });
      return { chart, rows, metricLabel: 'Net Pay ($)' };
    }

    // Performance
    const chart = data.departments.map((d) => {
      const members = data.employees.filter((e) => e.department === d.name);
      const avg = members.length
        ? Math.round(members.reduce((s, e) => s + (e.performanceScore || 85), 0) / members.length)
        : 0;
      return { name: d.name.replace('Human Resources', 'HR'), value: avg };
    });
    const rows = data.employees.map((e) => ({
      Employee: e.name,
      Department: e.department,
      Designation: e.designation,
      Score: `${e.performanceScore}/100`,
      Experience: `${e.experience} yrs`,
    }));
    return { chart, rows, metricLabel: 'Avg Score' };
  }, [reportType, data, fromDate, toDate]);

  const handleExport = () => {
    if (!reportData.rows.length) {
      showToast('No rows available to export.', 'error');
      return;
    }
    exportToCSV(`worksphere-${reportType}-report.csv`, reportData.rows);
    showToast(`Exported ${reportType} report to CSV`);
  };

  const columns = reportData.rows.length ? Object.keys(reportData.rows[0]) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Generate workforce insights across attendance, leaves, payroll, and performance"
        breadcrumbs={['Owner', 'Reports']}
        actions={
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        }
      />

      {/* Report Tabs + Date Range */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt.id}
              type="button"
              onClick={() => setReportType(rt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                reportType === rt.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card">
        <h3 className="text-base font-bold mb-1">
          {REPORT_TYPES.find((r) => r.id === reportType)?.label} Visualization
        </h3>
        <p className="text-xs text-slate-500 mb-4">{reportData.metricLabel}</p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData.chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {columns.map((col) => (
                  <th key={col} className="py-3 px-4">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {reportData.rows.slice(0, 18).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  {columns.map((col) => (
                    <td key={col} className="py-3 px-4 font-medium">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
