export interface Question {
  id: number;
  question: string;
  answer: string;
  explanation: string;
  isMultiSelect: boolean;
}

export type ViewType = 'dashboard' | 'quiz' | 'results';

export interface QuizState {
  currentView: ViewType;
  quizQuestions: Question[];
  currentIndex: number;
  answers: Record<number, 'correct' | 'incorrect'>;
  revealed: Record<number, boolean>;
}
