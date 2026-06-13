import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Submissions = () => {
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [grades, setGrades] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const res = await api.get('/teacher/attempts');
      setAttempts(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewAttempt = async (id) => {
    try {
      const res = await api.get(`/teacher/attempts/${id}`);
      setSelectedAttempt(res.data.data);
      
      // Initialize grades state
      const initialGrades = {};
      res.data.data.answers.forEach(ans => {
        initialGrades[ans.questionId._id] = ans.marksObtained;
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGradeChange = (questionId, value) => {
    setGrades({ ...grades, [questionId]: Number(value) });
  };

  const submitGrades = async () => {
    setIsSubmitting(true);
    try {
      const gradesArray = Object.keys(grades).map(qId => ({
        questionId: qId,
        marksObtained: grades[qId]
      }));

      await api.put(`/teacher/attempts/${selectedAttempt._id}/grade`, { grades: gradesArray });
      
      alert('Grades updated successfully');
      setSelectedAttempt(null);
      fetchAttempts(); // refresh list
    } catch (error) {
      alert('Failed to update grades');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await api.delete(`/teacher/attempts/${id}`);
        fetchAttempts();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete submission');
      }
    }
  };

  if (selectedAttempt) {
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button className="btn btn-outline" onClick={() => setSelectedAttempt(null)}>← Back</button>
          <h1 style={{ margin: 0 }}>Grade Submission</h1>
        </div>

        <div className="card glass-panel" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Student</p>
            <h3 style={{ margin: 0 }}>{selectedAttempt.studentId.fullName} ({selectedAttempt.studentId.rollNumber || 'N/A'})</h3>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Exam</p>
            <h3 style={{ margin: 0 }}>{selectedAttempt.examId.title}</h3>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Current Score</p>
            <h3 style={{ margin: 0, color: 'var(--primary)' }}>{selectedAttempt.score} / {selectedAttempt.examId.totalMarks}</h3>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '5rem' }}>
          {selectedAttempt.answers.map((ans, index) => {
            const isSubjective = !['MCQ', 'True/False', 'Fill in the Blank'].includes(ans.questionId.type);
            const maxMarks = ans.questionId.marks;
            
            return (
              <div key={ans.questionId._id} className="card" style={{ borderLeft: isSubjective ? '4px solid var(--primary)' : '4px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>Question {index + 1} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'normal', marginLeft: '0.5rem' }}>[{ans.questionId.type}]</span></h4>
                  <div style={{ fontWeight: '600' }}>
                    Marks: {ans.marksObtained} / {maxMarks}
                  </div>
                </div>
                
                <p style={{ fontSize: '1.05rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{ans.questionId.questionText}</p>
                
                <div style={{ background: 'var(--bg-default)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Student Answer:</p>
                  <p style={{ margin: 0, fontWeight: '500' }}>{ans.studentAnswer || <span style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Not answered</span>}</p>
                </div>
                
                {isSubjective && (
                  <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Suggested Answer / Key:</p>
                      <p style={{ margin: 0, fontSize: '0.95rem' }}>{ans.questionId.correctAnswer || 'N/A'}</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label style={{ fontWeight: '500', fontSize: '0.95rem' }}>Assign Marks:</label>
                      <input 
                        type="number" 
                        min="0" 
                        max={maxMarks}
                        step="0.5"
                        className="input-field" 
                        style={{ width: '80px', textAlign: 'center', padding: '0.5rem' }}
                        value={grades[ans.questionId._id]}
                        onChange={(e) => handleGradeChange(ans.questionId._id, e.target.value)}
                      />
                      <span style={{ color: 'var(--text-muted)' }}>/ {maxMarks}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ position: 'fixed', bottom: '0', left: '250px', right: '0', background: 'var(--card-bg)', padding: '1rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', zIndex: 10 }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: '0.8rem 2rem', fontSize: '1.05rem' }}
            onClick={submitGrades}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Grades & Update Score'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Submissions & Grading</h1>
      <div className="card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h3>Recent Submissions</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Student</th>
                <th style={{ padding: '1rem' }}>Exam Title</th>
                <th style={{ padding: '1rem' }}>Submitted At</th>
                <th style={{ padding: '1rem' }}>Score</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map(attempt => (
                <tr key={attempt._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '500' }}>{attempt.studentId?.fullName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{attempt.studentId?.rollNumber}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>{attempt.examId?.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(attempt.endTime || attempt.updatedAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{attempt.score}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => handleViewAttempt(attempt._id)}
                      >
                        Review / Grade
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => handleDelete(attempt._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {attempts.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No submissions found for your exams.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Submissions;
