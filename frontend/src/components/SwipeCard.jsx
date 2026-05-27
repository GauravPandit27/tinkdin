import { useState } from 'react';
import { X, Heart, Briefcase, Mail, Phone, Link, CheckCircle2 } from 'lucide-react';

export default function SwipeCard({ candidateData, onPass, onShortlist, total, currentIdx }) {
  const [animation, setAnimation] = useState('');
  const score = candidateData.scorecard.match_score || 0;
  
  let scoreClass = 'score-low';
  if (score >= 80) scoreClass = 'score-high';
  else if (score >= 60) scoreClass = 'score-med';

  const handlePass = () => {
    setAnimation('slide-out-left');
    setTimeout(() => {
      onPass();
      setAnimation('');
    }, 350);
  };

  const handleShortlist = () => {
    setAnimation('slide-out-right');
    setTimeout(() => {
      onShortlist();
      setAnimation('');
    }, 350);
  };

  const { scorecard, github_stats } = candidateData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ color: 'var(--text-secondary)' }}>
          🔍 Candidate {currentIdx + 1} of {total}
        </h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-pass" onClick={handlePass}>
            <X size={20} /> Pass
          </button>
          <button className="btn btn-shortlist" onClick={handleShortlist} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success)', color: 'var(--success)' }}>
            <Heart size={20} /> Shortlist
          </button>
        </div>
      </div>

      <div className={`glass-panel ${animation || 'animate-fade-in'}`} style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '2rem', color: '#64B5F6' }}>{candidateData.candidate}</h2>
          <div className={`score-badge ${scoreClass}`}>
            {score}
          </div>
        </div>

        <div className="grid-3">
          {/* Column 1: AI Reasoning */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#a855f7' }}>
              🧠 AI Analysis
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              {scorecard.reasoning}
            </p>
            
            {scorecard.strengths?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '0.25rem' }}>✅ Strengths:</strong>
                <p style={{ fontSize: '0.9rem' }}>{scorecard.strengths.join(', ')}</p>
              </div>
            )}
            
            {scorecard.weaknesses?.length > 0 && (
              <div>
                <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '0.25rem' }}>❌ Weaknesses:</strong>
                <p style={{ fontSize: '0.9rem' }}>{scorecard.weaknesses.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Column 2: Skills & Experience */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#6366f1' }}>
              <Briefcase size={18} /> Skills & Experience
            </h4>
            
            {scorecard.extracted_skills?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>🛠️ Core Skills</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {scorecard.extracted_skills.map((skill, i) => (
                    <span key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.85rem', color: '#818cf8' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>⏳ Timeline</strong>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{scorecard.extracted_experience || 'N/A'}</p>
            </div>
          </div>

          {/* Column 3: Contact & Projects */}
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981' }}>
              <CheckCircle2 size={18} /> Contact & Projects
            </h4>
            
            <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--text-secondary)" /> 
                {scorecard.contact_email || <span style={{ color: 'var(--text-secondary)' }}>N/A</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--text-secondary)" /> 
                {scorecard.contact_phone || <span style={{ color: 'var(--text-secondary)' }}>N/A</span>}
              </div>
            </div>

            {github_stats && Object.keys(github_stats).length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Link size={16} /> Verified GitHub
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(github_stats).map(([url, count]) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#64B5F6', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                      📦 {count} Repos
                    </a>
                  ))}
                </div>
              </div>
            )}

            {scorecard.extracted_projects?.length > 0 && (
              <div>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>📂 Key Projects</strong>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {scorecard.extracted_projects.slice(0, 3).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
        </div>
      </div>
      
      {/* Absolute floating action buttons for mobile or just extra flair */}
      <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1rem', zIndex: 10 }}>
        <button 
          onClick={handlePass}
          style={{ width: '64px', height: '64px', borderRadius: '50%', border: 'none', background: 'var(--danger)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(239,68,68,0.4)', transition: 'transform 0.2s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <X size={32} />
        </button>
        <button 
          onClick={handleShortlist}
          style={{ width: '64px', height: '64px', borderRadius: '50%', border: 'none', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(16,185,129,0.4)', transition: 'transform 0.2s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={32} />
        </button>
      </div>
    </div>
  );
}
