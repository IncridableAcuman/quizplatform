import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  X,
  Save,
  BookOpen,
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
  content: string; // Backend 'content' fieldini kutadi (questionText o'rniga)
  options: OptionDTO[];
}

interface QuizFormData {
  id?: number;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScore: number; // <-- Qo'shildi
  difficulty: "EASY" | "MEDIUM" | "HARD";
  categoryId: number | null;
  questions: QuestionDTO[];
}

export const AdminQuizManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    timeLimitMinutes: 15,
    passingScore: 60, // <-- O'tish bali uchun odatiy qiymat (masalan: 60)
    difficulty: "MEDIUM",
    categoryId: null,
    questions: [],
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [quizzesRes, categoriesRes] = await Promise.all([
          axiosClient.get<Quiz[]>("/quizzes"),
          axiosClient.get<Category[]>("/categories"),
        ]);

        if (isMounted) {
          setQuizzes(quizzesRes.data);
          setCategories(categoriesRes.data);
          setLoading(false);

          // Kategoriya ro'yxati kelishi bilan default ID ni set qilamiz
          if (categoriesRes.data && categoriesRes.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              categoryId: categoriesRes.data[0].id,
            }));
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Ma'lumotlarni yuklashda xatolik:", err);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshQuizzes = async () => {
    try {
      const response = await axiosClient.get<Quiz[]>("/quizzes");
      setQuizzes(response.data);
    } catch (err) {
      console.error("Quizlarni qayta yuklashda xatolik:", err);
    }
  };

  const openModal = (quiz?: Quiz) => {
    const defaultCategoryId = categories.length > 0 ? categories[0].id : null;

    if (quiz) {
      const mappedQuestions: QuestionDTO[] = (quiz.questions || []).map(
        (q) => ({
          id: q.id,
          content: q.content,
          options: (q.options || []).map((opt) => ({
            id: opt.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect ?? false,
          })),
        }),
      );

      setFormData({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description || "",
        timeLimitMinutes: quiz.timeLimitMinutes,
        passingScore: quiz.passingScore || 60, // <-- Tahrirlashda mavjudini olish
        difficulty: quiz.difficulty || "MEDIUM",
        categoryId: quiz.category?.id || defaultCategoryId,
        questions: mappedQuestions,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        timeLimitMinutes: 15,
        passingScore: 60,
        difficulty: "MEDIUM",
        categoryId: defaultCategoryId,
        questions: [
          {
            content: "",
            options: [
              { optionText: "", isCorrect: true },
              { optionText: "", isCorrect: false },
              { optionText: "", isCorrect: false },
              { optionText: "", isCorrect: false },
            ],
          },
        ],
      });
    }
    setIsModalOpen(true);
  };
  const handleDeleteQuiz = async (id: number) => {
    if (
      !window.confirm(
        "Haqiqatdan ham ushbu quizni va uning barcha savollarini o'chirmoqchimisiz?",
      )
    )
      return;

    try {
      await axiosClient.delete(`/admin/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Quizni o'chirishda xatolik:", err);
    }
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          content: "",
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

  const handleRemoveQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, qIdx) => qIdx !== index),
    }));
  };

  const handleSelectCorrectOption = (qIndex: number, oIndex: number) => {
    setFormData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map(
        (opt, idx) => ({
          ...opt,
          isCorrect: idx === oIndex,
        }),
      );
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      alert("Iltimos, kategoriyani tanlang!");
      return;
    }

    setSubmitting(true);

    // Backend payload validation formatga keltirish
    const payload = {
      title: formData.title,
      description: formData.description,
      timeLimitMinutes: Number(formData.timeLimitMinutes),
      passingScore: Number(formData.passingScore),
      difficulty: formData.difficulty,
      categoryId: Number(formData.categoryId),
      questions: formData.questions.map((q) => ({
        ...(q.id && { id: q.id }),
        content: q.content,
        options: q.options.map((opt) => ({
          ...(opt.id && { id: opt.id }),
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
      await refreshQuizzes();
    } catch (err: any) {
      console.error(
        "Quizni saqlashda xatolik:",
        err.response?.data || err.message,
      );
      alert(
        `Xatolik: ${JSON.stringify(err.response?.data?.message || err.response?.data || "Kiritilgan ma'lumotlarni tekshiring")}`,
      );
    } finally {
      setSubmitting(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-sky-400" />
            <span>Quiz va Savollar Boshqaruvi</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Yangi quizlar va savollar to'plamini yaratish hamda boshqarish
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Quiz Yaratish</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Quiz Nomi</th>
                <th className="py-3 px-4">Kategoriya</th>
                <th className="py-3 px-4">Qiyinchilik</th>
                <th className="py-3 px-4">Vaqt</th>
                <th className="py-3 px-4">Savollar</th>
                <th className="py-3 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {Array.isArray(quizzes) && quizzes.map((quiz) => (
                <tr
                  key={quiz.id}
                  className="hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {quiz.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {quiz.category?.name || "Umumiy"}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs px-2.5 py-1 rounded-md font-mono bg-slate-800 text-sky-400 border border-slate-700">
                      {quiz.difficulty || "MEDIUM"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {quiz.timeLimitMinutes} min
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    {quiz.questions?.length || 0} ta
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(quiz)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-sky-400 hover:bg-slate-700 transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-6 bottom-6 left-4 right-4 max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl z-50 p-6 flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white">
                  {formData.id ? "Quizni Tahrirlash" : "Yangi Quiz Yaratish"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                id="quiz-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto py-6 space-y-6 pr-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Quiz Nomi
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Masalan: Advanced Java Concurrency"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Kategoriya ({categories.length} ta mavjud)
                    </label>
                    <select
                      value={formData.categoryId ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          categoryId: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    >
                      {categories.length === 0 ? (
                        <option value="" disabled>
                          Kategoriyalar yuklanmadi yoki mavjud emas
                        </option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Qiyinchilik Darajasi
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value as
                            | "EASY"
                            | "MEDIUM"
                            | "HARD",
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="EASY">Oson (Easy)</option>
                      <option value="MEDIUM">O'rta (Medium)</option>
                      <option value="HARD">Qiyin (Hard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Vaqt Chegarasi (Daqiqa)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      required
                      value={formData.timeLimitMinutes}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          timeLimitMinutes: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      O'tish Balli (%)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={formData.passingScore}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passingScore: Number(e.target.value),
                        })
                      }
                      placeholder="Masalan: 60"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tavsif (Description)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Quiz haqida qisqacha ma'lumot..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <hr className="border-slate-800" />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-sky-400" />
                      <span>
                        Savollar Ro'yxati ({formData.questions.length})
                      </span>
                    </h3>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Savol Qo'shish</span>
                    </button>
                  </div>

                  {formData.questions.map((question, qIdx) => (
                    <div
                      key={qIdx}
                      className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-sky-400">
                          #{qIdx + 1}-Savol
                        </span>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Savol matnini kiriting..."
                        value={question.content}
                        onChange={(e) => {
                          const updated = [...formData.questions];
                          updated[qIdx].content = e.target.value;
                          setFormData({ ...formData, questions: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {question.options.map((option, oIdx) => (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-2 border p-2.5 rounded-xl transition-colors ${
                              option.isCorrect
                                ? "border-emerald-500/50 bg-emerald-500/5"
                                : "border-slate-800 bg-slate-900"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-opt-${qIdx}`}
                              checked={option.isCorrect}
                              onChange={() =>
                                handleSelectCorrectOption(qIdx, oIdx)
                              }
                              className="accent-emerald-500 w-4 h-4 cursor-pointer"
                            />
                            <input
                              type="text"
                              required
                              placeholder={`Variant ${oIdx + 1}`}
                              value={option.optionText}
                              onChange={(e) => {
                                const updated = [...formData.questions];
                                updated[qIdx].options[oIdx].optionText =
                                  e.target.value;
                                setFormData({
                                  ...formData,
                                  questions: updated,
                                });
                              }}
                              className="w-full bg-transparent text-xs text-white focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </form>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Bekor Qilish
                </button>

                <button
                  type="submit"
                  form="quiz-form"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? "Saqlanmoqda..." : "Saqlash"}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
