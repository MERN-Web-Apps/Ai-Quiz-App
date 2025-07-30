import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setGlobalAlert } from '../utils/axiosApi';
import Alert from './Alert';

const AlertContext = createContext();

export function useAlert() {
  return useContext(AlertContext);
}

export function AlertProvider({ children }) {
  const [alert, setAlert] = useState({ open: false, message: '', buttonText: 'OK', onButtonClick: null, cancelText: 'Cancel', onCancel: null });


  const showAlert = useCallback((options) => {
    // Handle both object and string parameters for backward compatibility
    let alertOptions;
    if (typeof options === 'string') {
      alertOptions = { message: options };
    } else {
      alertOptions = options || {};
    }
    
    setAlert({
      open: true,
      message: alertOptions.message || 'Something went wrong',
      buttonText: alertOptions.buttonText || 'OK',
      onButtonClick: alertOptions.onButtonClick || (() => setAlert(a => ({ ...a, open: false }))),
      cancelText: alertOptions.cancelText || 'Cancel',
      onCancel: alertOptions.onCancel || (() => setAlert(a => ({ ...a, open: false })))
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
      {alert.open && (
        <Alert
          open={alert.open}
          message={alert.message}
          buttonText={alert.buttonText}
          onButtonClick={alert.onButtonClick}
          cancelText={alert.cancelText}
          onCancel={alert.onCancel}
        />
      )}
    </AlertContext.Provider>
  );
}
