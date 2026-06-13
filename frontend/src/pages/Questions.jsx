import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [type, setType] = useState('MCQ');
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/teacher/questions');
      setQuestions(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type, questionText, marks,
        options: type === 'MCQ' ? options.filter(o => o.trim() !== '') : [],
        correctAnswer
      };
      await api.post('/teacher/questions', payload);
      setShowModal(false);
      fetchQuestions();
      // Reset form
      setQuestionText(''); setOptions(['', '', '', '']); setCorrectAnswer('');
    } catch (error) {
      alert('Failed to create question');
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
        <h1>Question Bank</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Question</button>
      </div>

      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Question</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Marks</th>
              <th style={{ padding: '1rem' }}>Answer</th>
            </tr>
          </thead>
          <tbody>
            {questions.map(q => (
              <tr key={q._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.questionText}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ background: 'var(--bg-input)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>{q.type}</span>
                </td>
                <td style={{ padding: '1rem' }}>{q.marks}</td>
                <td style={{ padding: '1rem' }}>{String(q.correctAnswer)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '5vh 1rem' }}>
          <div className="card" style={{ width: '500px', maxWidth: '100%', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add Question</h2>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Question Type</label>
                <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="True/False">True / False</option>
                  <option value="Fill in the Blank">Fill in the Blank</option>
                  <option value="Short Answer">Short Answer (Manual Grade)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Question Text</label>
                <textarea required className="input-field" rows="3" value={questionText} onChange={e => setQuestionText(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Marks</label>
                <input required type="number" min="1" className="input-field" value={marks} onChange={e => setMarks(Number(e.target.value))} />
              </div>

              {type === 'MCQ' && (
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Options</label>
                  {options.map((opt, i) => (
                    <input 
                      key={i} 
                      type="text" 
                      className="input-field" 
                      style={{ marginBottom: '0.5rem' }} 
                      placeholder={`Option ${i+1}`}
                      value={opt}
                      onChange={e => {
                        const newOpt = [...options];
                        newOpt[i] = e.target.value;
                        setOptions(newOpt);
                      }}
                    />
                  ))}
                  <div className="input-group" style={{ marginTop: '1rem' }}>
                    <label>Correct Answer (Must match one option exactly)</label>
                    <input required type="text" className="input-field" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} />
                  </div>
                </div>
              )}

              {type === 'True/False' && (
                <div className="input-group">
                  <label>Correct Answer</label>
                  <select required className="input-field" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}>
                    <option value="">Select...</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}

              {type === 'Fill in the Blank' && (
                <div className="input-group">
                  <label>Correct Answer (Exact match)</label>
                  <input required type="text" className="input-field" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Question</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Questions;
