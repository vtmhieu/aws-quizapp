export interface Choice {
  letter: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
  question: string;
  choices: Choice[];
  correctLetters: string[];
  explanation: string;
  answerText: string;
  isMultiSelect: boolean;
  domain?: string;
}

export type ViewType = 'dashboard' | 'quiz' | 'results' | 'revision';

export interface QuizHistoryEntry {
  id: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  percentage: number;
  domain?: string | null;
  date: string;
}

export interface QuizState {
  currentView: ViewType;
  quizQuestions: Question[];
  currentIndex: number;
  answers: Record<number, 'correct' | 'incorrect'>;
  userSelections: Record<number, string[]>;
  revealed: Record<number, boolean>;
}

export interface QuizState {
  currentView: ViewType;
  quizQuestions: Question[];
  currentIndex: number;
  answers: Record<number, 'correct' | 'incorrect'>;
  revealed: Record<number, boolean>;
}
