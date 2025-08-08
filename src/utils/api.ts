// API configuration utility
const getApiBaseUrl = (): string => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // Production - use Railway backend URL from environment variable
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  
  // Fallback - this should be updated with the actual Railway URL
  console.warn('VITE_API_BASE_URL not set. Using fallback URL: https://narjunet-production.up.railway.app');
  return 'https://narjunet-production.up.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();

export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};
