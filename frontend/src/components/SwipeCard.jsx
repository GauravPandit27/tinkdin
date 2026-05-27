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
      <div className="nav-strip">
        <h3 style={{ color: 'var(--text-2)', fontSize: '1rem', fontWeight: '500' }}>
          Evaluation {currentIdx + 1} of {total}
        </h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={handlePass}>
            <X size={16} /> Skip
          </button>
          <button className="btn btn-success" onClick={handleShortlist}>
            <Heart size={16} /> Shortlist
          </button>
        </div>
      </div>

      <div className={`panel animate-up ${animation}`} style={{ flex: 1, padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem' }} className="divider-bottom">
          <h2 className="candidate-name">{candidateData.candidate}</h2>
          <div className={`score-ring ${scoreClass}`}>
            {score}
          </div>
        </div>

        <div className="grid-3" style={{ alignItems: 'start' }}>
          {/* Column 1: AI Reasoning */}
          <div>
            <h4 className="section-title section-title-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Analysis Output
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', color: 'var(--text-1)' }}>
              {scorecard.reasoning}
            </p>
            {scorecard.strengths?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="field-label" style={{ color: 'var(--success)' }}>Strengths</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-1)' }}>{scorecard.strengths.join(', ')}</p>
              </div>
            )}
            
            {scorecard.weaknesses?.length > 0 && (
              <div>
                <span className="field-label" style={{ color: 'var(--danger)' }}>Limitations</span>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-1)' }}>{scorecard.weaknesses.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Column 2: Skills & Experience */}
          <div>
            <h4 className="section-title section-title-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={14} /> Background
            </h4>
            
            {scorecard.extracted_skills?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="field-label">Core Skills</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {scorecard.extracted_skills.map((skill, i) => (
                    <span key={i} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <span className="field-label">Timeline</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-1)' }}>{scorecard.extracted_experience || 'N/A'}</p>
            </div>
          </div>

          {/* Column 3: Contact & Projects */}
          <div>
            <h4 className="section-title section-title-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={14} /> Identity & Links
            </h4>
            
            <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="info-row">
                <Mail size={14} /> 
                <span>{scorecard.contact_email || 'N/A'}</span>
              </div>
              <div className="info-row">
                <Phone size={14} /> 
                <span>{scorecard.contact_phone || 'N/A'}</span>
              </div>
              {candidateData.all_links?.find(l => l.includes('linkedin.com')) && (
                <div className="info-row">
                  <Link size={14} color="#60A5FA" />
                  <a href={candidateData.all_links.find(l => l.includes('linkedin.com'))} target="_blank" rel="noopener noreferrer" style={{color: '#60A5FA', textDecoration: 'none', fontSize: '0.85rem'}}>LinkedIn Profile</a>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Link size={12} /> Verified GitHub
              </span>
              {github_stats && Object.keys(github_stats).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(github_stats).map(([url, count]) => {
                    const username = url.replace('https://github.com/', '').replace('http://github.com/', '').split('/')[0];
                    return (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="github-chip">
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {username || 'GitHub Profile'}
                        </span>
                        <span style={{ color: 'var(--text-2)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          {count} Repos
                        </span>
                      </a>
                    );
                  })}
                </div>
              ) : (
                <div className="info-row" style={{ fontStyle: 'italic', color: 'var(--text-3)' }}>
                  No GitHub profile found
                </div>
              )}
            </div>

            {scorecard.extracted_projects?.length > 0 && (
              <div>
                <span className="field-label">Key Projects</span>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-1)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {scorecard.extracted_projects.slice(0, 3).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
        </div>
      </div>
      
      <div className="fab-strip" style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10, border: 'none', padding: 0 }}>
        <button className="fab-btn" onClick={handlePass}>
          <div className="fab-circle fab-circle-danger">
            <X size={24} />
          </div>
        </button>
        <button className="fab-btn" onClick={handleShortlist}>
          <div className="fab-circle fab-circle-success">
            <Heart size={24} />
          </div>
        </button>
      </div>
    </div>
  );
}
