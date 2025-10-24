import api from "./apiAuthenticated";

const PACIENTES_ENDPOINT = "/patients";

export const obtenerPacientes = async (doctorId, retries = 3, delay = 1000) => {
  const params = doctorId ? { doctor_id: doctorId } : {};

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        doctorId
          ? `Obteniendo pacientes del doctor ${doctorId} (intento ${attempt})...`
          : `Obteniendo todos los pacientes (intento ${attempt})...`
      );

      const response = await api.get(PACIENTES_ENDPOINT, { params });

      return response.data?.List || [];
    } catch (error) {
      console.error(`Error en obtenerPacientes (intento ${attempt}):`, error);

      if (attempt === retries) {
        const msg =
          error.response?.data?.message ||
          "Error al obtener la lista de pacientes después de varios intentos";
        throw new Error(msg);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

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
    const response = await api.put(PACIENTES_ENDPOINT, pacienteData);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al actualizar el paciente';
    throw new Error(msg);
  }
};