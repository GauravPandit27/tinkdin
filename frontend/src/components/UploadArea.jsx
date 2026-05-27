import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileText, Type } from 'lucide-react';

export default function UploadArea({ onAnalyze }) {
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [jdMode, setJdMode] = useState('text'); // 'text' or 'file'
  const [apiKey, setApiKey] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.endsWith('.pdf') || f.name.endsWith('.docx')
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleJdFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setJdFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (jdMode === 'text' && !jdText.trim()) {
      setError('Please provide a Job Description text.');
      return;
    }
    if (jdMode === 'file' && !jdFile) {
      setError('Please upload a Job Description file.');
      return;
    }
    if (files.length === 0) {
      setError('Please upload at least one resume.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 1. Analyze JD
      setProgress(10);
      
      const jdFormData = new FormData();
      if (jdMode === 'text') {
        jdFormData.append('jd_text', jdText);
      } else {
        jdFormData.append('jd_file', jdFile);
      }
      if (apiKey) {
        jdFormData.append('api_key', apiKey);
      }

      const jdRes = await fetch('http://localhost:8000/api/analyze-jd', {
        method: 'POST',
        body: jdFormData,
      });

      if (!jdRes.ok) {
        throw new Error(await jdRes.text());
      }
      
      const { jd_analysis } = await jdRes.json();
      setProgress(30);

      // 2. Process Resumes
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('jd_analysis', JSON.stringify(jd_analysis));
        if (apiKey) formData.append('api_key', apiKey);

        const resRes = await fetch('http://localhost:8000/api/process-resume', {
          method: 'POST',
          body: formData,
        });

        if (!resRes.ok) {
          console.error(`Failed to process ${file.name}`);
        } else {
          const result = await resRes.json();
          results.push({ ...result, fileObj: file });
        }
        setProgress(30 + Math.floor(((i + 1) / files.length) * 70));
      }

      results.sort((a, b) => (b.scorecard.match_score || 0) - (a.scorecard.match_score || 0));
      onAnalyze(results);

    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong during analysis.');
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔥 Tinkdin</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Upload a Job Description and Resumes to find your perfect match.</p>
      </div>

      {error && (
        <div className="glass-panel" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'var(--danger)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle color="var(--danger)" />
          <span style={{ color: 'var(--danger)' }}>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Groq API Key (Optional if set in .env)</label>
          <input 
            type="password" 
            placeholder="gsk_... (leave blank to use .env)" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: '500' }}>Job Description</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setJdMode('text')} 
                style={{ padding: '0.3rem 0.8rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: jdMode === 'text' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', color: jdMode === 'text' ? '#818cf8' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Type size={14} /> Text
              </button>
              <button 
                onClick={() => setJdMode('file')} 
                style={{ padding: '0.3rem 0.8rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: jdMode === 'file' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', color: jdMode === 'file' ? '#818cf8' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <FileText size={14} /> File
              </button>
            </div>
          </div>
          
          {jdMode === 'text' ? (
            <textarea 
              rows="6" 
              placeholder="Paste Job Description here..." 
              value={jdText} 
              onChange={(e) => setJdText(e.target.value)}
            />
          ) : (
            <div 
              className="upload-zone" 
              style={{ padding: '2rem 1rem' }}
              onClick={() => jdFileInputRef.current?.click()}
            >
              <FileText size={32} color="var(--text-secondary)" style={{ margin: '0 auto 0.5rem' }} />
              {jdFile ? (
                <p style={{ color: '#818cf8', fontWeight: '500' }}>{jdFile.name}</p>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>Click to upload JD (PDF or DOCX)</p>
              )}
              <input 
                type="file" 
                accept=".pdf,.docx" 
                ref={jdFileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleJdFileSelect}
              />
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Candidate Resumes (PDF, DOCX)</label>
          <div 
            className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
            <h3>Drag & drop resumes here</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>or click to browse files</p>
            <input 
              type="file" 
              multiple 
              accept=".pdf,.docx" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileSelect}
            />
          </div>
          
          {files.length > 0 && (
            <div style={{ marginTop: '1rem' }} className="grid-3">
              {files.map((f, i) => (
                <div key={i} className="glass-panel" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>{f.name}</span>
                  <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing... {progress > 0 && `${progress}%`}
            </>
          ) : (
            <>🚀 Analyze Candidates</>
          )}
        </button>
        
        {/* Simple inline spin animation for the loader since we don't have Tailwind */}
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}
