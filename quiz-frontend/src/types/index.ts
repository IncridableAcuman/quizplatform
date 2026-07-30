export interface User {
  username: string;
  email?: string;
  fullName?: string;
  role: 'USER' | 'ADMIN';
  totalScore?: number;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  role: 'USER' | 'ADMIN';
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  iconUrl?: string;
  parentCategory?: Category;
  subCategories?: Category[];
}

export interface Option {
  id: number;
  optionText: string;
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
  questions?: Question[];
}

export interface SubmitQuizPayload {
  quizId: number;
  timeTakenSeconds: number;
  answers: Record<number, number>; // questionId -> selectedOptionId
}

export interface QuizResult {
  id: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenSeconds: number;
  isPassed: boolean;
  completedAt: string;
}