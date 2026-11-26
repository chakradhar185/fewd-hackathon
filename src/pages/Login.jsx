import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/UI';

const REMEMBER_KEY = 'worksphere_remember_email';

export default function Login() {
  const { auth, login, quickLogin } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBER_KEY) || 'admin@worksphere.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    if (auth?.role === 'owner') navigate('/admin/dashboard', { replace: true });
    if (auth?.role === 'employee') navigate('/employee/dashboard', { replace: true });
  }, [auth, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(email, password, rememberMe);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(result.role === 'owner' ? '/admin/dashboard' : '/employee/dashboard');
  };

  const handleQuick = (role) => {
    const loggedRole = quickLogin(role);
    navigate(loggedRole === 'owner' ? '/admin/dashboard' : '/employee/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* Left Brand & Workspace Visual Panel */}
      <div className="lg:w-[52%] bg-slate-900 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center font-extrabold text-lg text-white shadow-lg shadow-indigo-600/30">
            W
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight">WorkSphere</span>
            <p className="text-xs text-slate-400">People. Potential. Progress.</p>
          </div>
        </div>

        {/* Hero Copy + Clean Abstract Workspace Visual */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 my-10 space-y-8 max-w-xl"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/25 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Modern Workforce & Talent Platform
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Run your people operations with clarity and precision.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Manage employee directories, attendance, leaves, payroll, and match the right talent to every project with transparent skill scoring.
            </p>
          </div>

          {/* Abstract Workspace Preview Card */}
          <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700/70 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Smart Employee–Project Matcher</p>
                  <p className="text-[11px] text-slate-400">E-Commerce Web App • Weighted Skill Fit</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300">
                92% Top Match
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-900/70 border border-slate-700/60 p-3">
                <p className="text-[11px] text-slate-400">Workforce</p>
                <p className="text-lg font-bold text-white mt-0.5">18 Active</p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-700/60 p-3">
                <p className="text-[11px] text-slate-400">Attendance</p>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">94.2%</p>
              </div>
              <div className="rounded-xl bg-slate-900/70 border border-slate-700/60 p-3">
                <p className="text-[11px] text-slate-400">Departments</p>
                <p className="text-lg font-bold text-indigo-300 mt-0.5">6 Teams</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Dual Owner & Employee Portals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Real-time LocalStorage Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Role-Aware AI Assistant</span>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 text-xs text-slate-400">
          WorkSphere HR Platform • Interactive Frontend Demo
        </div>
      </div>

      {/* Right Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card p-6 sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sign in to WorkSphere
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Access your Owner control center or Employee workspace.
            </p>
          </div>

          {/* Quick Demo Role Buttons */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              One-Click Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuick('owner')}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Users className="h-4 w-4" />
                Login as Owner
              </button>
              <button
                type="button"
                onClick={() => handleQuick('employee')}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <UserCheck className="h-4 w-4" />
                Login as Employee
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-3 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Or sign in with credentials
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@worksphere.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Demo Accounts Reference */}
          <div className="mt-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Demo Credentials
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Simulated Auth
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Owner: <code className="font-mono">admin@worksphere.com</code></span>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@worksphere.com');
                  setPassword('123456');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Fill
              </button>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Employee: <code className="font-mono">rahul@worksphere.com</code></span>
              <button
                type="button"
                onClick={() => {
                  setEmail('rahul@worksphere.com');
                  setPassword('123456');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Fill
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-700">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              Password for all demo accounts: <strong className="text-slate-600 dark:text-slate-200">123456</strong>. Frontend simulation only.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Demo Password Help"
        subtitle="Simulated authentication environment"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <p>
            WorkSphere is running in <strong>frontend demo mode</strong> with simulated browser-local authentication. No external password reset email is sent.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <p><strong>Owner:</strong> admin@worksphere.com / 123456</p>
            <p><strong>Employee (Rahul):</strong> rahul@worksphere.com / 123456</p>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@worksphere.com');
                setPassword('123456');
                setForgotOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
            >
              Fill Owner Credentials
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
