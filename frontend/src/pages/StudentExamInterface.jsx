import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAntiCheat } from '../hooks/useAntiCheat';

const StudentExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [examData, setExamData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { violations } = useAntiCheat(examId, attemptId);
  const autoSaveInterval = useRef(null);

  // Initialize Exam
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/student/exams/${examId}/start`);
        const { attemptId, exam, startTime } = res.data.data;
        setExamData(exam);
        setAttemptId(attemptId);
        
        // Calculate time left based on server start time and duration
        const start = new Date(startTime).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - start) / 1000);
        const totalSeconds = exam.durationMinutes * 60;
        setTimeLeft(Math.max(0, totalSeconds - elapsed));
        
      } catch (error) {
        alert(error.response?.data?.message || 'Error loading exam');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, navigate]);

  // Timer & Auto Submit
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // Auto Save
  useEffect(() => {
    if (!attemptId || submitted) return;

    autoSaveInterval.current = setInterval(async () => {
      if (Object.keys(answers).length > 0) {
        try {
          const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
            questionId: qId,
            studentAnswer: ans
          }));
          await api.put(`/student/attempts/${attemptId}/save`, { answers: formattedAnswers });
        } catch (e) {
          console.error('Auto save failed', e);
        }
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(autoSaveInterval.current);
  }, [answers, attemptId, submitted]);

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (autoSubmitted = false) => {
    if (!autoSubmitted && !window.confirm('Are you sure you want to submit the exam?')) return;
    
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        studentAnswer: ans
      }));
      await api.post(`/student/attempts/${attemptId}/submit`, { answers: formattedAnswers, autoSubmitted });
      setSubmitted(true);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      alert('Exam submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      alert('Failed to submit exam');
    }
  };

  if (loading) return <div>Loading exam environment...</div>;
  if (!examData) return null;

  if (!isFullscreen && !submitted) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Exam Instructions</h2>
        <p>This is a secure exam. You must remain in fullscreen mode. Switching tabs or windows is recorded and may invalidate your exam.</p>
        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={enterFullscreen}>
          Enter Fullscreen & Start Exam
        </button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = examData.questions[currentQIndex];

  return (
    <div style={{ userSelect: 'none', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <h2>{examData.title}</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ color: violations > 0 ? 'var(--warning)' : 'inherit' }}>
            Security Warnings: {violations}
          </div>
          <div style={{ fontWeight: 'bold', color: timeLeft < 300 ? 'var(--danger)' : 'var(--primary)' }}>
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div className="card">
            <h3>Question {currentQIndex + 1} of {examData.questions.length}</h3>
            <p style={{ margin: '1rem 0', fontSize: '1.2rem' }}>{currentQ.questionText}</p>
            
            <div style={{ marginTop: '1.5rem' }}>
              {currentQ.type === 'MCQ' && currentQ.options.map((opt, i) => (
                <label key={i} style={{ display: 'block', margin: '0.5rem 0', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name={`q-${currentQ._id}`}
                    value={opt}
                    checked={answers[currentQ._id] === opt}
                    onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {opt}
                </label>
              ))}

              {currentQ.type === 'True/False' && ['True', 'False'].map((opt, i) => (
                <label key={i} style={{ display: 'block', margin: '0.5rem 0', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name={`q-${currentQ._id}`}
                    value={opt}
                    checked={answers[currentQ._id] === opt}
                    onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {opt}
                </label>
              ))}

              {(currentQ.type === 'Short Answer' || currentQ.type === 'Fill in the Blank') && (
                <input 
                  type="text"
                  className="input-field"
                  value={answers[currentQ._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                />
              )}

              {currentQ.type === 'Essay' && (
                <textarea 
                  className="input-field"
                  rows="6"
                  value={answers[currentQ._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ._id, e.target.value)}
                />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
              <button 
                className="btn" 
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
              >
                Previous
              </button>
              <button 
                className="btn btn-primary" 
                disabled={currentQIndex === examData.questions.length - 1}
                onClick={() => setCurrentQIndex(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div style={{ width: '300px', background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <h3>Navigation</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem', flex: 1, alignContent: 'start' }}>
            {examData.questions.map((q, i) => {
              const isAnswered = !!answers[q._id];
              const isCurrent = i === currentQIndex;
              return (
                <button 
                  key={q._id}
                  onClick={() => setCurrentQIndex(i)}
                  style={{
                    padding: '0.5rem',
                    background: isCurrent ? 'var(--primary)' : (isAnswered ? 'var(--secondary)' : 'var(--bg-main)'),
                    color: isCurrent || isAnswered ? 'white' : 'var(--text-main)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <button className="btn btn-danger" style={{ width: '100%', padding: '1rem' }} onClick={() => handleSubmit(false)}>
            Submit Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentExamInterface;
