// En services/patientService.js
// Asumo que 'api' y 'apiAuthenticated' son el mismo objeto en tu contexto
import api from './apiAuthenticated'; // Usar la misma instancia de Axios autenticada

const PACIENTES_ENDPOINT = "/patients";

// 1. Crear Paciente (solo realiza la llamada)
export const crearPaciente = async (pacienteData) => {
    // Si la llamada falla, Axios lanzará el error, el cual será capturado por useApiMutation.
    const response = await api.post(PACIENTES_ENDPOINT, pacienteData); 
    return response.data;
};

// 2. Editar Paciente (solo realiza la llamada)
export const editarPaciente = async (pacienteData) => {
    // Si la llamada falla, Axios lanzará el error.
    const response = await api.put(PACIENTES_ENDPOINT, pacienteData);
    return response.data;
};

// Nota: Puedes considerar renombrar este archivo a algo como 'patientFetchers.js' 
// o 'patientApi.js' para reflejar su nueva función.