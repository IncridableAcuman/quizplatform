import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Award } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';

interface LeaderboardUser {
    rank: number;
    username: string;
    fullName: string;
    score: number;
    totalQuizzesTaken?: number;
}

export const LeaderboardPage: React.FC = () => {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await axiosClient.get<LeaderboardUser[]>('/leaderboard');
                setUsers(response.data);
            } catch (err) {
                console.error("Leaderboard ma'lumotlarini yuklashda xatolik:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Agar backend'da foydalanuvchilar bo'lmasa yoki ro'yxat bo'sh bo'lsa
    const leaderboardData = users;

    const topThree = leaderboardData.slice(0, 3);
    const restUsers = leaderboardData.slice(3);

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            {/* Sahifa Sarlavhasi */}
            <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Top Ishtirokchilar</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Peshqadamlar Jadvali</h1>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Bilim darajasi va to'plangan umumiy ballar bo'yicha eng kuchli foydalanuvchilar
                </p>
            </div>

            {leaderboardData.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <p className="text-slate-400 text-sm">Hozircha peshqadamlar mavjud emas.</p>
                </div>
            ) : (
                <>
                    {/* Top 3 Podyum (Podium) */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-6 max-w-3xl mx-auto">
                        {/* 2-O'rin */}
                        {topThree[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative mb-3 text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-slate-400 flex items-center justify-center font-bold text-xl text-slate-300 shadow-xl mx-auto">
                                        {topThree[1].username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <Medal className="w-6 h-6 text-slate-300 absolute -top-2 -right-1" />
                                </div>
                                <span className="font-semibold text-white text-sm sm:text-base truncate max-w-[100px]">
                  {topThree[1].username}
                </span>
                                <span className="text-xs font-mono font-bold text-sky-400 mt-0.5">
                  {topThree[1].score} pts
                </span>

                                <div className="w-full bg-slate-900 border border-slate-800 h-28 sm:h-36 rounded-t-2xl mt-4 flex items-center justify-center font-extrabold text-2xl text-slate-400">
                                    2
                                </div>
                            </motion.div>
                        )}

                        {/* 1-O'rin (O'rtadagi eng baland) */}
                        {topThree[0] && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative mb-3 text-center">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center font-extrabold text-2xl text-amber-300 shadow-2xl shadow-amber-500/20 mx-auto">
                                        {topThree[0].username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <Crown className="w-8 h-8 text-amber-400 absolute -top-4 left-1/2 -translate-x-1/2 drop-shadow-md" />
                                </div>
                                <span className="font-bold text-white text-base sm:text-lg truncate max-w-[120px]">
                  {topThree[0].username}
                </span>
                                <span className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                  {topThree[0].score} pts
                </span>

                                <div className="w-full bg-slate-900 border border-amber-500/30 bg-gradient-to-t from-slate-900 to-amber-500/10 h-36 sm:h-48 rounded-t-2xl mt-4 flex items-center justify-center font-extrabold text-3xl text-amber-400">
                                    1
                                </div>
                            </motion.div>
                        )}

                        {/* 3-O'rin */}
                        {topThree[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative mb-3 text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-amber-700 flex items-center justify-center font-bold text-xl text-amber-600 shadow-xl mx-auto">
                                        {topThree[2].username.slice(0, 2).toUpperCase()}
                                    </div>
                                    <Award className="w-6 h-6 text-amber-600 absolute -top-2 -right-1" />
                                </div>
                                <span className="font-semibold text-white text-sm sm:text-base truncate max-w-[100px]">
                  {topThree[2].username}
                </span>
                                <span className="text-xs font-mono font-bold text-sky-400 mt-0.5">
                  {topThree[2].score} pts
                </span>

                                <div className="w-full bg-slate-900 border border-slate-800 h-20 sm:h-28 rounded-t-2xl mt-4 flex items-center justify-center font-extrabold text-2xl text-amber-700">
                                    3
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Qolgan Reyting Ro'yxati */}
                    {restUsers.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6"
                        >
                            <div className="space-y-2">
                                {restUsers.map((user) => (
                                    <div
                                        key={user.rank}
                                        className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-slate-800/60 hover:bg-slate-800/70 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                      <span className="w-6 text-center font-mono font-bold text-slate-400 text-sm">
                        #{user.rank}
                      </span>
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-slate-300">
                                                {user.username.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white text-sm">{user.username}</h3>
                                                <span className="text-xs text-slate-400">
                          {user.fullName || 'Foydalanuvchi'}
                        </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                        <span className="font-mono font-bold text-sky-400 text-sm sm:text-base">
                          {user.score}
                        </span>
                                                <span className="text-xs text-slate-400 block">pts</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
};