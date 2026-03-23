import { useState } from 'react';
import type { Question } from '../types';

interface QuizResultProps {
  questions: Question[];
  answers: Record<number, 'correct' | 'incorrect'>;
  userSelections: Record<number, string[]>;
  onBackToDashboard: () => void;
  onRetry: () => void;
}

function QuizResult({ questions, answers, userSelections, onBackToDashboard, onRetry }: QuizResultProps) {
  const [showReview, setShowReview] = useState(false);

  const total = questions.length;
  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter((a) => a === 'correct').length;
  const incorrect = answered - correct;
  const unanswered = total - answered;
  const percentage = answered > 0 ? Math.round((correct / answered) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { emoji: '🏆', text: 'Outstanding!' };
    if (percentage >= 75) return { emoji: '🌟', text: 'Great Job!' };
    if (percentage >= 60) return { emoji: '💪', text: 'Good Effort!' };
    if (percentage >= 40) return { emoji: '📚', text: 'Keep Studying!' };
    return { emoji: '🔄', text: 'More Practice Needed' };
  };

  const grade = getGrade();

  const incorrectQuestions = questions.filter(
    (q) => answers[q.id] === 'incorrect'
  );

  return (
    <div className="results">
      {/* Score Circle */}
      <div className="results__score-circle">
        <div className="results__score-value">{percentage}%</div>
        <div className="results__score-label">{grade.emoji}</div>
      </div>

      <h2 className="results__title">{grade.text}</h2>
      <p className="results__subtitle">
        You completed {answered} of {total} questions
        {unanswered > 0 && ` (${unanswered} skipped)`}
      </p>

      {/* Stats */}
      <div className="results__stats">
        <div className="results__stat">
          <div className="results__stat-value results__stat-value--correct">
            {correct}
          </div>
          <div className="results__stat-label">Correct</div>
        </div>
        <div className="results__stat">
          <div className="results__stat-value results__stat-value--incorrect">
            {incorrect}
          </div>
          <div className="results__stat-label">Incorrect</div>
        </div>
        <div className="results__stat">
          <div className="results__stat-value results__stat-value--total">
            {total}
          </div>
          <div className="results__stat-label">Total</div>
        </div>
      </div>

      {/* Actions */}
      <div className="results__actions">
        <button
          className="results__btn results__btn--primary"
          onClick={onBackToDashboard}
        >
          Back to Dashboard
        </button>
        <button className="results__btn results__btn--secondary" onClick={onRetry}>
          Retry Same Set
        </button>
        {incorrectQuestions.length > 0 && (
          <button
            className="results__btn results__btn--secondary"
            onClick={() => setShowReview(!showReview)}
          >
            {showReview ? 'Hide' : 'Review'} Missed ({incorrectQuestions.length})
          </button>
        )}
      </div>

      {/* Review List */}
      {showReview && (
        <div className="review-list">
          {incorrectQuestions.map((q) => (
            <div key={q.id} className="review-item review-item--incorrect">
              <div className="review-item__question">
                <strong>Q{q.id}:</strong> {q.question}
              </div>
              
              {q.choices && q.choices.length > 0 ? (
                <>
                  <div className="review-item__selection">
                    <span className="review-item__label">Your selection: </span>
                    <span className="review-item__value-wrong" style={{color: 'var(--error)'}}>
                      {userSelections[q.id]?.length > 0 ? userSelections[q.id].join(', ') : 'None'}
                    </span>
                  </div>
                  <div className="review-item__selection">
                    <span className="review-item__label">Correct answer: </span>
                    <span className="review-item__value-correct" style={{color: 'var(--success)', fontWeight: 'bold'}}>
                      {q.correctLetters?.join(', ') || 'Unknown'}
                    </span>
                  </div>
                  <div className="review-item__answer" style={{marginTop: '0.75rem'}}>
                    {q.choices.filter(c => q.correctLetters?.includes(c.letter) || c.isCorrect).map(c => (
                      <div key={c.letter}><strong>{c.letter}:</strong> {c.text}</div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="review-item__answer">{q.answerText || 'Auto-scoring not available'}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizResult;
