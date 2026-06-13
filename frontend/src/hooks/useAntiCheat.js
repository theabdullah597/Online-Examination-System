import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export const useAntiCheat = (examId, attemptId) => {
  const [violations, setViolations] = useState(0);

  const logViolation = useCallback(async (type, details) => {
    if (!attemptId) return;
    try {
      await api.post('/student/security-log', {
        examId,
        attemptId,
        violationType: type,
        details
      });
      setViolations(v => v + 1);
    } catch (error) {
      console.error('Failed to log violation:', error);
    }
  }, [examId, attemptId]);

  // Tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logViolation('tab_switch', 'User switched to another tab or minimized the browser');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [logViolation]);

  // Blur focus
  useEffect(() => {
    const handleBlur = () => {
      logViolation('tab_switch', 'Window lost focus');
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [logViolation]);

  // Fullscreen enforcement
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation('exit_fullscreen', 'User exited fullscreen mode');
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [logViolation]);

  // Keyboard shortcuts & Copy/Paste block
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent dev tools, copy, paste, cut, print
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'p')) ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        logViolation('shortcut_used', `Restricted key combination used: ${e.key}`);
      }
    };
    
    const handleContext = (e) => {
      e.preventDefault();
      logViolation('other', 'Right click context menu opened');
    };

    const handleCopy = (e) => {
      e.preventDefault();
      logViolation('copy_paste', 'Attempted to copy content');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContext);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('paste', handleCopy);
    window.addEventListener('cut', handleCopy);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContext);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('paste', handleCopy);
      window.removeEventListener('cut', handleCopy);
    };
  }, [logViolation]);

  // Select block via CSS (can also be done in JS, but CSS is safer, we'll apply 'user-select: none' in the component)

  return { violations };
};
