import { useState } from 'react';
import UploadArea from './components/UploadArea';
import SwipeCard from './components/SwipeCard';
import Shortlist from './components/Shortlist';
import './index.css';

function App() {
  const [page, setPage] = useState('upload'); // 'upload', 'swipe', 'shortlist'
  const [results, setResults] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shortlisted, setShortlisted] = useState([]);

  const handleAnalyzeComplete = (data) => {
    setResults(data);
    setCurrentIdx(0);
    setShortlisted([]);
    setPage('swipe');
  };

  const handlePass = () => {
    if (currentIdx + 1 >= results.length) {
      setPage('shortlist');
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleShortlist = () => {
    setShortlisted((prev) => [...prev, results[currentIdx]]);
    if (currentIdx + 1 >= results.length) {
      setPage('shortlist');
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handleStartOver = () => {
    setResults([]);
    setCurrentIdx(0);
    setShortlisted([]);
    setPage('upload');
  };

  return (
    <>
      {page === 'upload' && <UploadArea onAnalyze={handleAnalyzeComplete} />}
      
      {page === 'swipe' && results.length > 0 && (
        <SwipeCard 
          candidateData={results[currentIdx]} 
          onPass={handlePass}
          onShortlist={handleShortlist}
          total={results.length}
          currentIdx={currentIdx}
        />
      )}

      {page === 'shortlist' && (
        <Shortlist 
          shortlisted={shortlisted} 
          onStartOver={handleStartOver}
        />
      )}
    </>
  );
}

export default App;
