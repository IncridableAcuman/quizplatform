import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Quizlar', path: '/quizzes', icon: BookOpen },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 md:hidden hover:bg-slate-800 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>QuizPlatform</span>
          </Link>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <User className="w-4 h-4 text-sky-400" />
            <span className="font-medium text-slate-200">{user?.username}</span>
            <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-md font-mono">
              {user?.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Chiqish"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-900/30 p-4 space-y-2 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Mobile Sidebar (Drawer) */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 p-4 z-50 md:hidden flex flex-col space-y-2"
              >
                <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-800">
                  <span className="font-bold text-white">Menu</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Dynamic Main Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};