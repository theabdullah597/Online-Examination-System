import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Users, FileText, CheckCircle, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      if (user?.role === 'Student') {
        api.get('/student/exams').then(res => setExams(res.data.data)).catch(console.error);
      } else if (user?.role === 'Super Admin') {
        api.get('/admin/dashboard-stats').then(res => setStats(res.data.data)).catch(console.error);
      } else if (user?.role === 'Teacher') {
        api.get('/teacher/dashboard-stats').then(res => setStats(res.data.data)).catch(console.error);
      }
    };

    fetchData(); // Initial fetch
    
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const teacherPieData = stats ? [
    { name: 'Passed', value: stats.passRate, color: 'var(--secondary)' },
    { name: 'Failed', value: 100 - stats.passRate, color: 'var(--danger)' }
  ] : [];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>Overview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>Welcome back, {user?.fullName?.split(' ')[0] || 'User'}. Here's what's happening today.</p>
      </div>
      
      {user.role === 'Student' && (
        <>
          <div className="dashboard-grid">
            <div className="stat-card hover-lift glass-panel" style={{ borderTop: '4px solid var(--primary)' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', color: 'var(--primary)' }}><FileText /></div>
              <div className="stat-info">
                <h4>Pending Exams</h4>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{exams.length}</h2>
              </div>
            </div>
            <div className="stat-card hover-lift glass-panel" style={{ borderTop: '4px solid var(--secondary)' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', color: 'var(--secondary)' }}><CheckCircle /></div>
              <div className="stat-info">
                <h4>Completed</h4>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>0</h2>
              </div>
            </div>
          </div>
          
          <div className="card glass-panel" style={{ marginTop: '2.5rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Available Exams</h2>
            {exams.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No exams scheduled at the moment.</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {exams.map(exam => (
                  <div key={exam._id} className="hover-lift" style={{ padding: '1.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', transition: 'all 0.3s ease' }}>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: '600' }}>{exam.title}</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>{exam.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '1.75rem', color: 'var(--text-muted)', fontWeight: '500', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>🕒 {exam.durationMinutes}m</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>⭐ {exam.totalMarks} Marks</span>
                    </div>
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%' }}
                      onClick={() => navigate(`/exam/${exam._id}`)}
                    >
                      Start Exam
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {user.role === 'Super Admin' && stats && (
        <>
          <div className="dashboard-grid">
            <div className="stat-card hover-lift glass-panel" style={{ borderTop: '4px solid var(--primary)' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', color: 'var(--primary)' }}><Users /></div>
              <div className="stat-info">
                <h4>Total Teachers</h4>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{stats.totalTeachers}</h2>
              </div>
            </div>
            <div className="stat-card hover-lift glass-panel" style={{ borderTop: '4px solid var(--secondary)' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', color: 'var(--secondary)' }}><Users /></div>
              <div className="stat-info">
                <h4>Total Students</h4>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{stats.totalStudents}</h2>
              </div>
            </div>
            <div className="stat-card hover-lift glass-panel" style={{ borderTop: '4px solid var(--danger)' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)', color: 'var(--danger)' }}><ShieldAlert /></div>
              <div className="stat-info">
                <h4>Security Logs</h4>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>0</h2>
              </div>
            </div>
          </div>

          <div className="card glass-panel" style={{ height: '450px', padding: '2rem' }}>
            <h3 style={{ marginBottom: '2rem', fontWeight: '700' }}>System Growth</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={{stroke: 'var(--border)'}} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'var(--bg-input)', opacity: 0.5}} contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="students" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="teachers" fill="var(--secondary)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {user.role === 'Teacher' && stats && (
        <>
          <div className="dashboard-grid">
            <div className="stat-card hover-lift glass-panel" style={{ borderTop: '4px solid var(--primary)' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)', color: 'var(--primary)' }}><Users /></div>
              <div className="stat-info">
                <h4>My Students</h4>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{stats.totalStudents}</h2>
              </div>
            </div>
            <div className="stat-card hover-lift glass-panel" style={{ borderTop: '4px solid var(--secondary)' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)', color: 'var(--secondary)' }}><FileText /></div>
              <div className="stat-info">
                <h4>Active Exams</h4>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{stats.activeExams}</h2>
              </div>
            </div>
            <div className="stat-card hover-lift glass-panel" style={{ borderTop: '4px solid var(--warning)' }}>
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)', color: 'var(--warning)' }}><CheckCircle /></div>
              <div className="stat-info">
                <h4>Avg. Score</h4>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800' }}>{stats.avgScore}%</h2>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            <div className="card glass-panel" style={{ height: '400px', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Overall Pass Rate</h3>
              <div style={{ flex: 1, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={teacherPieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                      {teacherPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)' }} />
                    <Legend iconType="circle" verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
