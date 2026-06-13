import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

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
    try {
      await api.post('/teacher/classes', { className, description });
      setShowModal(false);
      setClassName('');
      setDescription('');
      fetchClasses();
    } catch (error) {
      alert('Failed to create class');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.delete(`/teacher/classes/${id}`);
        fetchClasses();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete class');
      }
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
        <h1>Class Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Class</button>
      </div>

      <div className="dashboard-grid">
        {classes.map(cls => (
          <div key={cls._id} className="card glass-panel hover-lift">
            <h3 style={{ marginBottom: '0.5rem' }}>{cls.className}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{cls.description || 'No description'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Students: <strong>{cls.students?.length || 0}</strong></span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>View Students</button>
                <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleDelete(cls._id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {classes.length === 0 && <p>No classes created yet.</p>}
      </div>
    </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '5vh 1rem' }}>
          <div className="card" style={{ width: '400px', maxWidth: '100%', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Class</h2>
            <form onSubmit={handleCreate}>
              <div className="input-group">
                <label>Class Name</label>
                <input required type="text" className="input-field" value={className} onChange={e => setClassName(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Description</label>
                <input type="text" className="input-field" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Classes;
