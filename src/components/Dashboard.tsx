import type { Question } from '../types';

interface DashboardProps {
  questions: Question[];
  onStartQuiz: (questions: Question[]) => void;
}

function Dashboard({ questions, onStartQuiz }: DashboardProps) {
  const totalQuestions = questions.length;
  const setsOf50 = Math.ceil(totalQuestions / 50);

  const practiceSets = Array.from({ length: setsOf50 }, (_, i) => {
    const start = i * 50;
    const end = Math.min(start + 50, totalQuestions);
    return {
      index: i,
      label: `Set ${i + 1}`,
      range: `Q${questions[start].id} – Q${questions[end - 1].id}`,
      count: end - start,
      questions: questions.slice(start, end),
    };
  });

  const startRandomQuiz = (count: number) => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    onStartQuiz(shuffled.slice(0, count));
  };

  return (
    <div className="dashboard">
      {/* Stats bar */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-card__value">{totalQuestions}</div>
          <div className="stat-card__label">Total Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{setsOf50}</div>
          <div className="stat-card__label">Practice Sets</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">SAA-C03</div>
          <div className="stat-card__label">Certification</div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="dashboard__section-title">⚡ Quick Start</div>
      <div className="dashboard__quick-actions">
        <button className="quick-btn" onClick={() => startRandomQuiz(10)}>
          <span className="quick-btn__icon">🎯</span>
          10 Questions
          <span className="quick-btn__label">Quick sprint</span>
        </button>
        <button className="quick-btn" onClick={() => startRandomQuiz(25)}>
          <span className="quick-btn__icon">📝</span>
          25 Questions
          <span className="quick-btn__label">Half session</span>
        </button>
        <button className="quick-btn" onClick={() => startRandomQuiz(50)}>
          <span className="quick-btn__icon">🏆</span>
          50 Questions
          <span className="quick-btn__label">Full session</span>
        </button>
        <button className="quick-btn" onClick={() => startRandomQuiz(65)}>
          <span className="quick-btn__icon">🎓</span>
          65 Questions
          <span className="quick-btn__label">Exam simulation</span>
        </button>
      </div>

      {/* Domains */}
      <div className="dashboard__section-title">🏢 By Domain</div>
      <div className="dashboard__sets" style={{ marginBottom: '2rem' }}>
        {['Design Secure Architectures', 'Design Resilient Architectures', 'Design High-Performing Architectures', 'Design Cost-Optimized Architectures'].map((domain) => {
          const domainQs = questions.filter(q => q.domain === domain);
          if (domainQs.length === 0) return null;
          
          return (
            <div
              key={domain}
              className="set-card"
              style={{ borderLeft: '3px solid var(--accent-primary)' }}
              onClick={() => onStartQuiz(domainQs)}
            >
              <div className="set-card__number">Domain</div>
              <div className="set-card__title" style={{ fontSize: '0.9rem' }}>{domain}</div>
              <div className="set-card__meta">{domainQs.length} questions</div>
            </div>
          );
        })}
      </div>

      {/* Practice Sets */}
      <div className="dashboard__section-title">📚 Practice Sets (All Domains)</div>
      <div className="dashboard__sets">
        {practiceSets.map((set) => (
          <div
            key={set.index}
            className="set-card"
            onClick={() => onStartQuiz(set.questions)}
          >
            <div className="set-card__number">{set.label}</div>
            <div className="set-card__title">{set.range}</div>
            <div className="set-card__meta">{set.count} questions</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
