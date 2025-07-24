import axios from 'axios';
import { getConfig, isConfigLoaded, loadConfig } from '../configLoader';

// Create a custom axios instance that resolves the baseURL dynamically
const axiosApi = axios.create();

// Function to configure axios with the loaded config
const configureAxios = () => {
  try {
    if (isConfigLoaded()) {
      const config = getConfig();
      axiosApi.defaults.baseURL = config.baseUrl;
      axiosApi.defaults.withCredentials = true;
      axiosApi.defaults.headers['Content-Type'] = 'application/json';
    } else {
      // Wait for config to load then configure
      loadConfig().then(() => {
        const config = getConfig();
        axiosApi.defaults.baseURL = config.baseUrl;
        axiosApi.defaults.withCredentials = true;
        axiosApi.defaults.headers['Content-Type'] = 'application/json';
      });
    }
  } catch (error) {
    console.error("Error configuring axios:", error);
  }
};

// Run the configuration
configureAxios();
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
        // Parse the current URL for a "from" parameter
        const urlParams = new URLSearchParams(window.location.search);
        const fromParam = urlParams.get('from') || '/';
        
        if (showGlobalAlert) {
          showGlobalAlert({
            message: 'You need to sign in to access this page.',
            buttonText: 'Sign In',
            onButtonClick: () => {
              window.location.href = `/signin?from=${encodeURIComponent(currentPath)}`;
            },
            cancelText: 'Cancel',
            onCancel: () => {
              // Navigate to the "from" parameter if present, or to home page
              window.location.href = fromParam;
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