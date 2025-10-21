import api from './api';

const LOGIN_ENDPOINT = "/auth/login";
const DOCTORS_ENDPOINT = "/doctors";

export const login = async (credentials) => {
  const { identifier, password } = credentials;

  const isEmail = identifier.includes('@');
  const queryParam = isEmail ? `Email=${identifier}` : `DNI=${identifier}`;
  const searchResponse = await api.get(`${DOCTORS_ENDPOINT}?${queryParam}`);

  if (!searchResponse.data || searchResponse.data.List?.length === 0) {
    throw new Error('El DNI o Email no se encuentra registrado.');
  }

  const doctorId = searchResponse.data.List[0].MedicoID;
  console.log("DoctorId:", doctorId);
  console.log("Identificador dni o email:",identifier);

  const response = await api.post(LOGIN_ENDPOINT, {
    doctor_id: identifier,
    password: password
  });

  const apiResponseData  = response.data;

  const establishmentsResponse = await api.get(`${DOCTORS_ENDPOINT}/${doctorId}/establishments`);
  const establecimientos = establishmentsResponse.data?.List || [];
  const establecimientoActivo = establecimientos.find(e => String(e.Activo) === "1");

  const userToStore = {
    id: doctorId,
    dni: apiResponseData.doctor_id,
    name: apiResponseData.doctor_name,
    email: apiResponseData.doctor_email,
    specialty: apiResponseData.doctor_specialty,
    establecimientoId: establecimientoActivo?.EstablecimientoID || null,
    must_change_password: apiResponseData.must_change_password
  };

  return { user: userToStore, token: apiResponseData.token };
};

// 2. Mutación CAMBIAR CLAVE (SIMPLIFICADA)
export const cambiarClave = async (doctorId, newPassword) => {
    // Solo realiza la llamada Axios. El error lo maneja useApiMutation.
    const response = await api.put(`${DOCTORS_ENDPOINT}/${doctorId}/password:change`, {
        doctor_id: String(doctorId),
        password: newPassword,
    });
    return response.data;
};


// 3. Mutación REGISTRO (SIMPLIFICADA)
export const register = async (userData) => {
    // Solo realiza la llamada Axios. El error lo maneja useApiMutation.
    const response = await api.post(DOCTORS_ENDPOINT, userData);
    return response.data;
};