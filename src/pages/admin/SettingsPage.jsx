import React, { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog, PageHeader } from '../../components/UI';

export default function SettingsPage() {
  const { data, updateSettings, resetDemoData } = useApp();
  const [form, setForm] = useState({ ...data.settings });
  const [resetOpen, setResetOpen] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(form);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Workspace Settings"
        subtitle="Configure organization defaults, working hours, leave policies, and demo persistence"
        breadcrumbs={['Owner', 'Settings']}
        actions={
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Demo Data
          </button>
        }
      />

      <form onSubmit={handleSave} className="space-y-5">
        {/* Company & Owner Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold">Company & Owner Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">HR Contact Email</label>
              <input
                type="email"
                value={form.companyEmail}
                onChange={(e) => setForm({ ...form, companyEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Owner Display Name</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Appearance Theme</label>
              <select
                value={form.theme}
                onChange={(e) => setForm({ ...form, theme: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              >
                <option value="light">Light Theme (Default)</option>
                <option value="dark">Dark Theme</option>
              </select>
            </div>
          </div>
        </div>

        {/* Working Hours & Leave Policy */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-4">
          <h3 className="text-sm font-bold">Working Hours & Leave Policies</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Work Start Time</label>
              <input
                type="time"
                value={form.workStartTime}
                onChange={(e) => setForm({ ...form, workStartTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Work End Time</label>
              <input
                type="time"
                value={form.workEndTime}
                onChange={(e) => setForm({ ...form, workEndTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Late Grace (minutes)</label>
              <input
                type="number"
                min={0}
                max={60}
                value={form.lateGraceMinutes}
                onChange={(e) => setForm({ ...form, lateGraceMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Annual Casual Leave Quota</label>
              <input
                type="number"
                value={form.casualLeaveQuota}
                onChange={(e) => setForm({ ...form, casualLeaveQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Annual Sick Leave Quota</label>
              <input
                type="number"
                value={form.sickLeaveQuota}
                onChange={(e) => setForm({ ...form, sickLeaveQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Annual Earned Leave Quota</label>
              <input
                type="number"
                value={form.earnedLeaveQuota}
                onChange={(e) => setForm({ ...form, earnedLeaveQuota: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-3">
          <h3 className="text-sm font-bold">Notification Preferences</h3>
          {[
            { key: 'notifyLeaveRequests', label: 'Alert when employees submit new leave requests' },
            { key: 'notifyAnnouncements', label: 'Send confirmation toast for published announcements' },
            { key: 'notifyAttendanceAlerts', label: 'Highlight late check-ins and missing logs' },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-2.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form[item.key])}
                onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            <Save className="h-4 w-4" />
            Save All Settings
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemoData();
        }}
        title="Reset Demo Data"
        message="This will clear all LocalStorage changes (added employees, check-ins, leave updates, project assignments) and restore the original WorkSphere demo seed."
        confirmLabel="Reset Data"
      />
    </div>
  );
}
