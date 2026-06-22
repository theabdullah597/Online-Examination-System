import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, FileText, Settings, ShieldAlert, GraduationCap, CheckSquare } from 'lucide-react';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const getLinks = () => {
    switch (user?.role) {
      case 'Super Admin':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
          { name: 'Teachers', path: '/teachers', icon: <Users size={20} /> },
          { name: 'Students', path: '/students', icon: <GraduationCap size={20} /> },
        ];
      case 'Teacher':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
          { name: 'Classes', path: '/classes', icon: <Users size={20} /> },
          { name: 'Students', path: '/students', icon: <GraduationCap size={20} /> },
          { name: 'Question Bank', path: '/questions', icon: <BookOpen size={20} /> },
          { name: 'Exams', path: '/manage-exams', icon: <FileText size={20} /> },
          { name: 'Submissions', path: '/submissions', icon: <CheckSquare size={20} /> },
          { name: 'Security Logs', path: '/security-logs', icon: <ShieldAlert size={20} /> },
        ];
      case 'Student':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
          { name: 'My Results', path: '/results', icon: <FileText size={20} /> },
        ];
      default:
        return [];
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>ExamPro</h2>
      </div>
      <nav className="sidebar-nav">
        {getLinks().map(link => (
          <NavLink 
            key={link.name} 
            to={link.path} 
            className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
