import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  History,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldAlert,
  Flame,
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
    { label: 'Natijalarim', path: '/results', icon: History },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-sky-500/30 selection:text-sky-300">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl border border-slate-800 bg-slate-800/60 text-slate-300 md:hidden hover:bg-slate-800 transition-colors"
            aria-label="Menyu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 border border-sky-400/40 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-white via-slate-200 to-sky-300 bg-clip-text text-transparent">
              QuizPlatform
            </span>
          </Link>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {user?.totalScore !== undefined && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Flame className="w-4 h-4 fill-amber-500/20" />
              <span>{user.totalScore} ball</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-sm bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-inner">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-xs uppercase">
              {user?.username?.slice(0, 2) || <User className="w-4 h-4" />}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-slate-200 text-xs leading-none">
                {user?.fullName || user?.username}
              </span>
              <span className="text-[10px] text-sky-400 font-mono font-medium mt-0.5">
                {user?.role}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Tizimdan chiqish"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-md p-4 space-y-2 shrink-0">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
            Asosiy Bo'limlar
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-semibold shadow-sm shadow-sky-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400"
                  />
                )}
              </Link>
            );
          })}

          <div className="mt-auto pt-6 border-t border-slate-800/60 px-3">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-sky-950/60 to-slate-900 border border-sky-800/30 text-xs">
              <p className="font-semibold text-sky-300">Bilimingizni sinang!</p>
              <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                Har bir topshirilgan test uchun ballar oling va peshqadamlar jadvalida ko'tariling.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Slide-over Drawer */}
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
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-slate-900 border-r border-slate-800 p-5 z-50 flex flex-col space-y-3 md:hidden shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Sparkles className="w-5 h-5 text-sky-400" />
                    <span>QuizPlatform</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
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
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Tizimdan chiqish</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Asosiy Sahifa Kontenti */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
