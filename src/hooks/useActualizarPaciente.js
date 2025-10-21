// En hooks/useActualizarPaciente.js

import { useApiMutation } from "./useApiMutation";
import { editarPaciente } from "../services/patientService"; // Tu función de servicio

export const useActualizarPaciente = (options = {}) => {
  return useApiMutation(
    'put', 
    '/api/patients', // Endpoint de referencia
    ['/api/patients'], // Clave de caché a invalidar (refresca la lista en Prescripciones.jsx)
    {
      mutationFn: editarPaciente, // Usamos tu función de servicio
      
      onSuccess: (data, variables, context) => {
        console.log("Paciente actualizado con éxito:", data);
        
        // Ejecuta el onSuccess pasado en options
        if (options.onSuccess) {
            options.onSuccess(data, variables, context);
        }
        
        // Opcional: Si actualizas un paciente, podrías querer invalidar su query específica:
        // queryClient.invalidateQueries({ queryKey: ['paciente', variables.PacienteID] });
      },
      ...options,
    }
  );
};