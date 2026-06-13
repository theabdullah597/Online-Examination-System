import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Results = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/student/results');
      setResults(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>My Results</h1>
      
      <div className="dashboard-grid">
        {results.map(res => {
          const percentage = ((res.score / res.examId.totalMarks) * 100).toFixed(1);
          const passed = res.score >= res.examId.passingMarks;
          
          return (
            <div key={res._id} className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: passed ? 'var(--secondary)' : 'var(--danger)' }} />
              <h3 style={{ marginBottom: '0.5rem', paddingLeft: '1rem' }}>{res.examId.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', paddingLeft: '1rem', fontSize: '0.9rem' }}>
                Submitted: {new Date(res.endTime).toLocaleString()}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '1rem', flex: 1, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: res.isFullyGraded ? (passed ? 'var(--secondary)' : 'var(--danger)') : 'var(--warning)' }}>
                    {res.score} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {res.examId.totalMarks}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Score ({percentage}%)</div>
                </div>
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '2rem', 
                  background: res.isFullyGraded ? (passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)') : 'rgba(245, 158, 11, 0.1)',
                  color: res.isFullyGraded ? (passed ? 'var(--secondary)' : 'var(--danger)') : 'var(--warning)',
                  fontWeight: '600',
                  textAlign: 'center'
                }}>
                  {res.isFullyGraded ? (passed ? 'PASSED' : 'FAILED') : 'PENDING GRADING'}
                </div>
              </div>
            </div>
          );
        })}
        {results.length === 0 && <p>No results available yet.</p>}
      </div>
    </div>
  );
};

export default Results;
