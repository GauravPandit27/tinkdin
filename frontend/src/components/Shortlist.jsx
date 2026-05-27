import { Download, RefreshCw, Mail, Phone, Flame } from 'lucide-react';

export default function Shortlist({ shortlisted, onStartOver }) {
  const handleDownload = (candidate) => {
    // We stored the fileObj in the result earlier
    const file = candidate.fileObj;
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="nav-strip" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="wordmark" style={{ fontSize: '2.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={36} color="#a855f7" strokeWidth={2.5} fill="#a855f7" style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.5))' }} /> 
            Final Shortlist
          </h1>
          <p style={{ color: 'var(--text-2)' }}>Review candidate info and download resumes.</p>
        </div>
        <button className="btn btn-ghost" onClick={onStartOver}>
          <RefreshCw size={16} /> Start Over
        </button>
      </div>

      {shortlisted.length === 0 ? (
        <div className="empty-state panel">
          <div className="empty-icon"><RefreshCw size={24} /></div>
          <h2>No candidates were shortlisted.</h2>
        </div>
      ) : (
        <div className="grid-2" style={{ overflowY: 'auto', paddingBottom: '2rem' }}>
          {shortlisted.map((res, i) => (
            <div key={i} className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h3 className="candidate-name" style={{ fontSize: '1.6rem' }}>{res.candidate}</h3>
                  <div className="score-ring score-high" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                    {res.scorecard.match_score}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
                  <div className="info-row">
                    <Mail size={14} /> <span>{res.scorecard.contact_email || 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <Phone size={14} /> <span>{res.scorecard.contact_phone || 'N/A'}</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <span className="field-label">Top Skills</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {(res.scorecard.extracted_skills || []).slice(0, 5).map((skill, i) => (
                      <span key={i} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {(res.scorecard.extracted_skills?.length > 5) && <span style={{ color: 'var(--text-3)', fontSize: '0.8rem', alignSelf: 'center' }}>+ more</span>}
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleDownload(res)}>
                <Download size={16} /> Download Resume
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
