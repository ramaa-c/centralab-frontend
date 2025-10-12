import axios from 'axios';

const apiAuthenticated = axios.create({
  baseURL: 'http://192.168.2.103:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiAuthenticated.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiAuthenticated;