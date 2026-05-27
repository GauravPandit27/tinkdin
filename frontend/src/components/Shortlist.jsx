import { Download, RefreshCw, Mail, Phone } from 'lucide-react';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💚 Final Shortlist</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here are the candidates you shortlisted. Review their info and download their resumes.</p>
        </div>
        <button className="btn btn-primary" onClick={onStartOver}>
          <RefreshCw size={18} /> Start Over
        </button>
      </div>

      {shortlisted.length === 0 ? (
        <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <h2>No candidates were shortlisted.</h2>
        </div>
      ) : (
        <div className="grid-2" style={{ overflowY: 'auto', paddingBottom: '2rem' }}>
          {shortlisted.map((res, i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#64B5F6', fontSize: '1.5rem' }}>{res.candidate}</h3>
                  <div className="score-badge score-high" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                    {res.scorecard.match_score}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} /> {res.scorecard.contact_email || 'N/A'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} /> {res.scorecard.contact_phone || 'N/A'}
                  </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Top Skills:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(res.scorecard.extracted_skills || []).slice(0, 5).map((skill, i) => (
                      <span key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.8rem', color: '#818cf8' }}>
                        {skill}
                      </span>
                    ))}
                    {(res.scorecard.extracted_skills?.length > 5) && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', alignSelf: 'center' }}>+ more</span>}
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleDownload(res)}>
                <Download size={18} /> Download Resume
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
