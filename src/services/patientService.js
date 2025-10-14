import apiAuthenticated from './apiAuthenticated';

const PATIENTS_ENDPOINT = "/patients";

export const editarPaciente = async (pacienteData) => {
  try {
    const response = await apiAuthenticated.put(PATIENTS_ENDPOINT, pacienteData);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al actualizar el paciente';
    throw new Error(msg);
  }
};