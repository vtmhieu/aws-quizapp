import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getQuizHistory, getIncorrectQuestionIds } from '../services/progressService';
import type { QuizHistoryEntry, Question } from '../types';
import questionsData from '../data/questions.json';
import practiceExamData from '../data/practice_exam_vn.json';

interface ProgressDashboardProps {
  onStartQuiz?: (questions: Question[]) => void;
}

function ProgressDashboard({ onStartQuiz }: ProgressDashboardProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [mistakeIds, setMistakeIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Re-build all possible questions globally to map IDs to Question objects
  const allPossibleQuestions = useMemo(() => {
    const mainQs = questionsData as Question[];
    const practiceQs = practiceExamData.map((pq: any, idx: number) => ({
      ...pq,
      id: 10000 + idx,
      isMultiSelect: false,
      correctLetters: pq.answer ? [pq.answer.replace(/[^A-F]/g, '')] : [],
      answerText: pq.answer || "Answer not available in parsing",
      choices: pq.options.map((opt: string) => ({
        text: opt,
        letter: opt.charAt(0),
        isCorrect: pq.answer ? pq.answer.replace(/[^A-F]/g, '').includes(opt.charAt(0)) : false
      }))
    })) as Question[];
    return [...mainQs, ...practiceQs];
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const promises: Promise<any>[] = [getIncorrectQuestionIds(user?.uid || null)];
    if (user) {
      promises.push(getQuizHistory(user.uid));
    }

    Promise.all(promises)
      .then((results) => {
        if (!cancelled) {
          setMistakeIds(results[0]);
          if (user && results[1]) {
            setHistory(results[1]);
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  if (loading) {
    return (
      <div className="progress-section">
        <div className="dashboard__section-title">📊 Your Progress</div>
        <div className="progress-loading">Loading your history...</div>
      </div>
    );
  }

  const totalQuizzes = history.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(history.reduce((sum, h) => sum + h.percentage, 0) / totalQuizzes)
    : 0;
  const bestScore = totalQuizzes > 0
    ? Math.max(...history.map((h) => h.percentage))
    : 0;

  return (
    <div className="progress-section">
      <div className="dashboard__section-title">📊 Your Progress</div>

      {mistakeIds.length > 0 && onStartQuiz && (
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', background: 'var(--surface-light)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--accent-secondary)' }}>Pending Mistakes</h4>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)' }}>You have {mistakeIds.length} incorrectly answered questions.</p>
          </div>
          <button 
            className="quick-btn" 
            style={{ margin: 0, padding: '0.75rem 1.5rem', background: 'var(--accent-secondary)', color: 'white', borderColor: 'transparent' }}
            onClick={() => {
              const qsToQuiz = allPossibleQuestions.filter(q => mistakeIds.includes(q.id));
              onStartQuiz(qsToQuiz);
            }}
          >
            <span className="quick-btn__icon" style={{ filter: 'brightness(0) invert(1)' }}>🎯</span>
            Practice Mistakes
          </button>
        </div>
      )}

      {/* Guest View Notice */}
      {!user && (
        <div className="progress-empty" style={{ marginTop: mistakeIds.length > 0 ? '0' : '1.5rem' }}>
          Log in with Google to save your detailed quiz history and sync your mistakes across devices! 🚀
        </div>
      )}

      {/* Stats - Only logged in */}
      {user && (
        <div className="progress-stats">
          <div className="progress-stat-card">
            <div className="progress-stat-card__value">{totalQuizzes}</div>
            <div className="progress-stat-card__label">Quizzes Taken</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-card__value">{avgScore}%</div>
            <div className="progress-stat-card__label">Average Score</div>
          </div>
          <div className="progress-stat-card">
            <div className="progress-stat-card__value">{bestScore}%</div>
            <div className="progress-stat-card__label">Best Score</div>
          </div>
        </div>
      )}

      {/* Recent History - Only logged in */}
      {/* Recent History */}
      {user && history.length > 0 && (
        <div className="progress-history">
          <div className="progress-history__title">Recent Quizzes</div>
          {history.slice(0, 8).map((entry) => {
            const dateStr = new Date(entry.date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            const scoreColor = entry.percentage >= 75 ? 'var(--success)' : entry.percentage >= 50 ? 'var(--text-accent)' : 'var(--error)';

            return (
              <div key={entry.id} className="progress-history__item">
                <div className="progress-history__info">
                  <span className="progress-history__date">{dateStr}</span>
                  {entry.domain && (
                    <span className="progress-history__domain">{entry.domain}</span>
                  )}
                </div>
                <div className="progress-history__result">
                  <span style={{ color: scoreColor, fontWeight: 700 }}>
                    {entry.percentage}%
                  </span>
                  <span className="progress-history__detail">
                    {entry.correct}/{entry.totalQuestions}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {user && history.length === 0 && (
        <div className="progress-empty">
          Take your first quiz to start tracking progress! 🚀
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;
