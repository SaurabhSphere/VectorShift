import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null); // null or { id, message, type }
  const timeoutRef = useRef(null);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    // Clear any active toast timeouts to avoid race conditions
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const id = Date.now() + Math.random().toString(36).substring(2, 11);
    setToast({ id, message, type });
    
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const success = useCallback((msg, dur = 5000) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg, dur = 5000) => addToast(msg, 'error', dur), [addToast]);
  const warning = useCallback((msg, dur = 5000) => addToast(msg, 'warning', dur), [addToast]);
  const info = useCallback((msg, dur = 5000) => addToast(msg, 'info', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info, toast }}>
      {children}
      <ToastContainer toast={toast} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toast, removeToast }) => {
  if (!toast) return null;
  
  return (
    <div className="toast-container" aria-live="polite" role="status">
      <div className={`toast toast-${toast.type}`} role="alert">
        <span className="toast-icon">
          {toast.type === 'success' && '✅'}
          {toast.type === 'error' && '❌'}
          {toast.type === 'warning' && '⚠️'}
          {toast.type === 'info' && 'ℹ️'}
        </span>
        <span className="toast-message">{toast.message}</span>
        <button
          onClick={removeToast}
          className="toast-close-btn"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
