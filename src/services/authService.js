import api from './api';

const API_ENDPOINT = "http://192.168.2.103:8080/api/auth/login"; 

export const login = async (email, password) => {
  try {
    const response = await api.post(API_ENDPOINT, { email, password });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Error en el inicio de sesión';
    throw new Error(errorMessage);
  }
};