import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  BookOpen,
  FolderPlus,
} from "lucide-react";
import { axiosClient } from "../../api/axiosClient";
import type { Quiz, Category } from "../../types";

interface OptionDTO {
  id?: number;
  optionText: string;
  isCorrect: boolean;
}

interface QuestionDTO {
  id?: number;
  content: string;
  codeSnippet?: string;
  points?: number;
  options: OptionDTO[];
}

interface QuizFormData {
  id?: number;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScore: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  categoryId: number | null;
  questions: QuestionDTO[];
}

export const AdminQuizManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Kategoriya Form State
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  // Quiz Form State
  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    timeLimitMinutes: 15,
    passingScore: 60,
    difficulty: "MEDIUM",
    categoryId: null,
    questions: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizzesRes, categoriesRes] = await Promise.all([
        axiosClient.get<Quiz[]>("/quizzes"),
        axiosClient.get<Category[]>("/categories"),
      ]);

      setQuizzes(quizzesRes.data || []);
      setCategories(categoriesRes.data || []);

      if (categoriesRes.data && categoriesRes.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: prev.categoryId || categoriesRes.data[0].id,
        }));
      }
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      timeLimitMinutes: 15,
      passingScore: 60,
      difficulty: "MEDIUM",
      categoryId: categories.length > 0 ? categories[0].id : null,
      questions: [
        {
          content: "",
          points: 10,
          options: [
            { optionText: "", isCorrect: true },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
          ],
        },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (quizId: number) => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/admin/quizzes/${quizId}`);
      const data = response.data;

      setFormData({
        id: data.id,
        title: data.title,
        description: data.description || "",
        timeLimitMinutes: data.timeLimitMinutes || 15,
        passingScore: data.passingScore || 60,
        difficulty: data.difficulty || "MEDIUM",
        categoryId: data.category?.id || (categories.length > 0 ? categories[0].id : null),
        questions: (data.questions || []).map((q: any) => ({
          id: q.id,
          content: q.content,
          codeSnippet: q.codeSnippet || "",
          points: q.points || 10,
          options: (q.options || []).map((opt: any) => ({
            id: opt.id,
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
        })),
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Quiz ma'lumotlarini yuklashda xatolik:", err);
      alert("Quizni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (!window.confirm("Haqiqatan ham ushbu quizni o'chirmoqchimisiz?")) return;

    try {
      await axiosClient.delete(`/admin/quizzes/${quizId}`);
      await fetchData();
    } catch (err) {
      console.error("Quizni o'chirishda xatolik:", err);
      alert("Quizni o'chirib bo'lmadi.");
    }
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          content: "",
          points: 10,
          options: [
            { optionText: "", isCorrect: true },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
          ],
        },
      ],
    }));
  };

  const handleRemoveQuestion = (qIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIndex),
    }));
  };

  const handleQuestionChange = (qIndex: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      updated[qIndex] = { ...updated[qIndex], [field]: value };
      return { ...prev, questions: updated };
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      const opts = [...updated[qIndex].options];
      opts[optIndex] = { ...opts[optIndex], optionText: text };
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return { ...prev, questions: updated };
    });
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    setFormData((prev) => {
      const updated = [...prev.questions];
      const opts = updated[qIndex].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === optIndex,
      }));
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return { ...prev, questions: updated };
    });
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      await axiosClient.post("/admin/categories", {
        name: categoryName,
        description: categoryDesc,
        iconUrl: "code",
      });
      setIsCategoryModalOpen(false);
      setCategoryName("");
      setCategoryDesc("");
      await fetchData();
    } catch (err) {
      console.error("Kategoriya yaratishda xatolik:", err);
      alert("Kategoriya yaratishda xatolik yuz berdi");
    }
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert("Iltimos, kategoriyani tanlang!");
      return;
    }

    if (formData.questions.length === 0) {
      alert("Kamida bitta savol qo'shishingiz kerak!");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      timeLimitMinutes: Number(formData.timeLimitMinutes),
      passingScore: Number(formData.passingScore),
      difficulty: formData.difficulty,
      categoryId: Number(formData.categoryId),
      questions: formData.questions.map((q) => ({
        content: q.content,
        codeSnippet: q.codeSnippet,
        points: Number(q.points || 10),
        options: q.options.map((opt) => ({
          optionText: opt.optionText,
          isCorrect: Boolean(opt.isCorrect),
        })),
      })),
    };

    try {
      if (formData.id) {
        await axiosClient.put(`/admin/quizzes/${formData.id}`, payload);
      } else {
        await axiosClient.post("/admin/quizzes", payload);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      console.error("Quizni saqlashda xatolik:", err);
      alert(`Xatolik: ${err.response?.data?.message || "Ma'lumotlarni tekshiring"}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && quizzes.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Admin paneli yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Sarlavha & Boshqaruv tugmalari */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-sky-400" />
            <span>Quiz va Savollar Boshqaruvi</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Yangi viktorinalar, savollar to'plami va kategoriyalarni boshqarish
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700"
          >
            <FolderPlus className="w-4 h-4 text-sky-400" />
            <span>Kategoriya Qo'shish</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Quiz Yaratish</span>
          </button>
        </div>
      </div>

      {/* Quizlar Jadvali */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider bg-slate-800/40">
                <th className="py-3.5 px-6">Quiz Nomi</th>
                <th className="py-3.5 px-4">Kategoriya</th>
                <th className="py-3.5 px-4">Qiyinchilik</th>
                <th className="py-3.5 px-4">Vaqt</th>
                <th className="py-3.5 px-4">Savollar Soni</th>
                <th className="py-3.5 px-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">
                    {quiz.title}
                    <span className="text-[11px] text-slate-500 font-normal block truncate max-w-sm">
                      {quiz.description}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-xs font-semibold text-sky-400">
                    {quiz.category?.name || "Kategoriyasiz"}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                        quiz.difficulty === "EASY"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : quiz.difficulty === "MEDIUM"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {quiz.difficulty}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                    {quiz.timeLimitMinutes} daq
                  </td>

                  <td className="py-4 px-4 text-xs font-semibold text-slate-300">
                    {quiz.questionsCount || quiz.questions?.length || 0} ta
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(quiz.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quiz Yaratish / Tahrirlash Modali */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">
                  {formData.id ? "Quizni Tahrirlash" : "Yangi Quiz Yaratish"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitQuiz} className="space-y-6">
                {/* Asosiy Quiz Ma'lumotlari */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Quiz Nomi
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="masalan: Java Multithreading Master"
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Kategoriya
                    </label>
                    <select
                      value={formData.categoryId || ""}
                      onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Qiyinchilik
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="EASY">Oson (EASY)</option>
                      <option value="MEDIUM">O'rta (MEDIUM)</option>
                      <option value="HARD">Qiyin (HARD)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Vaqt (daq)
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.timeLimitMinutes}
                        onChange={(e) => setFormData({ ...formData, timeLimitMinutes: Number(e.target.value) })}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        O'tish Bali (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={formData.passingScore}
                        onChange={(e) => setFormData({ ...formData, passingScore: Number(e.target.value) })}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Tavsif (Description)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Quiz haqida qisqacha ma'lumot..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Savollar Ro'yxati */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Savollar ({formData.questions.length})</h3>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Savol qo'shish</span>
                    </button>
                  </div>

                  {formData.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-sky-400 uppercase">
                          Savol #{qIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>O'chirish</span>
                        </button>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Savol matnini kiriting..."
                        value={q.content}
                        onChange={(e) => handleQuestionChange(qIdx, "content", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-sky-500"
                      />

                      <textarea
                        rows={2}
                        placeholder="Kod namunasi (ixtiyoriy, code snippet)..."
                        value={q.codeSnippet || ""}
                        onChange={(e) => handleQuestionChange(qIdx, "codeSnippet", e.target.value)}
                        className="w-full bg-slate-950 font-mono text-xs border border-slate-800 rounded-xl py-2 px-3 text-sky-300 focus:outline-none focus:border-sky-500"
                      />

                      {/* Variantlar */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">
                          Variantlar (To'g'ri javobni tanlang):
                        </span>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-opt-${qIdx}`}
                              checked={opt.isCorrect}
                              onChange={() => handleSetCorrectOption(qIdx, oIdx)}
                              className="w-4 h-4 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 cursor-pointer"
                            />
                            <input
                              type="text"
                              required
                              placeholder={`${oIdx + 1}-variant matni`}
                              value={opt.optionText}
                              onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                              className={`flex-1 bg-slate-900 border rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none ${
                                opt.isCorrect
                                  ? "border-emerald-500 ring-1 ring-emerald-500"
                                  : "border-slate-700"
                              }`}
                            />
                            {opt.isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                To'g'ri
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{submitting ? "Saqlanmoqda..." : "Saqlash"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Kategoriya Yaratish Modali */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-sky-400" />
                  <span>Yangi Kategoriya</span>
                </h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Kategoriya Nomi
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="masalan: DevOps & Cloud"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Tavsif
                  </label>
                  <textarea
                    rows={2}
                    value={categoryDesc}
                    onChange={(e) => setCategoryDesc(e.target.value)}
                    placeholder="Kategoriya yo'nalishi haqida qisqacha..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-md shadow-sky-500/20"
                  >
                    Yaratish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
