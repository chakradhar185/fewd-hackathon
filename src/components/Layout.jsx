import React, { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Award,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from './UI';
import Chatbot from './Chatbot';

const OWNER_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  {
    label: 'Project Matcher',
    path: '/admin/matcher',
    icon: Sparkles,
    featured: true,
    badge: 'Smart',
  },
  { label: 'Employees', path: '/admin/employees', icon: Users },
  { label: 'Departments', path: '/admin/departments', icon: Building2 },
  { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
  { label: 'Leaves', path: '/admin/leaves', icon: CalendarOff },
  { label: 'Payroll', path: '/admin/payroll', icon: CreditCard },
  { label: 'Performance', path: '/admin/performance', icon: Award },
  { label: 'Tasks & Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

const EMPLOYEE_NAV = [
  { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', path: '/employee/profile', icon: UserCheck },
  { label: 'My Attendance', path: '/employee/attendance', icon: CalendarCheck },
  { label: 'My Leaves', path: '/employee/leaves', icon: CalendarOff },
  { label: 'My Payslips', path: '/employee/payslips', icon: CreditCard },
  { label: 'My Tasks', path: '/employee/tasks', icon: FolderKanban },
  { label: 'My Performance', path: '/employee/performance', icon: Award },
  { label: 'Announcements', path: '/employee/announcements', icon: Megaphone },
];

export default function Layout() {
  const { auth, data, currentEmployee, logout, switchRole, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isOwner = auth?.role === 'owner';
  const navItems = isOwner ? OWNER_NAV : EMPLOYEE_NAV;
  const isDark = data.settings?.theme === 'dark';

  const currentNav = navItems.find((item) => location.pathname.startsWith(item.path));
  const pageTitle = currentNav?.label || (location.pathname.includes('/admin/employees/') ? 'Employee Profile' : 'WorkSphere');

  const pendingLeavesCount = data.leaveRequests.filter((l) => l.status === 'Pending').length;
  const unreadAnnouncements = isOwner
    ? 0
    : data.announcements.filter((a) => !(a.readBy || []).includes(currentEmployee?.id)).length;
  const notifCount = isOwner ? pendingLeavesCount + data.announcements.length : unreadAnnouncements + 1;

  const quickSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    if (isOwner) {
      const empMatches = data.employees
        .filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q) ||
            e.designation.toLowerCase().includes(q)
        )
        .slice(0, 4)
        .map((e) => ({
          label: e.name,
          sub: `${e.designation} • ${e.department}`,
          path: `/admin/employees/${e.id}`,
        }));
      const navMatches = navItems
        .filter((n) => n.label.toLowerCase().includes(q))
        .slice(0, 3)
        .map((n) => ({ label: n.label, sub: 'Page', path: n.path }));
      return [...navMatches, ...empMatches];
    }
    const taskMatches = data.tasks
      .filter(
        (t) =>
          t.assigneeId === currentEmployee?.id &&
          t.title.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .map((t) => ({ label: t.title, sub: `Task • ${t.status}`, path: '/employee/tasks' }));
    const navMatches = navItems
      .filter((n) => n.label.toLowerCase().includes(q))
      .slice(0, 3)
      .map((n) => ({ label: n.label, sub: 'Page', path: n.path }));
    return [...navMatches, ...taskMatches];
  }, [searchQuery, isOwner, data.employees, data.tasks, currentEmployee?.id, navItems]);

  const handleSwitchRole = () => {
    const target = isOwner ? 'employee' : 'owner';
    switchRole(target);
    setProfileOpen(false);
    navigate(target === 'owner' ? '/admin/dashboard' : '/employee/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none">
      {/* Brand */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0 shadow-sm">
            W
          </div>
          {(!collapsed || isMobile) && (
            <div className="truncate">
              <div className="font-bold text-white text-base leading-tight tracking-tight">
                WorkSphere
              </div>
              <div className="text-[10px] text-slate-400 tracking-wide uppercase">
                {isOwner ? 'Owner Portal' : 'Employee Portal'}
              </div>
            </div>
          )}
        </div>
        {isMobile ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 hidden lg:flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const badgeCount =
            item.path === '/admin/leaves' && pendingLeavesCount > 0
              ? pendingLeavesCount
              : item.path === '/employee/announcements' && unreadAnnouncements > 0
              ? unreadAnnouncements
              : null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : item.featured
                    ? 'bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25 border border-indigo-400/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`
              }
              title={collapsed && !isMobile ? item.label : undefined}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${item.featured ? 'text-indigo-300' : ''}`} />
              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded-md bg-indigo-500/30 text-indigo-100">
                      {item.badge}
                    </span>
                  )}
                  {badgeCount !== null && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                      {badgeCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Role Card */}
      <div className="p-3 border-t border-slate-800/80">
        {(!collapsed || isMobile) && (
          <div className="mb-2.5 p-2.5 rounded-xl bg-slate-800/70 flex items-center gap-2.5">
            <Avatar
              name={isOwner ? auth?.name || 'Owner' : currentEmployee?.name || 'Rahul Sharma'}
              color={isOwner ? 'bg-indigo-600' : currentEmployee?.avatarColor || 'bg-blue-600'}
              src={!isOwner ? currentEmployee?.avatarUrl : ''}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {isOwner ? auth?.name || 'Owner Admin' : currentEmployee?.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {isOwner ? 'Owner / Admin' : currentEmployee?.designation}
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleSwitchRole}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-200 bg-indigo-500/15 hover:bg-indigo-500/25 transition-colors mb-1.5 ${
            collapsed && !isMobile ? 'justify-center px-2' : ''
          }`}
          title={`Switch to ${isOwner ? 'Employee' : 'Owner'} Demo`}
        >
          <ArrowLeftRight className="h-4 w-4 shrink-0" />
          {(!collapsed || isMobile) && (
            <span>Switch to {isOwner ? 'Employee' : 'Owner'}</span>
          )}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
            collapsed && !isMobile ? 'justify-center px-2' : ''
          }`}
          title="Sign out"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!collapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside
        className={`no-print hidden lg:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[76px]' : 'w-[260px]'
        } sticky top-0 h-screen`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-[260px] h-full shadow-2xl">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="no-print sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                {pageTitle}
              </h2>
            </div>
          </div>

          {/* Search */}
          <div className="relative hidden md:block w-72 lg:w-80">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isOwner ? 'Search employees or pages...' : 'Search tasks or pages...'}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
            />
            {quickSearchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-40">
                {quickSearchResults.map((res, i) => (
                  <button
                    key={`${res.path}-${i}`}
                    type="button"
                    onClick={() => {
                      navigate(res.path);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                  >
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{res.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{res.sub}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="h-[18px] w-[18px]" />
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-40">
                  <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {notifCount} updates
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5 max-h-64 overflow-y-auto">
                    {isOwner ? (
                      <>
                        {pendingLeavesCount > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              navigate('/admin/leaves');
                            }}
                            className="w-full text-left p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/60 text-xs"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {pendingLeavesCount} Pending Leave Request(s)
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                              Click to review and approve/reject
                            </p>
                          </button>
                        )}
                        {data.activities.slice(0, 4).map((act) => (
                          <div key={act.id} className="p-2 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
                            <p className="text-slate-800 dark:text-slate-200">
                              <span className="font-semibold">{act.actor}</span> {act.action}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{act.timestamp}</p>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {data.announcements.slice(0, 3).map((ann) => (
                          <button
                            key={ann.id}
                            type="button"
                            onClick={() => {
                              setNotifOpen(false);
                              navigate('/employee/announcements');
                            }}
                            className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {ann.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {ann.category} • {ann.publishDate}
                            </p>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Avatar
                  name={isOwner ? auth?.name || 'Owner' : currentEmployee?.name || 'Rahul Sharma'}
                  color={isOwner ? 'bg-indigo-600' : currentEmployee?.avatarColor || 'bg-blue-600'}
                  src={!isOwner ? currentEmployee?.avatarUrl : ''}
                  size="sm"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {isOwner ? auth?.name || 'Owner' : currentEmployee?.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isOwner ? 'Administrator' : currentEmployee?.id}
                  </p>
                </div>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-40">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {isOwner ? auth?.email : currentEmployee?.email}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Role: {isOwner ? 'Owner / Admin' : 'Employee'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(isOwner ? '/admin/settings' : '/employee/profile');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {isOwner ? 'Workspace Settings' : 'My Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSwitchRole}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center gap-2"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    Switch to {isOwner ? 'Employee' : 'Owner'} Demo
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Assistant */}
      <Chatbot />
    </div>
  );
}
