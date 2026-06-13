import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { parseCSV } from '../utils/csvParser';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classId, setClassId] = useState('');
  
  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/teacher/students');
      setStudents(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get('/teacher/classes');
      setClasses(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!classId) {
      alert("Please select a class");
      return;
    }

    try {
      await api.post('/teacher/students', { fullName, email, password, rollNumber, classId });
      setShowModal(false);
      setFullName('');
      setEmail('');
      setPassword('');
      setRollNumber('');
      setClassId('');
      fetchStudents();
    } catch (error) {
      alert('Failed to create student. Maybe email already exists?');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!classId) {
      alert("Please select a class");
      return;
    }

    const file = fileInputRef.current?.files[0];
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          alert('CSV is empty or invalid.');
          return;
        }

        // Add classId to all parsed students
        const studentsWithClass = data.map(s => ({ ...s, classId }));

        const res = await api.post('/teacher/students/bulk', { students: studentsWithClass });
        alert(res.data.message || `Successfully uploaded ${data.length} students`);
        setShowBulkModal(false);
        setClassId('');
        fetchStudents();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to upload CSV');
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/teacher/students/${id}`);
        fetchStudents();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <h1 style={{ marginBottom: '2rem' }}>Student Management</h1>
        <div className="card glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
            <h3>Enrolled Students</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setShowBulkModal(true)}>Upload CSV</button>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Student</button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Roll Number</th>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Class</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem' }}>{student.rollNumber || 'N/A'}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{student.fullName}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{student.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.85rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--primary)'
                      }}>
                        {student.classId?.className || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => handleDelete(student._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No students enrolled yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

        {showModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '5vh 1rem' }}>
            <div className="card animate-fade-in" style={{ width: '450px', maxWidth: '100%' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Enroll New Student</h2>
              <form onSubmit={handleCreate}>

                <div className="input-group">
                  <label>Assign to Class</label>
                  <select
                    className="input-field"
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    required
                  >
                    <option value="">-- Select a Class --</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.className}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Roll Number / ID</label>
                  <input required type="text" className="input-field" value={rollNumber} onChange={e => setRollNumber(e.target.value)} />
                </div>

                <div className="input-group">
                  <label>Full Name</label>
                  <input required type="text" className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>

                <div className="input-group">
                  <label>Email Address</label>
                  <input required type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div className="input-group">
                  <label>Initial Password</label>
                  <input required type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Enroll Student</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showBulkModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '5vh 1rem' }}>
            <div className="card animate-fade-in" style={{ width: '450px', maxWidth: '100%' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Bulk Enroll Students</h2>
              <form onSubmit={handleBulkUpload}>
                <div className="input-group">
                  <label>Assign to Class</label>
                  <select
                    className="input-field"
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    required
                  >
                    <option value="">-- Select a Class --</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>{cls.className}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>CSV File</label>
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="input-field" 
                    ref={fileInputRef}
                    required
                    style={{ padding: '0.5rem' }}
                  />
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                    CSV must include columns: Full Name, Email, Password, Roll Number
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowBulkModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Upload</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
  );
};

export default Students;
