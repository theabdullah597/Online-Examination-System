import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentExamInterface from './pages/StudentExamInterface';

import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Students from './pages/Students';
import Questions from './pages/Questions';
import ManageExams from './pages/ManageExams';
import SecurityLogs from './pages/SecurityLogs';
import Results from './pages/Results';
import Submissions from './pages/Submissions';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected Routes with Sidebar Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Admin Only Routes */}
          <Route path="/teachers" element={<RoleRoute allowedRoles={['Super Admin']}><Teachers /></RoleRoute>} />
          
          {/* Teacher Only Routes */}
          <Route path="/classes" element={<RoleRoute allowedRoles={['Teacher']}><Classes /></RoleRoute>} />
          <Route path="/students" element={<RoleRoute allowedRoles={['Teacher', 'Super Admin']}><Students /></RoleRoute>} />
          <Route path="/questions" element={<RoleRoute allowedRoles={['Teacher']}><Questions /></RoleRoute>} />
          <Route path="/manage-exams" element={<RoleRoute allowedRoles={['Teacher']}><ManageExams /></RoleRoute>} />
          <Route path="/security-logs" element={<RoleRoute allowedRoles={['Super Admin', 'Teacher']}><SecurityLogs /></RoleRoute>} />
          <Route path="/submissions" element={<RoleRoute allowedRoles={['Teacher']}><Submissions /></RoleRoute>} />

          {/* Student Only Routes */}
          <Route path="/results" element={<RoleRoute allowedRoles={['Student']}><Results /></RoleRoute>} />
        </Route>

        {/* Secure Exam Interface without Sidebar Layout */}
        <Route path="/exam/:examId" element={<RoleRoute allowedRoles={['Student']}><StudentExamInterface /></RoleRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
