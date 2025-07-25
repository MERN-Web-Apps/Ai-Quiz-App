import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setGlobalAlert } from '../utils/axiosApi';

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState({ open: false, message: '', buttonText: 'OK', onButtonClick: null, cancelText: 'Cancel', onCancel: null });


  const showAlert = useCallback((options) => {
    setAlert({
      open: true,
      message: options.message || '',
      buttonText: options.buttonText || 'OK',
      onButtonClick: options.onButtonClick || (() => setAlert(a => ({ ...a, open: false }))),
      cancelText: options.cancelText || 'Cancel',
      onCancel: options.onCancel || (() => setAlert(a => ({ ...a, open: false })))
    });
  }, []);

  useEffect(() => {
    setGlobalAlert(showAlert);
    return () => setGlobalAlert(null);
  }, [showAlert]);

  const closeAlert = useCallback(() => {
    setAlert(a => ({ ...a, open: false }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      {/* Dynamically import Alert to avoid circular dependency */}
      {alert.open && (
        <React.Suspense fallback={null}>
          {React.createElement(require('./Alert').default, {
            open: alert.open,
            message: alert.message,
            buttonText: alert.buttonText,
            onButtonClick: alert.onButtonClick,
            cancelText: alert.cancelText,
            onCancel: alert.onCancel
          })}
        </React.Suspense>
      )}
    </AlertContext.Provider>
  );
}
