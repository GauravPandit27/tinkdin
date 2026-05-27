import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FileText, Type, X, Flame } from 'lucide-react';

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
    <div className="panel animate-up" style={{ padding: '3rem 2.5rem', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="wordmark" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Flame size={48} color="#a855f7" strokeWidth={2.5} fill="#a855f7" style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.5))' }} /> 
          Tinkdin
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '1.05rem' }}>Upload a Job Description and Resumes to analyze fit.</p>
      </div>

      {error && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label className="field-label">API Configuration</label>
          <input 
            type="password" 
            placeholder="gsk_... (leave blank to use .env)" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label className="field-label" style={{ marginBottom: 0 }}>Job Description</label>
            <div className="tab-group">
              <button 
                onClick={() => setJdMode('text')} 
                className={`tab-btn ${jdMode === 'text' ? 'active' : ''}`}
              >
                <Type size={14} /> Text
              </button>
              <button 
                onClick={() => setJdMode('file')} 
                className={`tab-btn ${jdMode === 'file' ? 'active' : ''}`}
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
              <FileText size={36} color="var(--text-3)" style={{ margin: '0 auto 1rem' }} />
              {jdFile ? (
                <p style={{ color: 'var(--text-1)', fontWeight: '500' }}>{jdFile.name}</p>
              ) : (
                <p style={{ color: 'var(--text-2)' }}>Click to upload JD file (PDF or DOCX)</p>
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
          <label className="field-label">Candidate Resumes</label>
          <div 
            className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={40} color="var(--text-3)" style={{ margin: '0 auto 1.25rem' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-1)', marginBottom: '0.25rem' }}>Select or drop resumes</h3>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Supports PDF and DOCX formats</p>
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
            <div style={{ marginTop: '1.5rem' }} className="grid-2">
              {files.map((f, i) => (
                <div key={i} className="file-chip">
                  <span className="file-chip-name">{f.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="file-chip-remove"><X size={16}/></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="liquid-progress" style={{ marginTop: '1rem' }}>
            <div className="liquid-fill" style={{ width: `${progress > 0 ? progress : 5}%` }}></div>
            <div className="liquid-text">
              <Loader2 className="spin" size={14} style={{ marginRight: '6px' }} />
              Processing... {progress > 0 && `${progress}%`}
            </div>
          </div>
        ) : (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', marginTop: '1rem', fontSize: '1.1rem' }}
            onClick={handleSubmit}
          >
            Analyze Candidates
          </button>
        )}

      </div>
    </div>
  );
}
