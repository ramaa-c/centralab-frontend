import api from './api';

const LOGIN_ENDPOINT = "/auth/login";
const DOCTORS_ENDPOINT = "/doctors";

export const login = async (identifier, password) => {
  try {
    const isEmail = identifier.includes('@');
    const queryParam = isEmail ? `Email=${identifier}` : `DNI=${identifier}`;

    const searchResponse = await api.get(`${DOCTORS_ENDPOINT}?${queryParam}`);

    if (!searchResponse.data || searchResponse.data.List?.length === 0) {
      throw new Error('El DNI o Email no se encuentra registrado.');
    }

    const doctorId = searchResponse.data.List[0].MedicoID;

    const loginResponse = await api.post(LOGIN_ENDPOINT, {
      doctor_id: String(doctorId),
      password: password,
    });

    return loginResponse.data;

  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Error en el login';
    throw new Error(msg);
  }
};

// --- Crear Paciente ---
const PACIENTE_ENDPOINT = "http://tu-servidor/api/pacientes"; // reemplazá con la real

export const crearPaciente = async (pacienteData) => {
  try {
    console.log("Simulando creación de paciente con:", pacienteData);

    // Simulación de respuesta
    return {
      id: 1,
      ...pacienteData
    };

    // Para API real:
    // const response = await api.post(PACIENTE_ENDPOINT, pacienteData);
    // return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al crear el paciente';
    throw new Error(msg);
  }
};

// --- Crear Receta ---
const RECETA_ENDPOINT = "http://tu-servidor/api/recetas"; // reemplazá con la real

export const crearReceta = async (recetaData) => {
  try {
    console.log("Simulando creación de receta con:", recetaData);

    // Simulación de respuesta
    return {
      id: 1,
      ...recetaData
    };

    // Para API real:
    // const response = await api.post(RECETA_ENDPOINT, recetaData);
    // return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al crear la receta';
    throw new Error(msg);
  }
};
// ------------------- NUEVO PACIENTE -------------------
const NUEVO_PACIENTE_ENDPOINT = "http://tu-servidor/api/pacientes"; // reemplazá con la real

export const crearNuevoPaciente = async (pacienteData) => {
  try {
    console.log("Simulando creación de nuevo paciente con:", pacienteData);

    // Simulación de respuesta
    return {
      id: 1,
      ...pacienteData
    };

    // Para API real:
    // const response = await api.post(NUEVO_PACIENTE_ENDPOINT, pacienteData);
    // return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al crear el nuevo paciente';
    throw new Error(msg);
  }
};

// ------------------- NUEVA RECETA -------------------
const NUEVA_RECETA_ENDPOINT = "http://tu-servidor/api/recetas"; // reemplazá con la real

export const crearNuevaReceta = async (recetaData) => {
  try {
    console.log("Simulando creación de nueva receta con:", recetaData);

    // Simulación de respuesta
    return {
      id: 1,
      ...recetaData
    };

    // Para API real:
    // const response = await api.post(NUEVA_RECETA_ENDPOINT, recetaData);
    // return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al crear la nueva receta';
    throw new Error(msg);
  }
};

// ------------------- CAMBIAR CLAVE -------------------
const CAMBIAR_CLAVE_ENDPOINT = "/doctors"; // base, completaremos con doctorId en la función

export const cambiarClave = async (doctorId, nuevaPassword) => {
  try {
    const response = await api.put(`${CAMBIAR_CLAVE_ENDPOINT}/${doctorId}/password:change`, {
      doctor_id: doctorId,
      password: nuevaPassword
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error al cambiar la contraseña';
    throw new Error(msg);
  }
};

export const register = async (userData) => {
  try {
    console.log("registro con:", userData);
    const response = await api.post(DOCTORS_ENDPOINT, userData);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error en el registro';
    throw new Error(msg);
  }
};