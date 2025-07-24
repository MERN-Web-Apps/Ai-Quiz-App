import axios from 'axios';
const axiosApi = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});


// Add a response interceptor to handle 401 errors globally


// Helper to show alert outside React tree
let showGlobalAlert = null;
export function setGlobalAlert(fn) {
  showGlobalAlert = fn;
}

axiosApi.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response &&
      error.response.status === 401 &&
      !(error.config && error.config.skipAuthInterceptor)
    ) {
      const currentPath = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith('/signin')) {
        if (showGlobalAlert) {
          showGlobalAlert({
            message: 'You need to sign in to access this page.',
            buttonText: 'Sign In',
            onButtonClick: () => {
              window.location.href = `/signin?from=${encodeURIComponent(currentPath)}`;
            },
            cancelText: 'Cancel',
            onCancel: () => {
              window.history.back();
            }
          });
        } else {
          // fallback
          window.location.href = `/signin?from=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosApi;
