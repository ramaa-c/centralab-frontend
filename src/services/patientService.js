import apiAuthenticated from './apiAuthenticated';

const PACIENTES_ENDPOINT = "/patients";

export const crearPaciente = async (pacienteData) => {
  try {
    console.log("Creando paciente con:", pacienteData);
    const response = await api.post(PACIENTES_ENDPOINT, pacienteData);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al crear el paciente';
    throw new Error(msg);
  }
};

export const editarPaciente = async (pacienteData) => {
  try {
    const response = await apiAuthenticated.put(PACIENTES_ENDPOINT, pacienteData);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al actualizar el paciente';
    throw new Error(msg);
  }
};