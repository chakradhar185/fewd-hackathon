import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Edit3, Plus, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Avatar, Modal, PageHeader, StatusBadge } from '../../components/UI';
import { formatCurrency } from '../../utils/formatters';

export default function Departments() {
  const { data, addDepartment, updateDepartment } = useApp();
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    manager: '',
    budget: 250000,
    status: 'Active',
    description: '',
  });
  const [viewDept, setViewDept] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '',
      manager: data.employees[0]?.name || '',
      budget: 200000,
      status: 'Active',
      description: '',
    });
    setFormOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      manager: dept.manager,
      budget: dept.budget,
      status: dept.status,
      description: dept.description || '',
    });
    setFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editing) {
      updateDepartment(editing.id, { ...form, budget: Number(form.budget) });
    } else {
      addDepartment(form);
    }
    setFormOpen(false);
  };

  const deptMembers = viewDept
    ? data.employees.filter((e) => e.department === viewDept.name)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Manage organizational units, budgets, and reporting heads"
        breadcrumbs={['Owner', 'Departments']}
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {data.departments.map((dept) => {
          const members = data.employees.filter((e) => e.department === dept.name);
          const monthlySpend = members.reduce((s, e) => s + Number(e.salary || 0), 0);

          return (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-500">Lead: {dept.manager || 'Unassigned'}</p>
                    </div>
                  </div>
                  <StatusBadge status={dept.status} />
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[34px]">
                  {dept.description || 'Core operational unit driving organizational goals.'}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <p className="text-[11px] text-slate-400">Headcount</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {members.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Annual Budget</p>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(dept.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Monthly Pay</p>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {formatCurrency(monthlySpend)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setViewDept(dept)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Users className="h-3.5 w-3.5" />
                  View Employees ({members.length})
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(dept)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit / Manager
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'Create Department'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Department Manager</label>
              <select
                value={form.manager}
                onChange={(e) => setForm({ ...form, manager: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                {data.employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Annual Budget ($)</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
              Save Department
            </button>
          </div>
        </form>
      </Modal>

      {/* View Department Employees Modal */}
      <Modal
        open={Boolean(viewDept)}
        onClose={() => setViewDept(null)}
        title={`${viewDept?.name || ''} Team`}
        subtitle={`${deptMembers.length} team member(s) • Manager: ${viewDept?.manager || '—'}`}
      >
        {deptMembers.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No employees currently assigned to this department.</p>
        ) : (
          <div className="space-y-2.5">
            {deptMembers.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setViewDept(null);
                  navigate(`/admin/employees/${m.id}`);
                }}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-indigo-50/60 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} color={m.avatarColor} size="sm" />
                  <div>
                    <p className="text-xs font-bold">{m.name}</p>
                    <p className="text-[11px] text-slate-500">{m.designation}</p>
                  </div>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
