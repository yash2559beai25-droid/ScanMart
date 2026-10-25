// ToastContext — a small reusable notification for success and error messages.
// This is for user feedback only (for example, "Added to cart").
// It is not a global app store like Redux or Zustand.

import { createContext, useContext, useEffect, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function showToast(message, type) {
    setToast({
      id: Date.now(),
      message: message,
      type: type || 'success',
    });
  }

  useEffect(
    function () {
      if (!toast) {
        return undefined;
      }

      const timer = setTimeout(function () {
        setToast(null);
      }, 2500);

      return function () {
        clearTimeout(timer);
      };
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={function () {
            setToast(null);
          }}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}
