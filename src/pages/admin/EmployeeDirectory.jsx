import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowUpDown,
  Download,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SKILL_OPTIONS } from '../../data/mockData';
import {
  Avatar,
  ConfirmDialog,
  EmptyState,
  Modal,
  PageHeader,
  StatusBadge,
} from '../../components/UI';
import { exportToCSV, formatCurrency, formatDate, getLocalDateStr } from '../../utils/formatters';

const EMPTY_FORM = {
  id: '',
  name: '',
  email: '',
  phone: '',
  department: 'Engineering',
  designation: '',
  joiningDate: getLocalDateStr(0),
  employmentType: 'Full-Time',
  status: 'Active',
  salary: 7000,
  manager: 'Priya Nair',
  experience: 3,
  avatarUrl: '',
  skills: { React: 75, JavaScript: 75, Communication: 80 },
};

export default function EmployeeDirectory() {
  const { data, addEmployee, updateEmployee, deleteEmployee, showToast } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      openAddModal();
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      id: `EMP-${data.employees.length + 101}`,
      joiningDate: getLocalDateStr(0),
    });
    setFormOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingId(emp.id);
    setForm({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      department: emp.department,
      designation: emp.designation,
      joiningDate: emp.joiningDate,
      employmentType: emp.employmentType || 'Full-Time',
      status: emp.status,
      salary: emp.salary,
      manager: emp.manager || '',
      experience: emp.experience || 2,
      avatarUrl: emp.avatarUrl || '',
      skills: { ...(emp.skills || {}) },
    });
    setFormOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.employees
      .filter((e) => {
        if (deptFilter !== 'All' && e.department !== deptFilter) return false;
        if (statusFilter !== 'All' && e.status !== statusFilter) return false;
        if (!q) return true;
        return (
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const mult = sortDir === 'asc' ? 1 : -1;
        if (sortBy === 'salary') return (a.salary - b.salary) * mult;
        return String(a[sortBy] || '').localeCompare(String(b[sortBy] || '')) * mult;
      });
  }, [data.employees, search, deptFilter, statusFilter, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const toggleSkill = (skillName) => {
    setForm((prev) => {
      const next = { ...prev.skills };
      if (next[skillName] !== undefined) {
        delete next[skillName];
      } else {
        next[skillName] = 75;
      }
      return { ...prev, skills: next };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.designation.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (editingId) {
      updateEmployee(editingId, {
        ...form,
        salary: Number(form.salary),
        experience: Number(form.experience),
      });
    } else {
      const created = addEmployee(form);
      if (!created) return;
    }
    setFormOpen(false);
  };

  const handleExport = () => {
    const rows = filtered.map((e) => ({
      EmployeeID: e.id,
      Name: e.name,
      Email: e.email,
      Phone: e.phone,
      Department: e.department,
      Designation: e.designation,
      JoiningDate: e.joiningDate,
      EmploymentType: e.employmentType,
      Status: e.status,
      MonthlySalaryUSD: e.salary,
      Manager: e.manager,
    }));
    exportToCSV('worksphere-employees.csv', rows);
    showToast(`Exported ${rows.length} employee records to CSV`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        subtitle={`${data.employees.length} total team members across ${data.departments.length} departments`}
        breadcrumbs={['Owner', 'Employees']}
        actions={
          <>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          </>
        }
      />

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-card flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, ID, email, or designation..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
        >
          <option value="All">All Departments</option>
          {data.departments.map((d) => (
            <option key={d.id} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Probation">Probation</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees match your filters"
          description="Try clearing your search query or department filter."
          action={
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setDeptFilter('All');
                setStatusFilter('All');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">ID</th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('name')}
                      className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-white"
                    >
                      Employee <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('department')}
                      className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-white"
                    >
                      Department <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('joiningDate')}
                      className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-white"
                    >
                      Joining Date <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('salary')}
                      className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-white"
                    >
                      Salary <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {paginated.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-500">{emp.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} color={emp.avatarColor} src={emp.avatarUrl} size="sm" />
                        <div>
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/employees/${emp.id}`)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left"
                          >
                            {emp.name}
                          </button>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {emp.department}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {emp.designation}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {formatDate(emp.joiningDate)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(emp.salary)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/employees/${emp.id}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                          title="View profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                          title="Edit employee"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                          title="Delete employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of{' '}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 font-medium">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? 'Edit Employee' : 'Add New Employee'}
        subtitle="Changes automatically sync across dashboards, payroll, and matcher"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Employee ID *</label>
              <input
                type="text"
                required
                disabled={Boolean(editingId)}
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Work Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (415) 000-0000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Department</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {data.departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Designation *</label>
              <input
                type="text"
                required
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g., Full Stack Engineer"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Joining Date</label>
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Employment Type</label>
              <select
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option>Full-Time</option>
                <option>Contract</option>
                <option>Intern</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Monthly Salary ($)</label>
              <input
                type="number"
                min={1000}
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Experience (Years)</label>
              <input
                type="number"
                step="0.5"
                min={0}
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Reporting Manager</label>
              <input
                type="text"
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option>Active</option>
                <option>On Leave</option>
                <option>Probation</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Profile Image URL (optional)</label>
            <input
              type="url"
              value={form.avatarUrl}
              onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
              placeholder="Leave blank for initials avatar"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          {/* Skills selector */}
          <div>
            <label className="block text-xs font-semibold mb-2">
              Skills & Proficiency (0–100)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SKILL_OPTIONS.map((sk) => {
                const selected = form.skills[sk] !== undefined;
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {sk}
                  </button>
                );
              })}
            </div>
            {Object.keys(form.skills).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                {Object.entries(form.skills).map(([sk, val]) => (
                  <div key={sk} className="flex items-center gap-2 text-xs">
                    <span className="w-28 truncate font-medium">{sk}</span>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={val}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          skills: { ...prev.skills, [sk]: Number(e.target.value) },
                        }))
                      }
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="w-8 text-right font-semibold">{val}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              {editingId ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteEmployee(deleteTarget.id)}
        title="Delete Employee"
        message={`Are you sure you want to remove ${deleteTarget?.name} (${deleteTarget?.id}) from WorkSphere? This will also clear their attendance and task assignments.`}
        confirmLabel="Remove Employee"
      />
    </div>
  );
}
