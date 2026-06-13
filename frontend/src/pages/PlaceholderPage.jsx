import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>{title}</h1>
      <div className="card">
        <h3>Feature Coming Soon</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
          The backend API for this feature is already implemented. The UI is under construction.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
