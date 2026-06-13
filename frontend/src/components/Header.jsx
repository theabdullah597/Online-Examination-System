import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Key } from 'lucide-react';
import api from '../services/api';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match!");
      return;
    }
    
    try {
      await api.put('/auth/update-password', { oldPassword, newPassword });
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully! Please log in again.');
      logout();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <>
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.png" alt="System Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          <h3 style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.role}</span> Portal
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar"><User size={18} /></div>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.fullName}</span>
          </div>
          <button onClick={() => setShowPasswordModal(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Key size={16} /> Password
          </button>
          <button onClick={logout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card glass-panel animate-fade-in" style={{ width: '400px', maxWidth: '100%', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Change My Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label>Old Password</label>
                <input required type="password" className="input-field" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              </div>
              <div className="input-group">
                <label>New Password</label>
                <input required type="password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                  Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
                </small>
              </div>
              <div className="input-group">
                <label>Confirm New Password</label>
                <input required type="password" className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
