import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Clock,
  HelpCircle,
  Play,
  Sparkles,
  BookOpen,
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "ALL">(
    "ALL",
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");

  // Ma'lumotlarni yuklash
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesRes, categoriesRes] = await Promise.all([
          axiosClient.get<Quiz[]>("/quizzes"),
          axiosClient.get<Category[]>("/categories"),
        ]);

        setQuizzes(quizzesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter va Search Logikasi (useMemo orqali optimallashtirilgan)
  const filteredQuizzes = useMemo(() => {
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

  // Qiyinchilik darajasi uchun badge ranglari
  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty?.toUpperCase()) {
      case "EASY":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "HARD":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Sarlavha Bo'limi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-sky-400" />
            <span>Mavjud Quiz-lar</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            O'zingizga mos yo'nalishni tanlang va bilimingizni sinab ko'ring
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>Jami: {filteredQuizzes.length} ta test</span>
        </div>
      </div>

      {/* Filter va Search Boshqaruv Paneli */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Qidiruv Kiritish */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Quiz nomi yoki kalit so'z bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Qiyinchilik Darajasi Bo'yicha Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full md:w-44 bg-slate-950/80 border border-slate-800 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-sky-500/50 transition-all cursor-pointer"
            >
              <option value="ALL">Barcha Darajalar</option>
              <option value="EASY">Oson (Easy)</option>
              <option value="MEDIUM">O'rta (Medium)</option>
              <option value="HARD">Qiyin (Hard)</option>
            </select>
          </div>
        </div>

        {/* Kategoriya Pill-lari (Chips) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryId("ALL")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategoryId === "ALL"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/10"
                : "bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            Barcha Kategoriyalar
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategoryId === cat.id
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-500/10"
                  : "bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz-lar Kartalari Ro'yxati */}
      <AnimatePresence mode="wait">
        {filteredQuizzes.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-sky-500/5 relative overflow-hidden"
              >
                {/* Tepasidagi Kategoriya va Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg">
                      {quiz.category?.name || "Umumiy"}
                    </span>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getDifficultyBadge(
                        quiz.difficulty,
                      )}`}
                    >
                      {quiz.difficulty || "MEDIUM"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {quiz.description ||
                      "Ushbu quiz bo'yicha bilimingizni sinab ko'ring va natijaga erishing."}
                  </p>
                </div>

                {/* Pastki Meta-ma'lumotlar va Tugma */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quiz.timeLimitMinutes} daqiqa</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{quiz.questions?.length ?? 0} savol</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-sky-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Testni Boshlash</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Natija Topilmadi Holati */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-slate-900/40 border border-slate-800/60 rounded-2xl"
          >
            <div className="w-12 h-12 bg-slate-800 border border-slate-700 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Hech qanday quiz topilmadi
            </h3>
            <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              Qidiruv so'zini yoki tanlangan filterlarni o'zgartirib ko'ring.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryId("ALL");
                setSelectedDifficulty("ALL");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Filterlarni Tozalash
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
