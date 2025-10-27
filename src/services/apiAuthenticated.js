import axios from 'axios';

const isDev = import.meta.env.DEV;

const baseURL = isDev ? '/api' : '/api';

const apiAuthenticated = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiAuthenticated.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiAuthenticated;
