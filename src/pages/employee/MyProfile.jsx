import React, { useState } from 'react';
import { Lock, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AVATAR_COLORS } from '../../data/mockData';
import { Avatar, PageHeader, StatusBadge } from '../../components/UI';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function MyProfile() {
  const { currentEmployee, updateEmployee } = useApp();
  const [phone, setPhone] = useState(currentEmployee?.phone || '');
  const [address, setAddress] = useState(currentEmployee?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(currentEmployee?.avatarUrl || '');
  const [avatarColor, setAvatarColor] = useState(currentEmployee?.avatarColor || 'bg-blue-600');

  if (!currentEmployee) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateEmployee(currentEmployee.id, {
      phone: phone.trim(),
      address: address.trim(),
      avatarUrl: avatarUrl.trim(),
      avatarColor,
      name: currentEmployee.name,
      updatedBy: currentEmployee.name,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="My Profile"
        subtitle="Update your personal contact details; core employment fields are managed by HR"
        breadcrumbs={['Employee', 'My Profile']}
      />

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card flex flex-col sm:flex-row items-center gap-5">
        <Avatar
          name={currentEmployee.name}
          color={avatarColor}
          src={avatarUrl}
          size="xl"
        />
        <div className="text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold">{currentEmployee.name}</h2>
            <StatusBadge status={currentEmployee.status} />
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {currentEmployee.designation} • {currentEmployee.department}
          </p>
          <p className="text-xs text-slate-400 mt-1">{currentEmployee.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editable Personal Information */}
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-4"
        >
          <h3 className="text-sm font-bold">Editable Contact & Avatar</h3>
          <div>
            <label className="block text-xs font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Profile Picture URL (optional)</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2">Avatar Badge Color</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`h-7 w-7 rounded-full ${c} ${
                    avatarColor === c ? 'ring-2 ring-offset-2 ring-indigo-600' : ''
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Personal Details
          </button>
        </form>

        {/* Read-only Employment Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Employment Information</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Lock className="h-3 w-3" /> Read-only
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              ['Employee ID', currentEmployee.id],
              ['Work Email', currentEmployee.email],
              ['Department', currentEmployee.department],
              ['Designation', currentEmployee.designation],
              ['Employment Type', currentEmployee.employmentType],
              ['Joining Date', formatDate(currentEmployee.joiningDate)],
              ['Reporting Manager', currentEmployee.manager],
              ['Monthly Base Compensation', formatCurrency(currentEmployee.salary)],
            ].map(([label, val]) => (
              <div
                key={label}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60"
              >
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
