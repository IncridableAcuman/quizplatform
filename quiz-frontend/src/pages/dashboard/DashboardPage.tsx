import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  Trophy,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';
import type { UserStats } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await axiosClient.get<UserStats>('/user/dashboard-stats');
        setStats(response.data);
      } catch (err) {
        console.error('Dashboard statistikasini yuklashda xatolik:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Dashboard yuklanmoqda...</p>
      </div>
    );
  }

  // Fallback demo grafik ma'lumotlar
  const scoreData = (stats?.scoreHistory && stats.scoreHistory.length > 0)
    ? stats.scoreHistory
    : [
        { date: '1-test', score: 30 },
        { date: '2-test', score: 50 },
        { date: '3-test', score: 40 },
        { date: '4-test', score: 70 },
        { date: '5-test', score: 85 },
      ];

  const categoryData = (stats?.categoryPerformance && stats.categoryPerformance.length > 0)
    ? stats.categoryPerformance
    : [
        { category: 'Java & Spring', score: 75 },
        { category: 'React & TS', score: 85 },
        { category: 'SQL & DB', score: 60 },
      ];

  const totalQuizzes = stats?.totalQuizzesTaken || stats?.totalQuizzesCompleted || 0;
  const passedQuizzes = stats?.passedQuizzes || 0;
  const accuracy = stats?.accuracyPercentage || (totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0);
  const totalScore = stats?.totalScore || user?.totalScore || 0;
  const avgTime = stats?.averageTimeTakenSeconds || 180;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner / Xush kelibsiz */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-purple-900/40 border border-sky-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interaktiv Bilim Maydoni</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Xush kelibsiz, {user?.fullName || user?.username || 'Foydalanuvchi'}! 👋
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Bugun bilimingizni yangi bosqichga ko'taring. Viktorinalarda qatnashing va o'z yutuqlaringizni tahlil qiling.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/quizzes')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/25 active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Test Tanlash</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 4 talik Statistika Kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jami Testlar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-slate-900/70 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 backdrop-blur-md transition-all hover:shadow-lg hover:shadow-sky-500/5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topshirilgan Testlar</span>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{totalQuizzes}</span>
            <p className="text-xs text-slate-400 mt-1">
              <span className="text-emerald-400 font-semibold">{passedQuizzes} tasi</span> muvaffaqiyatli
            </p>
          </div>
        </motion.div>

        {/* Aniqilik / O'tish foizi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 backdrop-blur-md transition-all hover:shadow-lg hover:shadow-emerald-500/5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aniqlik Ko'rsatkichi</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">{accuracy}%</span>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(accuracy, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Umumiy Ball */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 backdrop-blur-md transition-all hover:shadow-lg hover:shadow-amber-500/5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jami To'plangan Ball</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-amber-400">{totalScore}</span>
            <p className="text-xs text-slate-400 mt-1">Reytingdagi asosiy ko'rsatkich</p>
          </div>
        </motion.div>

        {/* Sarflangan Vaqt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 backdrop-blur-md transition-all hover:shadow-lg hover:shadow-purple-500/5 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">O'rtacha Vaqt</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black text-white">
              {Math.floor(avgTime / 60)}m {avgTime % 60}s
            </span>
            <p className="text-xs text-slate-400 mt-1">Har bir test uchun sarflangan</p>
          </div>
        </motion.div>
      </div>

      {/* Grafiklar Qatori */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ballar Dinamikasi (AreaChart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-400" />
                <span>O'zlashtirish Dinamikasi</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Oxirgi topshirilgan testlar bo'yicha to'plangan ballar</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Kategoriyalar bo'yicha Ko'rsatkich (BarChart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Kategoriyalar Bo'yicha Natijalar</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Turli fan va yo'nalishlar bo'yicha o'rtacha ball</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* So'nggi Natijalar Bo'limi */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">So'nggi Natijalar</h2>
            <p className="text-xs text-slate-400 mt-0.5">Oxirgi ishlangan testlar va ularning statusi</p>
          </div>
          <button
            onClick={() => navigate('/results')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <span>Barcha natijalar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats?.recentResults && stats.recentResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Test Nomi</th>
                  <th className="py-3 px-4">To'plangan Ball</th>
                  <th className="py-3 px-4">Holat</th>
                  <th className="py-3 px-4">Sana</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {stats.recentResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{res.quizTitle}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">{res.score} ball</td>
                    <td className="py-3.5 px-4">
                      {res.isPassed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>O'tdi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <span>O'tmadi</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{res.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/results')}
                        className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                      >
                        Batafsil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Hozircha hech qanday test topshirilmagan.</p>
            <button
              onClick={() => navigate('/quizzes')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-xs font-semibold transition-all border border-sky-500/30"
            >
              <span>Birinchi testni boshlash</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
