import api from './api';

// --- Login ---
const LOGIN_ENDPOINT = "/api/auth/login"; // reemplazá con la real

export const login = async (email, password) => {
  try {
    console.log("Simulando login con:", { email, password });

    /* Simulación de respuesta
    return {
      token: "simulated-token-123",
      doctor_id: 1,
      doctor_name: "Dr. Simulado",
      doctor_email: email,
      doctor_specialty: "Cardiología",
      must_change_password: false
    };*/

    // Para API real:
     const response = await api.post(LOGIN_ENDPOINT, { email, password });
     return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message || 'Error en el login';
    throw new Error(msg);
  }
};

// --- Registro ---
const REGISTER_ENDPOINT = "http://tu-servidor/api/registro"; // reemplazá con la real

export const register = async (userData) => {
  try {
    console.log("Simulando registro con:", userData);

    // Simulación de respuesta
    return {
      id: 1,
      ...userData
    };

    // Para API real:
    // const response = await api.post(REGISTER_ENDPOINT, userData);
    // return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error en el registro';
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