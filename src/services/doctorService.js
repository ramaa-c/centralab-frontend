import api from "./api";
import apiAuthenticated from './apiAuthenticated'; 

const DOCTORS_ENDPOINT = "/doctors";
const ESTABLECIMIENTOS_ENDPOINT = "/establishments";

export const getDoctorById = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    throw error;
  }
};

export const getAllEstablishments = async () => {
  try {
    const response = await api.get(ESTABLECIMIENTOS_ENDPOINT);
    return response.data.List || [];
  } catch (error) {
    console.error("Error fetching establishments:", error);
    throw error;
  }
};

export const getDoctorEstablishments = async (doctorId) => {
  try {
    const response = await api.get(`/doctors/${doctorId}/establishments`);
    return response.data.List || [];
  } catch (error) {
    console.error("Error fetching doctor establishments:", error);
    throw error;
  }
};

export const addDoctorEstablishment = async (doctorId, establishmentId) => {
  try {
    const response = await api.post(
      `/doctors/${doctorId}/establishments/${establishmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error adding doctor establishment:", error);
    throw error;
  }
};

export const removeDoctorEstablishment = async (doctorId, establishmentId) => {
  try {
    const response = await api.delete(
      `/doctors/${doctorId}/establishments/${establishmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing doctor establishment:", error);
    throw error;
  }
};

export const updateDoctor = async (doctorData) => {
  try {
    const response = await apiAuthenticated.put(DOCTORS_ENDPOINT, doctorData);
    return response.data;
  } catch (error) {
    console.error("Error al actualizar los datos del doctor:", error);
    const msg = error.response?.data?.message || 'Error al actualizar los datos';
    throw new Error(msg);
  }
};

export const getAllSpecialties = async () => {
  try {
    const response = await api.get('/specialties'); 
    return response.data;
  } catch (error) {
    console.error("Error al obtener especialidades:", error);
    throw error;
  }
};