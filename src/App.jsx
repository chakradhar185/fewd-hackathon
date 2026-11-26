import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/UI';
import Layout from './components/Layout';
import Login from './pages/Login';

// Owner/Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeeDirectory from './pages/admin/EmployeeDirectory';
import EmployeeProfile from './pages/admin/EmployeeProfile';
import Departments from './pages/admin/Departments';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import LeaveManagement from './pages/admin/LeaveManagement';
import PayrollManagement from './pages/admin/PayrollManagement';
import PerformanceManagement from './pages/admin/PerformanceManagement';
import TasksProjects from './pages/admin/TasksProjects';
import ProjectMatcher from './pages/admin/ProjectMatcher';
import AnnouncementsAdmin from './pages/admin/AnnouncementsAdmin';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import SettingsPage from './pages/admin/SettingsPage';

// Employee/User Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';
import MyAttendance from './pages/employee/MyAttendance';
import MyLeaves from './pages/employee/MyLeaves';
import MyPayslips from './pages/employee/MyPayslips';
import MyTasks from './pages/employee/MyTasks';
import MyPerformance from './pages/employee/MyPerformance';
import EmployeeAnnouncements from './pages/employee/EmployeeAnnouncements';

function RoleGuard({ requiredRole, children }) {
  const { auth } = useApp();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== requiredRole) {
    return (
      <Navigate
        to={auth.role === 'owner' ? '/admin/dashboard' : '/employee/dashboard'}
        replace
      />
    );
  }
  return children;
}

function HomeRedirect() {
  const { auth } = useApp();
  if (!auth) return <Navigate to="/login" replace />;
  return (
    <Navigate
      to={auth.role === 'owner' ? '/admin/dashboard' : '/employee/dashboard'}
      replace
    />
  );
}

function AppRoutes() {
  const { toasts, dismissToast } = useApp();

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeRedirect />} />

        {/* Owner / Admin Portal */}
        <Route
          path="/admin"
          element={
            <RoleGuard requiredRole="owner">
              <Layout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="matcher" element={<ProjectMatcher />} />
          <Route path="employees" element={<EmployeeDirectory />} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="departments" element={<Departments />} />
          <Route path="attendance" element={<AttendanceManagement />} />
          <Route path="leaves" element={<LeaveManagement />} />
          <Route path="payroll" element={<PayrollManagement />} />
          <Route path="performance" element={<PerformanceManagement />} />
          <Route path="projects" element={<TasksProjects />} />
          <Route path="announcements" element={<AnnouncementsAdmin />} />
          <Route path="reports" element={<ReportsAnalytics />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Employee / User Portal */}
        <Route
          path="/employee"
          element={
            <RoleGuard requiredRole="employee">
              <Layout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="leaves" element={<MyLeaves />} />
          <Route path="payslips" element={<MyPayslips />} />
          <Route path="tasks" element={<MyTasks />} />
          <Route path="performance" element={<MyPerformance />} />
          <Route path="announcements" element={<EmployeeAnnouncements />} />
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
