import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getQuizHistory } from '../services/progressService';
import type { QuizHistoryEntry } from '../types';

function ProgressDashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoading(true);

    getQuizHistory(user.uid)
      .then((entries) => {
        if (!cancelled) setHistory(entries);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

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

      {/* Stats */}
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

      {/* Recent History */}
      {history.length > 0 && (
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

      {history.length === 0 && (
        <div className="progress-empty">
          Take your first quiz to start tracking progress! 🚀
        </div>
      )}
    </div>
  );
}

export default ProgressDashboard;
