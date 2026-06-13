import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { parseCSV } from '../utils/csvParser';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/admin/teachers');
      setTeachers(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/teachers', { fullName, email, password });
      setShowModal(false);
      setFullName('');
      setEmail('');
      setPassword('');
      fetchTeachers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create teacher. Maybe email already exists?');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          alert('CSV is empty or invalid.');
          return;
        }

        const res = await api.post('/admin/teachers/bulk', { teachers: data });
        alert(res.data.message || `Successfully uploaded ${data.length} teachers`);
        fetchTeachers();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to upload CSV');
      }
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        fetchTeachers();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete teacher');
      }
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <h1 style={{ marginBottom: '2rem' }}>Teacher Management</h1>
      <div className="card glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <h3>All Teachers</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="file" 
              accept=".csv" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>Upload CSV</button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Teacher</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(teacher => (
                <tr key={teacher._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{teacher.fullName}</td>
                  <td style={{ padding: '1rem' }}>{teacher.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.85rem',
                      background: teacher.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: teacher.status === 'active' ? 'var(--secondary)' : 'var(--danger)'
                    }}>
                      {teacher.status || 'active'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} onClick={() => handleDelete(teacher._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '5vh 1rem' }}>
          <div className="card" style={{ width: '400px', maxWidth: '100%', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add New Teacher</h2>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Full Name</label>
                <input required type="text" className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input required type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Initial Password</label>
                <input required type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Teachers;
