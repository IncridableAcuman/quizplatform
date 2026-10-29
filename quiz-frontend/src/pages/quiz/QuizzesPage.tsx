import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Clock,
  HelpCircle,
  Play,
  BookOpen,
  Award,
  Zap,
} from "lucide-react";
import { axiosClient } from "../../api/axiosClient";
import type { Quiz, Category } from "../../types";

export const QuizzesPage: React.FC = () => {
  const navigate = useNavigate();

  // State-lar
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter va Search State-lari
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "ALL">("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");

  // Ma'lumotlarni yuklash
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesRes, categoriesRes] = await Promise.all([
          axiosClient.get<Quiz[]>("/quizzes"),
          axiosClient.get<Category[]>("/categories"),
        ]);

        setQuizzes(quizzesRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter va Search Logikasi
  const filteredQuizzes = useMemo(() => {
    if (!Array.isArray(quizzes)) return [];

    return quizzes.filter((quiz) => {
      const matchesSearch =
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategoryId === "ALL" ||
        quiz.category?.id === selectedCategoryId;

      const matchesDifficulty =
        selectedDifficulty === "ALL" ||
        quiz.difficulty?.toUpperCase() === selectedDifficulty.toUpperCase();

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [quizzes, searchQuery, selectedCategoryId, selectedDifficulty]);

  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty?.toUpperCase()) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "HARD":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Viktorinalar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Sarlavha Bo'limi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Bilim Sinovlari</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mavjud Viktorinalar
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Qiziqqan sohangizni tanlang va o'z darajangizni amalda sinab ko'ring
          </p>
        </div>
      </div>

      {/* Filter va Qidiruv Boshqaruvi */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Qidiruv Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Test nomi yoki ta'rifi bo'yicha qidiring..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all backdrop-blur-md"
          />
        </div>

        {/* Qiyinchilik Filtri */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl">
          {["ALL", "EASY", "MEDIUM", "HARD"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDifficulty === diff
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {diff === "ALL" ? "Barchasi" : diff === "EASY" ? "Oson" : diff === "MEDIUM" ? "O'rta" : "Qiyin"}
            </button>
          ))}
        </div>
      </div>

      {/* Kategoriyalar Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategoryId("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
            selectedCategoryId === "ALL"
              ? "bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm shadow-sky-500/20"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          Barcha Kategoriyalar
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategoryId === cat.id
                ? "bg-sky-500/20 border-sky-500/50 text-sky-300 shadow-sm shadow-sky-500/20"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Viktorinalar Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Hech qanday viktorina topilmadi</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Qidiruv so'zini yoki tanlangan filtrlarni o'zgartirib ko'ring.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative flex flex-col justify-between bg-slate-900/70 border border-slate-800 hover:border-sky-500/50 rounded-3xl p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                      {quiz.category?.name || "Kategoriya"}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getDifficultyBadge(
                        quiz.difficulty
                      )}`}
                    >
                      {quiz.difficulty}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {quiz.description || "Ushbu test orqali o'z bilimlaringizni sinab ko'ring."}
                  </p>
                </div>

                {/* Footer Info & Action */}
                <div className="mt-6 pt-5 border-t border-slate-800/80">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400 mb-5">
                    <div className="bg-slate-800/50 p-2 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-sky-400 mx-auto mb-1" />
                      <span className="font-semibold text-slate-200">{quiz.timeLimitMinutes} daq</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-xl">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400 mx-auto mb-1" />
                      <span className="font-semibold text-slate-200">
                        {quiz.questionsCount || quiz.questions?.length || 10} savol
                      </span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-xl">
                      <Award className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                      <span className="font-semibold text-slate-200">{quiz.passingScore}% o'tish</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/20 active:scale-98 group-hover:shadow-sky-500/30"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Testni Boshlash</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
