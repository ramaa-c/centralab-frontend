import api from './apiAuthenticated'; 

const DOCTORS_ENDPOINT = "/doctors";
const ESTABLECIMIENTOS_ENDPOINT = "/establishments";

export const getDoctorById = async (doctorId) => {
  try {
    const response = await api.get(`${DOCTORS_ENDPOINT}/${doctorId}`);
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
    const response = await api.get(`${DOCTORS_ENDPOINT}/${doctorId}/establishments`);
    return response.data.List || [];
  } catch (error) {
    console.error("Error fetching doctor establishments:", error);
    throw error;
  }
};

export const addDoctorEstablishment = async (doctorId, establishmentId) => {
  try {
    const response = await api.post(`${DOCTORS_ENDPOINT}/${doctorId}/establishments/${establishmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error adding doctor establishment:", error);
    throw error;
  }
};

export const removeDoctorEstablishment = async (doctorId, establishmentId) => {
  try {
    const response = await api.delete(`${DOCTORS_ENDPOINT}/${doctorId}/establishments/${establishmentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error removing doctor establishment:", error);
    throw error;
  }
};

export const updateDoctor = async (doctorData) => {
  try {
    const response = await api.put(DOCTORS_ENDPOINT, doctorData);
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
export const setActiveEstablishmentForDoctor = async (doctorId, activeEstablishmentId) => {
  try {
    const response = await api.get(`${DOCTORS_ENDPOINT}/${doctorId}/establishments`);
    const allEstablishments = response.data?.List || [];

    const updateCalls = allEstablishments.map((est) => {
      const isActive = est.EstablecimientoID === Number(activeEstablishmentId);
      return api.post(
        `${DOCTORS_ENDPOINT}/${doctorId}/establishments/${est.EstablecimientoID}`,
        { Activo: isActive ? 1 : 0 }
      );
    });

    await Promise.all(updateCalls);
    console.log("Establecimiento activo actualizado correctamente en la base de datos.");

    return true;
  } catch (error) {
    console.error("Error al cambiar establecimiento activo:", error);
    throw error;
  }
};
