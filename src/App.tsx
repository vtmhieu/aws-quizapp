import { useState, useCallback } from 'react';
import questionsData from './data/questions.json';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import QuizResult from './components/QuizResult';
import RevisionArea from './components/RevisionArea';
import type { Question, ViewType } from './types';
import './index.css';

import practiceExamData from './data/practice_exam_vn.json';

const allQuestions: Question[] = questionsData as Question[];

function AppContent() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewType>('dashboard');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [finalAnswers, setFinalAnswers] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [finalSelections, setFinalSelections] = useState<Record<number, string[]>>({});
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleStartQuiz = useCallback((questions: Question[]) => {
    setQuizQuestions(questions);
    setFinalAnswers({});
    setFinalSelections({});
    setView('quiz');
    window.scrollTo(0, 0);
  }, []);

  const handleFinishQuiz = useCallback((
    answers: Record<number, 'correct' | 'incorrect'>,
    selections: Record<number, string[]>
  ) => {
    setFinalAnswers(answers);
    setFinalSelections(selections);
    setView('results');
    window.scrollTo(0, 0);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setView('dashboard');
    window.scrollTo(0, 0);
  }, []);

  const handleStartRevision = useCallback(() => {
    setView('revision');
    window.scrollTo(0, 0);
  }, []);

  const handleStartPracticeExam = useCallback(() => {
    // Map practice questions to our Question interface
    const pQs: Question[] = practiceExamData.map((pq: any, idx: number) => ({
      ...pq,
      id: 10000 + idx, // offset ID to avoid conflict
      isMultiSelect: false,
      correctLetters: pq.answer ? [pq.answer.replace(/[^A-F]/g, '')] : [],
      answerText: pq.answer || "Answer not available in parsing",
      choices: pq.options.map((opt: string) => ({
        text: opt,
        letter: opt.charAt(0),
        isCorrect: pq.answer ? pq.answer.replace(/[^A-F]/g, '').includes(opt.charAt(0)) : false
      }))
    }));
    setQuizQuestions(pQs);
    setFinalAnswers({});
    setFinalSelections({});
    setView('quiz');
    window.scrollTo(0, 0);
  }, []);

  const handleRetry = useCallback(() => {
    setFinalAnswers({});
    setFinalSelections({});
    setView('quiz');
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header__top-row">
          <div className="app-header__logo">
            <div className="app-header__icon">☁️</div>
            <h1 className="app-header__title">AWS Quiz Pro</h1>
          </div>
          <UserMenu onSignInClick={() => setShowAuthModal(true)} />
        </div>
        <p className="app-header__subtitle">
          Solutions Architect Associate (SAA-C03) — {allQuestions.length} Practice Questions
        </p>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Views */}
      {view === 'dashboard' && (
        <Dashboard 
          questions={allQuestions} 
          onStartQuiz={handleStartQuiz} 
          onOpenRevision={handleStartRevision} 
        />
      )}

      {view === 'revision' && (
        <RevisionArea 
          onBack={handleBackToDashboard}
          onStartPracticeExam={handleStartPracticeExam}
        />
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
          userSelections={finalSelections}
          onBackToDashboard={handleBackToDashboard}
          onRetry={handleRetry}
          userId={user?.uid || null}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
