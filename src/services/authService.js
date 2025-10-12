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
    const errorMessage = error.response?.data?.message || error.message || 'Error en el inicio de sesión';
    throw new Error(errorMessage);
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