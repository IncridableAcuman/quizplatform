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
} from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';

interface UserStats {
  totalQuizzesTaken: number;
  passedQuizzes: number;
  averageScore: number;
  totalTimeSpentMinutes: number;
  scoreHistory: { date: string; score: number }[];
  categoryPerformance: { category: string; score: number }[];
  recentResults: {
    id: number;
    quizTitle: string;
    score: number;
    isPassed: boolean;
    date: string;
  }[];
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
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
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Demo fallback ma'lumotlar (agar backend hali tayyor bo'lmasa)
  const scoreData = stats?.scoreHistory || [
    { date: 'Mon', score: 65 },
    { date: 'Tue', score: 75 },
    { date: 'Wed', score: 80 },
    { date: 'Thu', score: 70 },
    { date: 'Fri', score: 90 },
    { date: 'Sat', score: 85 },
    { date: 'Sun', score: 95 },
  ];

  const categoryData = stats?.categoryPerformance || [
    { category: 'Java', score: 88 },
    { category: 'React', score: 92 },
    { category: 'Spring Boot', score: 78 },
    { category: 'SQL', score: 85 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Sarlavha */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Shaxsiy Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          O'zlashtirish ko'rsatkichlaringiz va o'quv dinamikangiz
        </p>
      </div>

      {/* 4 talik Statistika Kartalari */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Jami Ishlangan Testlar</span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {stats?.totalQuizzesTaken ?? 12}
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Muvaffaqiyatli (Passed)</span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {stats?.passedQuizzes ?? 10}
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">O'rtacha Ball</span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {stats?.averageScore ?? 85.5}%
            </h3>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex items-center gap-4"
        >
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Sarflangan Vaqt</span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {stats?.totalTimeSpentMinutes ?? 140} min
            </h3>
          </div>
        </motion.div>
      </div>

      {/* Grafiklar Bo'limi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Natijalar Dinamikasi (Area Chart) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Natijalar Dinamikasi</h2>
              <p className="text-xs text-slate-400 mt-0.5">Oxirgi testlardagi ballar trendi</p>
            </div>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Kategoriyalar bo'yicha (Bar Chart) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Bo'limlar Boyicha</h2>
              <p className="text-xs text-slate-400 mt-0.5">Kategoriyalar bo'yicha ko'rsatkich</p>
            </div>
            <Award className="w-5 h-5 text-sky-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Oxirgi Topshirilgan Testlar Jadvali */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Oxirgi Topshirilgan Testlar</h2>
          <button
            onClick={() => navigate('/quizzes')}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <span>Barchasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Quiz Nomi</th>
                <th className="py-3 px-4">Sana</th>
                <th className="py-3 px-4">Ball</th>
                <th className="py-3 px-4">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {(stats?.recentResults || [
                { id: 1, quizTitle: 'Spring Boot Fundamentals', score: 90, isPassed: true, date: '2026-07-28' },
                { id: 2, quizTitle: 'React Hooks Deep Dive', score: 85, isPassed: true, date: '2026-07-25' },
                { id: 3, quizTitle: 'Java Threads & Concurrency', score: 55, isPassed: false, date: '2026-07-20' },
              ]).map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-white">{item.quizTitle}</td>
                  <td className="py-3.5 px-4 text-slate-400">{item.date}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-sky-400">{item.score}%</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                        item.isPassed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {item.isPassed ? "O'tdi" : "O'tmadi"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};