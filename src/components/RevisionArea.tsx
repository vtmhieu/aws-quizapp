import { useState, useMemo } from 'react';
import revisionData from '../data/revision_data.json';
import servicesGlossary from '../data/services_glossary.json';
import './RevisionArea.css';

type TabType = 'keywords' | 'comparisons' | 'all-services' | 'practice';

interface RevisionAreaProps {
  onBack: () => void;
  onStartPracticeExam: () => void;
}

function RevisionArea({ onBack, onStartPracticeExam }: RevisionAreaProps) {
  const [activeTab, setActiveTab] = useState<TabType>('keywords');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Glossary state
  const [glossarySearch, setGlossarySearch] = useState('');
  const [activeGroupFilter, setActiveGroupFilter] = useState('All');

  const { keywords, comparisons } = revisionData;

  const filteredKeywords = keywords.map(cat => ({
    ...cat,
    keywords: cat.keywords.filter(k => 
      k.Keyword.toLowerCase().includes(searchTerm.toLowerCase()) || 
      k['AWS Service'].toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.keywords.length > 0);

  // Glossary filtering
  const allGroups = useMemo(() => {
    const groups = new Set(servicesGlossary.map((s: any) => s.group));
    return ['All', ...Array.from(groups)];
  }, []);

  const filteredGlossary = useMemo(() => {
    return servicesGlossary.filter((s: any) => {
      const matchSearch = s.name.toLowerCase().includes(glossarySearch.toLowerCase()) || 
                          (s.standsFor && s.standsFor.toLowerCase().includes(glossarySearch.toLowerCase()));
      const matchGroup = activeGroupFilter === 'All' || s.group === activeGroupFilter;
      return matchSearch && matchGroup;
    });
  }, [glossarySearch, activeGroupFilter]);

  return (
    <div className="revision-area fade-in">
      <div className="revision-header">
        <button onClick={onBack} className="btn-secondary">
          <span>← Back to Dashboard</span>
        </button>
        <h2>AWS SAA-C03 Quick Revision</h2>
      </div>

      <div className="revision-tabs">
        <button 
          className={`tab-btn ${activeTab === 'keywords' ? 'active' : ''}`}
          onClick={() => setActiveTab('keywords')}
        >
          🔑 Keyword Flashcards
        </button>
        <button 
          className={`tab-btn ${activeTab === 'comparisons' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparisons')}
        >
          🔀 Service Comparisons
        </button>
        <button 
          className={`tab-btn ${activeTab === 'all-services' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-services')}
        >
          📚 All Services Glossary
        </button>
        <button 
          className={`tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
        >
          📝 Practice Exam
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'keywords' && (
          <>
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search keywords or services..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="keywords-list">
              {filteredKeywords.map((cat, i) => (
                <div key={i} className="keyword-category">
                  <h3>{cat.category}</h3>
                  <div className="flashcards-grid">
                    {cat.keywords.map((k, j) => (
                      <div key={j} className="flashcard">
                        <div className="flashcard-front">
                          <strong>{k.Keyword}</strong>
                        </div>
                        <div className="flashcard-back">
                          <span className="service-name">{k['AWS Service']}</span>
                          <span className="explanation">{k.Explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'comparisons' && (
          <div className="comparisons-list">
            {comparisons.map((comp, i) => (
              <div key={i} className="comparison-card">
                <h3>{comp.title}</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Feature</th>
                        {comp.services.map((s: string, j: number) => (
                          <th key={j}>{s}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comp.features.map((f: any, j: number) => (
                        <tr key={j}>
                          <td><strong>{f.Feature}</strong></td>
                          {comp.services.map((s: string, k: number) => (
                            <td key={k}>{f[s]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'all-services' && (
          <div className="glossary-section">
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Search services by name or acronym..." 
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
              />
            </div>
            
            <div className="filter-pills">
              {allGroups.map((group, idx) => (
                <button
                  key={idx}
                  className={`pill-btn ${activeGroupFilter === group ? 'active' : ''}`}
                  onClick={() => setActiveGroupFilter(group)}
                >
                  {group}
                </button>
              ))}
            </div>

            <div className="glossary-grid">
              {filteredGlossary.map((service, idx) => (
                <div key={idx} className="glossary-card fade-in">
                  <div className="glossary-card__header">
                    <h4>{service.name}</h4>
                    <span className="glossary-card__group">{service.group}</span>
                  </div>
                  {service.standsFor && (
                    <div className="glossary-card__stands-for">
                      stands for: <em>{service.standsFor}</em>
                    </div>
                  )}
                  {service.description_en && (
                    <div className="glossary-card__desc-en" style={{ marginTop: '0.5rem', fontWeight: 500 }}>
                      {service.description_en}
                    </div>
                  )}
                  {service.key_feature && (
                    <div className="glossary-card__feature" style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.2rem' }}>✨</span>
                      <div>
                        <strong>Key Feature:</strong> {service.key_feature}
                      </div>
                    </div>
                  )}
                  {service.description ? (
                    <div className="glossary-card__desc">
                      {service.description.length > 200 
                        ? service.description.substring(0, 200) + '...'
                        : service.description}
                    </div>
                  ) : (
                    <div className="glossary-card__desc" style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                      Local description not found.
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {filteredGlossary.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                No services found matching your criteria.
              </div>
            )}
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="practice-exam-intro">
            <h3>Start the Practice Exam</h3>
            <p>This is a full 65-question practice exam mapped to the SAA-C03 domains.</p>
            <div className="practice-actions">
              <button onClick={onStartPracticeExam} className="btn-primary">
                Start Exam (130 mins)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RevisionArea;
