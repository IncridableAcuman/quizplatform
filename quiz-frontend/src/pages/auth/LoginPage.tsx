import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  
  // Zustand store'dan login harakati va loading holatini olamiz
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Direct Zustand login action
      await login({ username, password });
      navigate('/dashboard');
    } catch (err) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message || 'Username yoki parol xato!';
        setError(message);
      } else {
        setError('Tizimga kirishda kutilmagan xatolik yuz berdi.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Orqa fon uchun animatsiyali yorug'lik effektlari */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-14 h-14 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sky-400"
          >
            <Sparkles className="w-7 h-7" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Xush kelibsiz</h2>
          <p className="text-slate-400 text-sm mt-2">
            Quiz platformasiga kirish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masalan: izzatbek"
                className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Parol
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Tizimga Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
            Ro'yxatdan o'ting
          </Link>
        </div>
      </motion.div>
    </div>
  );
};