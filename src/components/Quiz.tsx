import { useState } from 'react';
import type { Question } from '../types';

interface QuizProps {
  questions: Question[];
  onFinish: (answers: Record<number, 'correct' | 'incorrect'>) => void;
  onBack: () => void;
}

function Quiz({ questions, onFinish, onBack }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isRevealed = revealed[question.id] ?? false;
  const hasAnswered = question.id in answers;

  const correctCount = Object.values(answers).filter((a) => a === 'correct').length;
  const answeredCount = Object.keys(answers).length;

  const handleReveal = () => {
    setRevealed((prev) => ({ ...prev, [question.id]: true }));
  };

  const handleSelfAssess = (result: 'correct' | 'incorrect') => {
    setAnswers((prev) => ({ ...prev, [question.id]: result }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    onFinish(answers);
  };

  const isLast = currentIndex === questions.length - 1;

  return (
    <div className="quiz">
      {/* Header */}
      <div className="quiz-header">
        <button className="quiz-header__back" onClick={onBack}>
          ← Exit
        </button>
        <div className="quiz-header__info">
          <div className="quiz-header__counter">
            {currentIndex + 1} / {questions.length}
          </div>
          {answeredCount > 0 && (
            <div className="quiz-header__score">
              {correctCount}/{answeredCount} correct
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="question-card" key={question.id}>
        <div className="question-card__number">Question #{question.id}</div>
        <div className="question-card__text">{question.question}</div>
        {question.isMultiSelect && (
          <div className="question-card__multi-badge">
            Multiple answers required
          </div>
        )}

        {/* Answer Area */}
        <div className="answer-section">
          {!isRevealed ? (
            <button className="reveal-btn" onClick={handleReveal}>
              Reveal Answer
            </button>
          ) : (
            <div className="answer-reveal">
              <div className="answer-reveal__header">Correct Answer</div>
              <div className="answer-reveal__answer">{question.answer}</div>

              {question.explanation && (
                <>
                  <div className="answer-reveal__explanation-label">
                    Explanation
                  </div>
                  <div className="answer-reveal__explanation">
                    {question.explanation}
                  </div>
                </>
              )}

              {!hasAnswered && (
                <>
                  <div
                    className="self-assess__label"
                    style={{ marginTop: '1rem' }}
                  >
                    Did you know this?
                  </div>
                  <div className="self-assess">
                    <button
                      className="self-assess__btn self-assess__btn--correct"
                      onClick={() => handleSelfAssess('correct')}
                    >
                      ✓ I knew it
                    </button>
                    <button
                      className="self-assess__btn self-assess__btn--incorrect"
                      onClick={() => handleSelfAssess('incorrect')}
                    >
                      ✗ I didn't know
                    </button>
                  </div>
                </>
              )}

              {hasAnswered && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    ...(answers[question.id] === 'correct'
                      ? {
                          background: 'var(--success-bg)',
                          color: 'var(--success)',
                          border: '1px solid var(--success-border)',
                        }
                      : {
                          background: 'var(--error-bg)',
                          color: 'var(--error)',
                          border: '1px solid var(--error-border)',
                        }),
                  }}
                >
                  {answers[question.id] === 'correct'
                    ? '✓ Marked as known'
                    : '✗ Marked for review'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-nav">
        {currentIndex > 0 && (
          <button className="nav-btn nav-btn--prev" onClick={handlePrev}>
            ← Previous
          </button>
        )}

        {!isLast ? (
          <button
            className="nav-btn nav-btn--next"
            onClick={handleNext}
            disabled={!isRevealed}
          >
            Next →
          </button>
        ) : (
          <button className="nav-btn nav-btn--finish" onClick={handleFinish}>
            Finish Quiz 🏁
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;
