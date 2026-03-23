import { useState, useCallback } from 'react';
import questionsData from './data/questions.json';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import QuizResult from './components/QuizResult';
import type { Question, ViewType } from './types';
import './index.css';

const allQuestions: Question[] = questionsData as Question[];

function App() {
  const [view, setView] = useState<ViewType>('dashboard');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<Record<number, 'correct' | 'incorrect'>>({});

  const handleStartQuiz = useCallback((questions: Question[]) => {
    setQuizQuestions(questions);
    setFinalAnswers({});
    setView('quiz');
    window.scrollTo(0, 0);
  }, []);

  const handleFinishQuiz = useCallback((answers: Record<number, 'correct' | 'incorrect'>) => {
    setFinalAnswers(answers);
    setView('results');
    window.scrollTo(0, 0);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setView('dashboard');
    window.scrollTo(0, 0);
  }, []);

  const handleRetry = useCallback(() => {
    setFinalAnswers({});
    setView('quiz');
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__logo">
          <div className="app-header__icon">☁️</div>
          <h1 className="app-header__title">AWS Quiz Pro</h1>
        </div>
        <p className="app-header__subtitle">
          Solutions Architect Associate (SAA-C03) — {allQuestions.length} Practice Questions
        </p>
      </header>

      {/* Views */}
      {view === 'dashboard' && (
        <Dashboard questions={allQuestions} onStartQuiz={handleStartQuiz} />
      )}

      {view === 'quiz' && (
        <Quiz
          questions={quizQuestions}
          onFinish={handleFinishQuiz}
          onBack={handleBackToDashboard}
        />
      )}

      {view === 'results' && (
        <QuizResult
          questions={quizQuestions}
          answers={finalAnswers}
          onBackToDashboard={handleBackToDashboard}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}

export default App;
