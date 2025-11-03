import api from './apiAuthenticated';

const LOGIN_ENDPOINT = "/auth/login";
const DOCTORS_ENDPOINT = "/doctors";

export const login = async (credentials) => {
    const { identifier, password } = credentials;

    const queryParam = `idnumber=${identifier}`; 
    
    const searchResponse = await api.get(`${DOCTORS_ENDPOINT}?${queryParam}`);
    
    if (!searchResponse.data || searchResponse.data.List?.length === 0) {
        throw new Error('El DNI o Email no se encuentra registrado.');
    }

    const isEmail = identifier.includes('@');
    
    const foundDoctor = searchResponse.data.List.find(doctor =>
        (isEmail && doctor.Email === identifier) || (!isEmail && doctor.DNI === identifier)
    );

    if (!foundDoctor) {
        throw new Error('Error de consistencia. No se encontró el médico en los resultados.');
    }

    const doctorId = foundDoctor.MedicoID; 
  console.log("ID del doctor:", doctorId);

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

export const recuperarClave = async (identificador) => {
  try {
    const isEmail = identificador.includes("@");
    const queryParam = isEmail
      ? `email=${encodeURIComponent(identificador)}`
      : `idnumber=${identificador}`;

    const searchResponse = await api.get(`${DOCTORS_ENDPOINT}?${queryParam}`);

    if (!searchResponse.data || searchResponse.data.List?.length === 0) {
      throw new Error("El DNI o Email no se encuentra registrado.");
    }

    const foundDoctor = searchResponse.data.List.find(
      (doctor) =>
        (isEmail && doctor.Email === identificador) ||
        (!isEmail && doctor.DNI === identificador)
    );

    if (!foundDoctor) {
      throw new Error("No se encontró el médico con los datos proporcionados.");
    }

    const doctorId = foundDoctor.MedicoID;
    console.log("ID del doctor encontrado:", doctorId);
    console.log("Datos del doctor encontrado:", foundDoctor);

    const resetResponse = await api.put(`${DOCTORS_ENDPOINT}/${doctorId}/password`);

    const updatePayload = {
      ...foundDoctor,
      DebeCambiarClave: "1",
    };

    const updateResponse = await api.put(DOCTORS_ENDPOINT, updatePayload);

    return (
      resetResponse.data ||
      updateResponse.data ||
      { message: "Se ha enviado un correo con la nueva contraseña." }
    );
  } catch (error) {
    console.error("Error al recuperar clave:", error);
    const msg =
      error.response?.data?.message ||
      error.message ||
      "Error al recuperar la clave.";
    throw new Error(msg);
  }
};

export const cambiarClave = async (doctorId, newPassword) => {
  try {
    const response = await api.put(`${DOCTORS_ENDPOINT}/${doctorId}/password:change`, {
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
    const response = await api.post(DOCTORS_ENDPOINT, userData);
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || 'Error en el registro';
    throw new Error(msg);
  }
};
