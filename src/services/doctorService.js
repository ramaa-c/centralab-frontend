import apiAuthenticated from './apiAuthenticated';

const DOCTORS_ENDPOINT = "/doctors";
const ESTABLISHMENTS_ENDPOINT = "/establishments";
const SPECIALTIES_ENDPOINT = "/specialties";

// Funciones de Lectura (Pueden ser usadas directamente por useApiQuery o si se requiere lógica especial)
export const getDoctorById = async (doctorId) => {
    const response = await apiAuthenticated.get(`${DOCTORS_ENDPOINT}/${doctorId}`);
    return response.data;
};

export const getDoctorEstablishments = async (doctorId) => {
    const response = await apiAuthenticated.get(`${DOCTORS_ENDPOINT}/${doctorId}/establishments`);
    return response.data;
};

export const getAllEstablishments = async () => {
    const response = await apiAuthenticated.get(ESTABLISHMENTS_ENDPOINT);
    return response.data.List || [];
};

export const getAllSpecialties = async () => {
    const response = await apiAuthenticated.get(SPECIALTIES_ENDPOINT);
    return response.data;
};

// Funciones de Mutación (Simplificadas - Usadas dentro de useUpdateDoctorProfile)

export const updateDoctor = async (payload) => {
    const response = await apiAuthenticated.put(DOCTORS_ENDPOINT, payload);
    return response.data;
};

export const addDoctorEstablishment = async (doctorId, establishmentId) => {
    const response = await apiAuthenticated.post(`${DOCTORS_ENDPOINT}/${doctorId}/establishments`, {
        EstablecimientoID: establishmentId,
        MedicoID: doctorId,
        Activo: "0" // Asumo que no se activa por defecto
    });
    return response.data;
};

export const removeDoctorEstablishment = async (doctorId, establishmentId) => {
    const response = await apiAuthenticated.delete(`${DOCTORS_ENDPOINT}/${doctorId}/establishments/${establishmentId}`);
    return response.data;
};

export const setActiveEstablishmentForDoctor = async (doctorId, establishmentId) => {
    const response = await apiAuthenticated.put(`${DOCTORS_ENDPOINT}/${doctorId}/activeEstablishment`, {
        EstablecimientoID: establishmentId
    });
    return response.data;
};