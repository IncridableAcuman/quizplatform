import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';
import type { LeaderboardUser } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';

type PeriodType = 'all-time' | 'weekly' | 'daily';

export const LeaderboardPage: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>('all-time');
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const endpoint = period === 'all-time' ? '/leaderboard' : `/leaderboard/${period}`;
        const response = await axiosClient.get<LeaderboardUser[]>(endpoint);
        setUsers(response.data || []);
      } catch (err) {
        console.error("Leaderboard ma'lumotlarini yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [period]);

  const topThree = users.slice(0, 3);
  const restUsers = users.slice(3);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Sahifa Sarlavhasi */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm shadow-amber-500/10">
          <Trophy className="w-4 h-4" />
          <span>Top Bilimdonlar Reytingi</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Peshqadamlar Jadvali
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          Platformadagi eng faol va kuchli bilim egalari. O'z o'rningizni oshirish uchun testlarni topshiring!
        </p>

        {/* Vaqt Oralig'i Tablari */}
        <div className="inline-flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner mt-4">
          {(
            [
              { id: 'all-time', label: 'Barcha Vaqtlar' },
              { id: 'weekly', label: 'Haftalik' },
              { id: 'daily', label: 'Kunlik' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                period === tab.id
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-72 gap-3">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Reyting hisoblanmoqda...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Bu davr uchun ishtirokchilar topilmadi</h3>
          <p className="text-slate-400 text-xs mt-1">
            Ushbu vaqt oralig'ida hali hech kim test topshirmagan.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podyum (Podium) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-8 max-w-3xl mx-auto">
            {/* 2-O'rin (Kumush) */}
            {topThree[1] ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-3 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-400 flex items-center justify-center font-black text-xl text-slate-200 shadow-xl mx-auto">
                    {topThree[1].username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -top-2.5 -right-1 bg-slate-400 text-slate-900 rounded-full p-1 shadow">
                    <Medal className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-bold text-white text-xs sm:text-sm truncate max-w-[110px]">
                  {topThree[1].fullName || topThree[1].username}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300 mt-0.5">
                  {topThree[1].score} ball
                </span>

                <div className="w-full bg-gradient-to-b from-slate-800 to-slate-900/90 border-t-2 border-slate-400 h-28 sm:h-36 rounded-t-3xl mt-4 flex items-center justify-center font-black text-3xl text-slate-400 shadow-2xl">
                  2
                </div>
              </motion.div>
            ) : (
              <div />
            )}

            {/* 1-O'rin (Oltin - Markaz) */}
            {topThree[0] ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center z-10"
              >
                <div className="relative mb-3 text-center">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                    <Crown className="w-8 h-8 fill-amber-400" />
                  </div>
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-amber-400 flex items-center justify-center font-black text-2xl text-amber-300 shadow-2xl shadow-amber-500/20 mx-auto">
                    {topThree[0].username.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <span className="font-extrabold text-amber-300 text-sm sm:text-base truncate max-w-[130px]">
                  {topThree[0].fullName || topThree[0].username}
                </span>
                <span className="text-xs font-mono font-black text-amber-400 mt-0.5">
                  {topThree[0].score} ball
                </span>

                <div className="w-full bg-gradient-to-b from-amber-500/20 via-slate-800 to-slate-900/90 border-t-2 border-amber-400 h-36 sm:h-48 rounded-t-3xl mt-4 flex items-center justify-center font-black text-4xl text-amber-400 shadow-2xl">
                  1
                </div>
              </motion.div>
            ) : (
              <div />
            )}

            {/* 3-O'rin (Bronza) */}
            {topThree[2] ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-3 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-amber-900/40 to-slate-800 border-2 border-amber-700 flex items-center justify-center font-black text-xl text-amber-500 shadow-xl mx-auto">
                    {topThree[2].username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="absolute -top-2.5 -right-1 bg-amber-700 text-amber-200 rounded-full p-1 shadow">
                    <Medal className="w-4 h-4" />
                  </div>
                </div>
                <span className="font-bold text-white text-xs sm:text-sm truncate max-w-[110px]">
                  {topThree[2].fullName || topThree[2].username}
                </span>
                <span className="text-xs font-mono font-bold text-amber-500 mt-0.5">
                  {topThree[2].score} ball
                </span>

                <div className="w-full bg-gradient-to-b from-slate-800 to-slate-900/90 border-t-2 border-amber-700 h-24 sm:h-28 rounded-t-3xl mt-4 flex items-center justify-center font-black text-3xl text-amber-600 shadow-2xl">
                  3
                </div>
              </motion.div>
            ) : (
              <div />
            )}
          </div>

          {/* 4-o'rindan keyingi qatnashchilar jadvali */}
          {restUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-800/40">
                      <th className="py-3.5 px-6">O'rin</th>
                      <th className="py-3.5 px-6">Ishtirokchi</th>
                      <th className="py-3.5 px-6 text-right">To'plangan Ball</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {restUsers.map((u, idx) => {
                      const isMe = currentUser?.username === u.username;
                      const rankNumber = idx + 4;

                      return (
                        <tr
                          key={u.username}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isMe ? 'bg-sky-500/10 font-bold border-l-4 border-sky-400' : ''
                          }`}
                        >
                          <td className="py-4 px-6 font-mono font-bold text-slate-400">
                            #{rankNumber}
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                                {u.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-white block">
                                  {u.fullName || u.username}
                                  {isMe && (
                                    <span className="ml-2 text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-md font-mono">
                                      Siz
                                    </span>
                                  )}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">@{u.username}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right font-mono font-bold text-amber-400">
                            {u.score} ball
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
