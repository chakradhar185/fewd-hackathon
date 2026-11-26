import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AVATAR_COLORS, createInitialData } from '../data/mockData';
import {
  calculateHoursBetween,
  getCurrentTimeStr,
  getDaysInclusive,
  getLocalDateStr,
} from '../utils/formatters';

const DATA_KEY = 'worksphere_data_v1';
const AUTH_KEY = 'worksphere_auth_v1';
const REMEMBER_KEY = 'worksphere_remember_email';

const AppContext = createContext(null);

function loadStoredData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return createInitialData();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.employees)) return createInitialData();
    return parsed;
  } catch {
    return createInitialData();
  }
}

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [data, setData] = useState(loadStoredData);
  const [auth, setAuth] = useState(loadStoredAuth);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage quota errors in demo
    }
  }, [data]);

  useEffect(() => {
    try {
      if (auth) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    } catch {
      // Ignore
    }
  }, [auth]);

  useEffect(() => {
    const isDark = data.settings?.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
  }, [data.settings?.theme]);

  const showToast = (message, type = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentEmployee = useMemo(() => {
    if (!auth || auth.role !== 'employee') return null;
    return (
      data.employees.find((e) => e.id === auth.employeeId) ||
      data.employees.find((e) => e.email.toLowerCase() === 'rahul@worksphere.com') ||
      data.employees[0] ||
      null
    );
  }, [auth, data.employees]);

  const login = (email, password, rememberMe = true) => {
    const cleanEmail = email.trim().toLowerCase();
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, email.trim());
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }

    if (cleanEmail === 'admin@worksphere.com' && password === '123456') {
      const session = {
        role: 'owner',
        email: 'admin@worksphere.com',
        name: data.settings?.ownerName || 'Chakradhar M.',
      };
      setAuth(session);
      showToast('Signed in to WorkSphere Owner Portal');
      return { ok: true, role: 'owner' };
    }

    const matchedEmp = data.employees.find(
      (e) => e.email.toLowerCase() === cleanEmail
    );
    if (matchedEmp && password === '123456') {
      const session = {
        role: 'employee',
        email: matchedEmp.email,
        employeeId: matchedEmp.id,
        name: matchedEmp.name,
      };
      setAuth(session);
      showToast(`Welcome back, ${matchedEmp.name.split(' ')[0]}!`);
      return { ok: true, role: 'employee' };
    }

    return {
      ok: false,
      error: 'Invalid demo credentials. Use admin@worksphere.com or rahul@worksphere.com with password 123456.',
    };
  };

  const quickLogin = (role) => {
    if (role === 'owner') {
      setAuth({
        role: 'owner',
        email: 'admin@worksphere.com',
        name: data.settings?.ownerName || 'Chakradhar M.',
      });
      showToast('Logged in as Owner (Demo)');
      return 'owner';
    }
    const rahul =
      data.employees.find((e) => e.email.toLowerCase() === 'rahul@worksphere.com') ||
      data.employees[0];
    setAuth({
      role: 'employee',
      email: rahul.email,
      employeeId: rahul.id,
      name: rahul.name,
    });
    showToast(`Logged in as ${rahul.name} (Demo)`);
    return 'employee';
  };

  const switchRole = (targetRole) => {
    return quickLogin(targetRole);
  };

  const logout = () => {
    setAuth(null);
    showToast('Signed out of WorkSphere', 'info');
  };

  const toggleTheme = () => {
    setData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: prev.settings?.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  };

  const prependActivity = (activities, actor, action, type = 'general', employeeId = '') => [
    {
      id: `ACT-${Date.now()}`,
      actor,
      action,
      timestamp: 'Just now',
      type,
      employeeId,
    },
    ...(activities || []).slice(0, 24),
  ];

  // Employees CRUD
  const addEmployee = (empPayload) => {
    const nextNum = data.employees.length + 101;
    const id = empPayload.id?.trim() || `EMP-${nextNum}`;
    const duplicate = data.employees.some(
      (e) => e.id.toLowerCase() === id.toLowerCase() || e.email.toLowerCase() === empPayload.email.trim().toLowerCase()
    );
    if (duplicate) {
      showToast('An employee with that ID or email already exists.', 'error');
      return null;
    }

    const newEmp = {
      ...empPayload,
      id,
      salary: Number(empPayload.salary || 6000),
      experience: Number(empPayload.experience || 2),
      workload: Number(empPayload.workload ?? 35),
      performanceScore: Number(empPayload.performanceScore ?? 85),
      avatarColor:
        empPayload.avatarColor || AVATAR_COLORS[data.employees.length % AVATAR_COLORS.length],
      leaveBalance: empPayload.leaveBalance || {
        casual: data.settings?.casualLeaveQuota || 10,
        sick: data.settings?.sickLeaveQuota || 8,
        earned: data.settings?.earnedLeaveQuota || 16,
      },
      skills: empPayload.skills || {},
    };

    const currentMonth = getLocalDateStr(0).slice(0, 7);
    const basic = Math.round(newEmp.salary * 0.72);
    const allowances = Math.round(newEmp.salary * 0.28);
    const deductions = Math.round(newEmp.salary * 0.12);
    const newPayslip = {
      id: `PAY-${currentMonth}-${newEmp.id}`,
      employeeId: newEmp.id,
      month: currentMonth,
      basicSalary: basic,
      allowances,
      deductions,
      netSalary: basic + allowances - deductions,
      status: 'Processed',
      paidDate: getLocalDateStr(0),
    };

    setData((prev) => ({
      ...prev,
      employees: [newEmp, ...prev.employees],
      payslips: [newPayslip, ...prev.payslips],
      activities: prependActivity(
        prev.activities,
        'Owner',
        `added ${newEmp.name} (${newEmp.designation}) to ${newEmp.department}`,
        'employee',
        newEmp.id
      ),
    }));
    showToast(`${newEmp.name} added to directory`);
    return newEmp;
  };

  const updateEmployee = (id, updates) => {
    setData((prev) => ({
      ...prev,
      employees: prev.employees.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      activities: prependActivity(
        prev.activities,
        updates.updatedBy || 'Owner',
        `updated profile details for ${updates.name || id}`,
        'employee',
        id
      ),
    }));
    showToast('Profile updated successfully');
  };

  const deleteEmployee = (id) => {
    const target = data.employees.find((e) => e.id === id);
    setData((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      attendance: prev.attendance.filter((a) => a.employeeId !== id),
      leaveRequests: prev.leaveRequests.filter((l) => l.employeeId !== id),
      tasks: prev.tasks.filter((t) => t.assigneeId !== id),
      activities: prependActivity(
        prev.activities,
        'Owner',
        `removed ${target?.name || id} from the workforce directory`,
        'employee',
        id
      ),
    }));
    showToast(`${target?.name || 'Employee'} removed`, 'info');
  };

  // Departments
  const addDepartment = (dept) => {
    const newDept = {
      ...dept,
      id: `DEPT-${Date.now().toString().slice(-4)}`,
      budget: Number(dept.budget || 150000),
      status: dept.status || 'Active',
    };
    setData((prev) => ({
      ...prev,
      departments: [...prev.departments, newDept],
      activities: prependActivity(
        prev.activities,
        'Owner',
        `created the ${newDept.name} department`,
        'department'
      ),
    }));
    showToast(`${newDept.name} department created`);
  };

  const updateDepartment = (id, updates) => {
    setData((prev) => ({
      ...prev,
      departments: prev.departments.map((d) => (d.id === id ? { ...d, ...updates } : d)),
      activities: prependActivity(
        prev.activities,
        'Owner',
        `updated ${updates.name || 'department'} settings`,
        'department'
      ),
    }));
    showToast('Department updated');
  };

  // Attendance
  const checkIn = (employeeId) => {
    const today = getLocalDateStr(0);
    const existing = data.attendance.find(
      (a) => a.employeeId === employeeId && a.date === today
    );
    if (existing && existing.checkIn !== '--:--') {
      showToast('You have already checked in today.', 'error');
      return false;
    }
    const nowTime = getCurrentTimeStr();
    const startTime = data.settings?.workStartTime || '09:00';
    const grace = Number(data.settings?.lateGraceMinutes ?? 15);
    const [sh, sm] = startTime.split(':').map(Number);
    const [nh, nm] = nowTime.split(':').map(Number);
    const isLate = nh * 60 + nm > sh * 60 + sm + grace;
    const status = isLate ? 'Late' : 'Present';

    const emp = data.employees.find((e) => e.id === employeeId);
    const record = {
      id: existing?.id || `ATT-${today}-${employeeId}`,
      employeeId,
      date: today,
      checkIn: nowTime,
      checkOut: '--:--',
      hours: 0,
      status,
    };

    setData((prev) => ({
      ...prev,
      attendance: existing
        ? prev.attendance.map((a) => (a.id === existing.id ? record : a))
        : [record, ...prev.attendance],
      activities: prependActivity(
        prev.activities,
        emp?.name || employeeId,
        `checked in at ${nowTime} (${status})`,
        'attendance',
        employeeId
      ),
    }));
    showToast(`Checked in at ${nowTime} (${status})`);
    return true;
  };

  const checkOut = (employeeId) => {
    const today = getLocalDateStr(0);
    const existing = data.attendance.find(
      (a) => a.employeeId === employeeId && a.date === today
    );
    if (!existing || existing.checkIn === '--:--') {
      showToast('Please check in before checking out.', 'error');
      return false;
    }
    if (existing.checkOut !== '--:--') {
      showToast('You have already checked out today.', 'error');
      return false;
    }

    const nowTime = getCurrentTimeStr();
    const hours = Math.max(0.1, calculateHoursBetween(existing.checkIn, nowTime));
    const emp = data.employees.find((e) => e.id === employeeId);

    setData((prev) => ({
      ...prev,
      attendance: prev.attendance.map((a) =>
        a.id === existing.id ? { ...a, checkOut: nowTime, hours } : a
      ),
      activities: prependActivity(
        prev.activities,
        emp?.name || employeeId,
        `checked out at ${nowTime} (${hours} hrs logged)`,
        'attendance',
        employeeId
      ),
    }));
    showToast(`Checked out at ${nowTime} (${hours} hrs)`);
    return true;
  };

  // Leaves
  const submitLeaveRequest = ({ employeeId, leaveType, startDate, endDate, reason }) => {
    const days = getDaysInclusive(startDate, endDate);
    if (days <= 0) {
      showToast('End date must be on or after start date.', 'error');
      return null;
    }
    const emp = data.employees.find((e) => e.id === employeeId);
    const newReq = {
      id: `LV-${Date.now().toString().slice(-4)}`,
      employeeId,
      leaveType,
      startDate,
      endDate,
      days,
      reason: reason.trim(),
      status: 'Pending',
      appliedOn: getLocalDateStr(0),
    };
    setData((prev) => ({
      ...prev,
      leaveRequests: [newReq, ...prev.leaveRequests],
      activities: prependActivity(
        prev.activities,
        emp?.name || employeeId,
        `submitted a ${days}-day ${leaveType} request`,
        'leave',
        employeeId
      ),
    }));
    showToast('Leave request submitted for approval');
    return newReq;
  };

  const reviewLeaveRequest = (leaveId, decision) => {
    const req = data.leaveRequests.find((l) => l.id === leaveId);
    if (!req || req.status === decision) return;
    const emp = data.employees.find((e) => e.id === req.employeeId);
    const today = getLocalDateStr(0);

    setData((prev) => {
      const updatedLeaves = prev.leaveRequests.map((l) =>
        l.id === leaveId ? { ...l, status: decision } : l
      );

      let updatedEmployees = prev.employees;
      let updatedAttendance = prev.attendance;

      if (decision === 'Approved' && req.status !== 'Approved') {
        const key = req.leaveType.toLowerCase().includes('casual')
          ? 'casual'
          : req.leaveType.toLowerCase().includes('sick')
          ? 'sick'
          : 'earned';
        updatedEmployees = prev.employees.map((e) => {
          if (e.id !== req.employeeId) return e;
          const currentBal = e.leaveBalance?.[key] ?? 0;
          const isTodayCovered = req.startDate <= today && req.endDate >= today;
          return {
            ...e,
            status: isTodayCovered ? 'On Leave' : e.status,
            leaveBalance: {
              ...e.leaveBalance,
              [key]: Math.max(0, currentBal - req.days),
            },
          };
        });

        if (req.startDate <= today && req.endDate >= today) {
          const existsToday = prev.attendance.some(
            (a) => a.employeeId === req.employeeId && a.date === today
          );
          if (existsToday) {
            updatedAttendance = prev.attendance.map((a) =>
              a.employeeId === req.employeeId && a.date === today
                ? { ...a, status: 'On Leave', checkIn: '--:--', checkOut: '--:--', hours: 0 }
                : a
            );
          } else {
            updatedAttendance = [
              {
                id: `ATT-${today}-${req.employeeId}`,
                employeeId: req.employeeId,
                date: today,
                checkIn: '--:--',
                checkOut: '--:--',
                hours: 0,
                status: 'On Leave',
              },
              ...prev.attendance,
            ];
          }
        }
      }

      return {
        ...prev,
        leaveRequests: updatedLeaves,
        employees: updatedEmployees,
        attendance: updatedAttendance,
        activities: prependActivity(
          prev.activities,
          'Owner',
          `${decision.toLowerCase()} ${emp?.name || req.employeeId}'s ${req.leaveType} request`,
          'leave',
          req.employeeId
        ),
      };
    });

    showToast(
      `Leave request ${decision.toLowerCase()}`,
      decision === 'Approved' ? 'success' : 'info'
    );
  };

  // Projects & Tasks
  const createProject = (projectPayload) => {
    const newProject = {
      ...projectPayload,
      id: `PRJ-${Date.now().toString().slice(-4)}`,
      status: projectPayload.status || 'To Do',
      assignedEmployees: projectPayload.assignedEmployees || [],
    };
    setData((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
      activities: prependActivity(
        prev.activities,
        'Owner',
        `created project "${newProject.title}"`,
        'project'
      ),
    }));
    showToast(`Project "${newProject.title}" created`);
    return newProject;
  };

  const assignEmployeeToProject = ({
    projectId,
    projectTitle,
    projectDescription,
    requiredSkills,
    department,
    duration,
    employeeId,
  }) => {
    const emp = data.employees.find((e) => e.id === employeeId);
    setData((prev) => {
      let targetProject = prev.projects.find(
        (p) =>
          (projectId && p.id === projectId) ||
          (projectTitle && p.title.toLowerCase() === projectTitle.trim().toLowerCase())
      );

      let updatedProjects;
      if (targetProject) {
        const alreadyAssigned = targetProject.assignedEmployees.includes(employeeId);
        updatedProjects = prev.projects.map((p) =>
          p.id === targetProject.id
            ? {
                ...p,
                assignedEmployees: alreadyAssigned
                  ? p.assignedEmployees
                  : [...p.assignedEmployees, employeeId],
              }
            : p
        );
      } else {
        targetProject = {
          id: `PRJ-${Date.now().toString().slice(-4)}`,
          title: projectTitle || 'Matched Project Initiative',
          description: projectDescription || 'Created via Smart Employee–Project Matcher.',
          requiredSkills: requiredSkills || [],
          department: department && department !== 'All' ? department : 'Engineering',
          deadline: getLocalDateStr(30),
          priority: 'High',
          status: 'In Progress',
          assignedEmployees: [employeeId],
          duration: duration || '6 weeks',
        };
        updatedProjects = [targetProject, ...prev.projects];
      }

      const updatedEmployees = prev.employees.map((e) =>
        e.id === employeeId
          ? { ...e, workload: Math.min(100, (e.workload || 50) + 10) }
          : e
      );

      return {
        ...prev,
        projects: updatedProjects,
        employees: updatedEmployees,
        activities: prependActivity(
          prev.activities,
          'Owner',
          `assigned ${emp?.name || employeeId} to "${targetProject.title}" via Smart Matcher`,
          'project',
          employeeId
        ),
      };
    });
    showToast(`${emp?.name || 'Employee'} assigned to project`);
  };

  const createTask = (taskPayload) => {
    const emp = data.employees.find((e) => e.id === taskPayload.assigneeId);
    const newTask = {
      ...taskPayload,
      id: `TSK-${Date.now().toString().slice(-4)}`,
      status: taskPayload.status || 'To Do',
    };
    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      activities: prependActivity(
        prev.activities,
        'Owner',
        `assigned task "${newTask.title}" to ${emp?.name || 'team member'}`,
        'task',
        taskPayload.assigneeId
      ),
    }));
    showToast('Task assigned successfully');
    return newTask;
  };

  const updateTaskStatus = (taskId, status, actorName = 'Team Member') => {
    const target = data.tasks.find((t) => t.id === taskId);
    if (!target || target.status === status) return;
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
      activities: prependActivity(
        prev.activities,
        actorName,
        `moved "${target.title}" to ${status}`,
        'task',
        target.assigneeId
      ),
    }));
    showToast(`Task moved to ${status}`);
  };

  // Payroll
  const markPayslipPaid = (payslipId) => {
    setData((prev) => ({
      ...prev,
      payslips: prev.payslips.map((p) =>
        p.id === payslipId ? { ...p, status: 'Paid', paidDate: getLocalDateStr(0) } : p
      ),
    }));
    showToast('Payslip marked as Paid');
  };

  // Performance
  const upsertPerformanceReview = (reviewPayload) => {
    const emp = data.employees.find((e) => e.id === reviewPayload.employeeId);
    setData((prev) => {
      const existing = prev.performanceReviews.find(
        (r) => r.employeeId === reviewPayload.employeeId
      );
      const updatedReviews = existing
        ? prev.performanceReviews.map((r) =>
            r.employeeId === reviewPayload.employeeId ? { ...r, ...reviewPayload } : r
          )
        : [
            {
              id: `PERF-${Date.now().toString().slice(-4)}`,
              achievements: [],
              goals: [],
              ...reviewPayload,
            },
            ...prev.performanceReviews,
          ];

      const updatedEmployees = prev.employees.map((e) =>
        e.id === reviewPayload.employeeId
          ? { ...e, performanceScore: Number(reviewPayload.score ?? e.performanceScore) }
          : e
      );

      return {
        ...prev,
        performanceReviews: updatedReviews,
        employees: updatedEmployees,
        activities: prependActivity(
          prev.activities,
          'Owner',
          `updated performance review for ${emp?.name || reviewPayload.employeeId}`,
          'performance',
          reviewPayload.employeeId
        ),
      };
    });
    showToast('Performance review saved');
  };

  // Announcements
  const createAnnouncement = (annPayload) => {
    const newAnn = {
      ...annPayload,
      id: `ANN-${Date.now().toString().slice(-4)}`,
      publishDate: annPayload.publishDate || getLocalDateStr(0),
      readBy: [],
    };
    setData((prev) => ({
      ...prev,
      announcements: [newAnn, ...prev.announcements],
      activities: prependActivity(
        prev.activities,
        'Owner',
        `published announcement "${newAnn.title}"`,
        'announcement'
      ),
    }));
    showToast('Announcement published');
  };

  const deleteAnnouncement = (id) => {
    setData((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((a) => a.id !== id),
    }));
    showToast('Announcement deleted', 'info');
  };

  const markAnnouncementRead = (id, employeeId) => {
    if (!employeeId) return;
    setData((prev) => ({
      ...prev,
      announcements: prev.announcements.map((a) =>
        a.id === id && !(a.readBy || []).includes(employeeId)
          ? { ...a, readBy: [...(a.readBy || []), employeeId] }
          : a
      ),
    }));
  };

  // Settings & Reset
  const updateSettings = (updates) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
    showToast('Settings saved');
  };

  const resetDemoData = () => {
    const fresh = createInitialData();
    setData(fresh);
    localStorage.setItem(DATA_KEY, JSON.stringify(fresh));
    showToast('Demo data reset to initial state', 'info');
  };

  const value = {
    data,
    auth,
    currentEmployee,
    toasts,
    showToast,
    dismissToast,
    login,
    quickLogin,
    switchRole,
    logout,
    toggleTheme,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addDepartment,
    updateDepartment,
    checkIn,
    checkOut,
    submitLeaveRequest,
    reviewLeaveRequest,
    createProject,
    assignEmployeeToProject,
    createTask,
    updateTaskStatus,
    markPayslipPaid,
    upsertPerformanceReview,
    createAnnouncement,
    deleteAnnouncement,
    markAnnouncementRead,
    updateSettings,
    resetDemoData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
