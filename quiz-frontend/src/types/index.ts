export interface User {
  id?: number;
  username: string;
  email?: string;
  fullName?: string;
  role: 'USER' | 'ADMIN';
  totalScore?: number;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  id?: number;
  username: string;
  email?: string;
  fullName?: string;
  role: 'USER' | 'ADMIN';
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  parentId?: number;
}

export interface Option {
  id: number;
  optionText: string;
  isCorrect?: boolean;
}

export interface Question {
  id: number;
  content: string;
  codeSnippet?: string;
  points: number;
  options: Option[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitMinutes: number;
  passingScore: number;
  category: Category;
  questionsCount?: number;
  questions?: Question[];
}

export interface SubmitQuizPayload {
  quizId: number;
  timeTakenSeconds: number;
  answers: Record<number, number>; // questionId -> selectedOptionId
}

export interface QuizResult {
  id: number;
  resultId?: number;
  quizId?: number;
  quizTitle?: string;
  categoryName?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenSeconds: number;
  timeSpentSeconds?: number;
  isPassed: boolean;
  passed?: boolean;
  percentage?: number;
  completedAt: string;
}

export interface QuizResultHistory {
  id: number;
  quizId?: number;
  quizTitle: string;
  categoryName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  passed: boolean;
  isPassed?: boolean;
  completedAt: string;
  timeSpentSeconds: number;
  timeTakenSeconds?: number;
}

export interface UserStats {
  username?: string;
  fullName?: string;
  totalScore?: number;
  averageScore?: number;
  totalQuizzesCompleted?: number;
  totalQuizzesTaken?: number;
  passedQuizzes?: number;
  accuracyPercentage?: number;
  averageTimeTakenSeconds?: number;
  totalTimeSpentMinutes?: number;
  scoreHistory?: { date: string; score: number }[];
  categoryPerformance?: { category: string; score: number }[];
  recentResults?: {
    id: number;
    quizTitle: string;
    score: number;
    isPassed: boolean;
    date: string;
  }[];
}

export interface LeaderboardUser {
  userId?: number;
  rank: number;
  username: string;
  fullName: string;
  score: number;
  totalQuizzesTaken?: number;
}
