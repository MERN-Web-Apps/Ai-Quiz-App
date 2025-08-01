import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AlertProvider } from './components/AlertProvider';
import reportWebVitals from './reportWebVitals';
import { loadConfig } from './configLoader';

const root = ReactDOM.createRoot(document.getElementById('root'));
loadConfig().then(() => {
  root.render(
  <React.StrictMode>
    <AlertProvider>
      <App />
    </AlertProvider>
  </React.StrictMode>
);
});
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
