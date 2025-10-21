// En hooks/useCrearPaciente.js

import { useApiMutation } from "./useApiMutation";
import { crearPaciente } from "../services/patientService"; // Tu función de servicio

export const useCrearPaciente = (options = {}) => {
  return useApiMutation(
    'post', 
    '/api/patients', // Endpoint de referencia (para el toast genérico)
    ['/api/patients'], // Clave de caché a invalidar (refresca la lista en Prescripciones.jsx)
    {
      mutationFn: crearPaciente, // Usamos directamente tu función de servicio como mutationFn
      
      onSuccess: (data, variables, context) => {
        // Lógica de éxito específica
        console.log("Paciente creado con éxito:", data);
        
        // Ejecuta el onSuccess pasado en options (ej. cerrar el modal)
        if (options.onSuccess) {
            options.onSuccess(data, variables, context);
        }
      },
      // El onError es manejado globalmente por useApiMutation, que toma el error lanzado por crearPaciente.
      ...options,
    }
  );
};