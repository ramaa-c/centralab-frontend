import api from "./apiAuthenticated";

const PACIENTES_ENDPOINT = "/patients";

export const obtenerPacientes = async ({
  page = 1,
  page_size = 15,
  id_number = "",
  retries = 3,
  delay = 1000,
} = {}) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const params = {
        page,
        page_size,
        ...(id_number && { id_number }),
      };

      const response = await api.get(PACIENTES_ENDPOINT, { params });

      const pacientes = response.data?.List || [];
      const meta = response.data?.Meta || {};

      return { pacientes, meta };
    } catch (error) {
      if (attempt === retries) {
        const msg =
          error.response?.data?.message ||
          "Error al obtener la lista de pacientes después de varios intentos";
        throw new Error(msg);
      }

      const backoff = delay * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
};

export const crearPaciente = async (pacienteData) => {
  try {
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