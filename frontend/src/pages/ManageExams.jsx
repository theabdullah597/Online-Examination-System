import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    fetchExams();
    fetchClassesAndQuestions();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/teacher/exams');
      setExams(res.data.data);
    } catch (error) { console.error(error); }
  };

  const fetchClassesAndQuestions = async () => {
    try {
      const [cRes, qRes] = await Promise.all([
        api.get('/teacher/classes'),
        api.get('/teacher/questions')
      ]);
      setClasses(cRes.data.data);
      setQuestions(qRes.data.data);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if(selectedQuestions.length === 0) return alert('Select at least one question');
    
    if (startDate && endDate && durationMinutes) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const durationMs = durationMinutes * 60000;
      
      if (end - start < durationMs) {
        return alert(`End time must be at least ${durationMinutes} minutes after the start time.`);
      }
    }
    
    // Calculate total marks from selected questions
    const totalMarks = selectedQuestions.reduce((acc, qId) => {
      const q = questions.find(x => x._id === qId);
      return acc + (q ? q.marks : 0);
    }, 0);

    const payload = {
      title, description, classId, 
      startDate, endDate, durationMinutes,
      totalMarks, passingMarks: Math.floor(totalMarks * 0.5), // 50% passing by default
      questions: selectedQuestions,
      status: 'active'
    };

    try {
      await api.post('/teacher/exams', payload);
      setShowModal(false);
      fetchExams();
      setTitle(''); setDescription(''); setSelectedQuestions([]);
    } catch (error) {
      alert('Failed to create exam');
    }
  };

  const toggleQuestion = (qId) => {
    setSelectedQuestions(prev => 
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  return (
    <>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
        <h1>Manage Exams</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Create Exam</button>
      </div>

      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Class</th>
              <th style={{ padding: '1rem' }}>Duration</th>
              <th style={{ padding: '1rem' }}>Marks</th>
              <th style={{ padding: '1rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(ex => (
              <tr key={ex._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{ex.title}</td>
                <td style={{ padding: '1rem' }}>{ex.classId?.className || 'Unknown'}</td>
                <td style={{ padding: '1rem' }}>{ex.durationMinutes}m</td>
                <td style={{ padding: '1rem' }}>{ex.totalMarks}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    background: ex.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: ex.status === 'active' ? 'var(--secondary)' : 'var(--warning)',
                    padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' 
                  }}>
                    {ex.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, padding: '5vh 1rem' }}>
          <div className="card" style={{ width: '800px', maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Exam</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Title</label>
                    <input required type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Target Class</label>
                    <select required className="input-field" value={classId} onChange={e => setClassId(e.target.value)}>
                      <option value="">Select a class...</option>
                      {classes.map(c => <option key={c._id} value={c._id}>{c.className}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Start Date/Time</label>
                    <input required type="datetime-local" className="input-field" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>End Date/Time</label>
                    <input required type="datetime-local" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Duration (Minutes)</label>
                    <input required type="number" min="5" className="input-field" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} />
                  </div>
                </div>
                
                <h3 style={{ margin: '1.5rem 0 1rem' }}>Select Questions</h3>
                <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', maxHeight: '300px', overflowY: 'auto' }}>
                  {questions.length === 0 ? <p>No questions available in Bank.</p> : questions.map(q => (
                    <label key={q._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedQuestions.includes(q._id)} 
                        onChange={() => toggleQuestion(q._id)} 
                        style={{ width: '1.2rem', height: '1.2rem' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>{q.questionText}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.type} | Marks: {q.marks}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Publish Exam</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageExams;
