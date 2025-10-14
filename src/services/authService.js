import api from './api';

const LOGIN_ENDPOINT = "/auth/login";
const DOCTORS_ENDPOINT = "/doctors";
const PACIENTES_ENDPOINT = "/patients";
const RECETAS_ENDPOINT = "/prescriptions";

export const login = async (credentials) => {
  const { identifier, password } = credentials;

  const isEmail = identifier.includes('@');
  const queryParam = isEmail ? `Email=${identifier}` : `DNI=${identifier}`;
  const searchResponse = await api.get(`${DOCTORS_ENDPOINT}?${queryParam}`);

  if (!searchResponse.data || searchResponse.data.List?.length === 0) {
    throw new Error('El DNI o Email no se encuentra registrado.');
  }

  const doctorId = searchResponse.data.List[0].MedicoID;

  const response = await api.post(LOGIN_ENDPOINT, {
    doctor_id: identifier,
    password: password
  });

  const userData = response.data;

  localStorage.setItem('token', userData.token);
  localStorage.setItem('user', JSON.stringify({
    id: doctorId,
    dni: userData.doctor_id,
    name: userData.doctor_name,
    email: userData.doctor_email,
    specialty: userData.doctor_specialty,
    must_change_password: userData.must_change_password
  }));

  return userData;
};

export const cambiarClave = async (doctorId, newPassword) => {
  try {
    console.log("cambio de clave con:", doctorId, newPassword);
    const response = await api.put(`/doctors/${doctorId}/password:change`, {
      doctor_id: String(doctorId),
      password: newPassword,
    });

    return response.data;
  } catch (error) {
    const msg =
      error.response?.data?.message || "Error al cambiar la contraseña";
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

export const crearReceta = async (recetaData) => {
  try {
    console.log("Enviando receta:", recetaData);
    const response = await api.post(RECETAS_ENDPOINT, recetaData);
    return response.data;
  } catch (error) {
    console.error("Error en crearReceta:", error);
    const msg = error.response?.data?.message || "Error al crear la receta";
    throw new Error(msg);
  }
};
