import { useState, useMemo } from 'react';
import type { Question } from '../types';
import revisionData from '../data/revision_data.json';

interface QuizProps {
  questions: Question[];
  onFinish: (
    answers: Record<number, 'correct' | 'incorrect'>,
    selections: Record<number, string[]>
  ) => void;
  onBack: () => void;
}

function Quiz({ questions, onFinish, onBack }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track correctness of each question
  const [answers, setAnswers] = useState<Record<number, 'correct' | 'incorrect'>>({});
  // Track user selected letters for each question
  const [userSelections, setUserSelections] = useState<Record<number, string[]>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});

  const question = questions[currentIndex];

  // Prepare flat vocabulary of keywords for matching
  const allKeywords = useMemo(() => {
    return revisionData.keywords.flatMap(cat => cat.keywords.map(k => ({
      keywordText: k.Keyword.replace(/"/g, '').toLowerCase(),
      service: k['AWS Service'],
      explanation: k.Explanation,
      category: cat.category
    })));
  }, []);

  // Check if current question has any keywords
  const matchedHints = useMemo(() => {
    if (!question) return [];
    const qText = question.question.toLowerCase();
    return allKeywords.filter(k => qText.includes(k.keywordText));
  }, [question, allKeywords]);
  // Calculate progress relative to answered questions instead of currentIndex
  const progress = (Object.keys(answers).length / questions.length) * 100;
  
  const isRevealed = revealed[question.id] ?? false;
  
  // A question counts as answered once it's revealed and scored
  
  const answeredCount = Object.keys(answers).length;

  const currentSelections = userSelections[question.id] || [];
  
  // Calculate if the selected options exactly match the correct options
  const isSelectionCorrect = () => {
    if (!question.correctLetters || question.correctLetters.length === 0) return false;
    
    // Sort to compare arrays safely
    const selected = [...currentSelections].sort();
    const correct = [...question.correctLetters].sort();
    
    if (selected.length !== correct.length) return false;
    
    for (let i = 0; i < selected.length; i++) {
        if (selected[i] !== correct[i]) return false;
    }
    return true;
  };

  const handleToggleOption = (letter: string) => {
    if (isRevealed) return; // Disallow changes after reveal

    setUserSelections((prev) => {
      const prevSelections = prev[question.id] || [];
      let newSelections;

      if (question.isMultiSelect) {
        if (prevSelections.includes(letter)) {
          newSelections = prevSelections.filter((l) => l !== letter);
        } else {
          newSelections = [...prevSelections, letter];
        }
      } else {
        // Single select
        newSelections = [letter];
      }

      return { ...prev, [question.id]: newSelections };
    });
  };

  const handleReveal = () => {
    setRevealed((prev) => ({ ...prev, [question.id]: true }));
    // Hide hint if revealed
    setShowHint((prev) => ({ ...prev, [question.id]: false }));
    
    // Auto-score based on selections if there are correct letters data
    if (question.correctLetters && question.correctLetters.length > 0) {
      const result = isSelectionCorrect() ? 'correct' : 'incorrect';
      setAnswers((prev) => ({ ...prev, [question.id]: result }));
    }
  };

  const handleSelfAssess = (result: 'correct' | 'incorrect') => {
    setAnswers((prev) => ({ ...prev, [question.id]: result }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowHint((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowHint((prev) => ({ ...prev, [question.id]: false }));
    }
  };

  const handleFinish = () => {
    onFinish(answers, userSelections);
  };

  const isLast = currentIndex === questions.length - 1;

  // Render option choice buttons
  const renderChoices = () => {
    if (!question.choices || question.choices.length === 0) return null;

    return (
      <div className="choices">
        {question.choices.map((choice) => {
          const isSelected = currentSelections.includes(choice.letter);
          const isCorrectChoice = question.correctLetters?.includes(choice.letter) || choice.isCorrect;
          
          let choiceClass = "choice-item";
          
          if (isSelected) choiceClass += " choice-item--selected";
          
          if (isRevealed) {
            if (isCorrectChoice) {
              choiceClass += " choice-item--correct-answer";
            } else if (isSelected && !isCorrectChoice) {
              choiceClass += " choice-item--wrong-selection";
            }
          }

          return (
            <div 
              key={choice.letter} 
              className={choiceClass}
              onClick={() => handleToggleOption(choice.letter)}
            >
              <div className="choice-item__letter">{choice.letter}</div>
              <div className="choice-item__text">{choice.text}</div>
              {isRevealed && isCorrectChoice && <div className="choice-item__icon">✓</div>}
              {isRevealed && isSelected && !isCorrectChoice && <div className="choice-item__icon">✗</div>}
            </div>
          );
        })}
      </div>
    );
  };

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
          <div className="quiz-header__score" style={{color: 'var(--text-secondary)'}}>
             Answered: {answeredCount}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="question-card" key={question.id}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div className="question-card__number">Question #{question.id}</div>
          {question.domain && (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              padding: '0.25rem 0.5rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)'
            }}>
              {question.domain}
            </div>
          )}
        </div>
        <div className="question-card__text">{question.question}</div>
        
        {question.isMultiSelect && (
          <div className="question-card__multi-badge">
            Multiple answers required
          </div>
        )}

        {/* Keyword Hints */}
        {!isRevealed && matchedHints.length > 0 && (
          <div className="quiz-hints" style={{ marginTop: '1rem', marginBottom: '1rem', padding: '1rem', borderRadius: '8px', background: 'var(--surface-light)', borderLeft: '3px solid var(--accent-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>💡 Keyword Hint Available</span>
              <button 
                onClick={() => setShowHint(prev => ({ ...prev, [question.id]: !prev[question.id] }))}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {showHint[question.id] ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {showHint[question.id] && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {matchedHints.map((hint, idx) => (
                  <div key={idx} style={{ padding: '0.5rem', background: 'var(--bg)', borderRadius: '4px', border: '1px dashed var(--border)' }}>
                    <div><strong>Keyword:</strong> "{hint.keywordText}"</div>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.25rem' }}>{hint.service}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{hint.explanation}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dynamic Multi-choice Options */}
        {renderChoices()}

        {/* Answer Section */}
        <div className="answer-section">
          {!isRevealed ? (
            <button 
                className="reveal-btn" 
                onClick={handleReveal}
                disabled={currentSelections.length === 0}
            >
              Check Answer
            </button>
          ) : (
            <div className="answer-reveal">
              <div className="answer-reveal__header">Feedback</div>
              
              <div style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: answers[question.id] === 'correct' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${answers[question.id] === 'correct' ? 'var(--success)' : 'var(--error)'}`,
                  color: answers[question.id] === 'correct' ? 'var(--success)' : 'var(--error)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
              }}>
                 {answers[question.id] === 'correct' ? "✓ Correct!" : "✗ Incorrect"}
              </div>

              {(!question.choices || question.choices.length === 0) && (
                <div className="answer-reveal__answer">{question.answerText}</div>
              )}

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
              
              {/* Fallback self assess if scoring failed for some reason */}
              {(!question.correctLetters || question.correctLetters.length === 0) && (
                <>
                  <div className="self-assess__label" style={{ marginTop: '1rem' }}>
                    Auto-scoring unavailable. Were you correct?
                  </div>
                  <div className="self-assess">
                    <button
                      className={`self-assess__btn self-assess__btn--correct ${answers[question.id] === 'correct' ? 'active' : ''}`}
                      onClick={() => handleSelfAssess('correct')}
                      style={answers[question.id] === 'correct' ? {background: 'var(--success)', color: 'white'} : {}}
                    >
                      ✓ Correct
                    </button>
                    <button
                      className={`self-assess__btn self-assess__btn--incorrect ${answers[question.id] === 'incorrect' ? 'active' : ''}`}
                      onClick={() => handleSelfAssess('incorrect')}
                    >
                      ✗ Incorrect
                    </button>
                  </div>
                </>
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
          <button className="nav-btn nav-btn--finish" onClick={handleFinish} disabled={!isRevealed}>
            Finish Quiz 🏁
          </button>
        )}
      </div>
    </div>
  );
}

export default Quiz;
