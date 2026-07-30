import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  
  // Zustand store'dan register action va isLoading holatini olamiz
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Direct Zustand register action
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message || "Ro'yxatdan o'tishda xatolik yuz berdi!";
        setError(message);
      } else {
        setError("Kutilmagan xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden py-12">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-14 h-14 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-sky-400"
          >
            <UserPlus className="w-7 h-7" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Hisob Yaratish</h2>
          <p className="text-slate-400 text-sm mt-2">
            Barcha bilimingizni sinab ko'rish uchun hoziroq ro'yxatdan o'ting
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="izzatbek_dev"
                className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
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
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
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
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Ro'yxatdan O'tish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Allaqachon hisobingiz bormi?{' '}
          <Link to="/login" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
            Kirish
          </Link>
        </div>
      </motion.div>
    </div>
  );
};