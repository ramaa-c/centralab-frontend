import axios from 'axios';

const apiAuthenticated = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiAuthenticated.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token && token !== "") {
      config.headers['Authorization'] = `Bearer ${token}`;
    }else{
      delete config.headers['Authorization'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiAuthenticated;