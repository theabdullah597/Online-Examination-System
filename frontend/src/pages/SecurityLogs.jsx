import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldAlert } from 'lucide-react';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/teacher/security-logs');
      setLogs(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
          <ShieldAlert size={28} />
        </div>
        <div>
          <h1 style={{ margin: 0 }}>Security Logs</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Review cheating violations from active exams.</p>
        </div>
      </div>

      <div className="card">
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>Student</th>
              <th style={{ padding: '1rem' }}>Exam</th>
              <th style={{ padding: '1rem' }}>Violation Type</th>
              <th style={{ padding: '1rem' }}>Details</th>
              <th style={{ padding: '1rem' }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{log.studentId?.fullName} <br/><span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{log.studentId?.email}</span></td>
                <td style={{ padding: '1rem' }}>{log.examId?.title}</td>
                <td style={{ padding: '1rem', color: 'var(--danger)', fontWeight: '500' }}>{log.violationType}</td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{log.details}</td>
                <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No security violations recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SecurityLogs;
