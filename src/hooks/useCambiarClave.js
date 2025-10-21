// En hooks/useCambiarClave.js

import { useApiMutation } from "./useApiMutation";
import { cambiarClave } from "../services/authService"; // La función que simplificamos

export const useCambiarClave = (options = {}) => {
  return useApiMutation(
    'put', 
    '/doctors/password:change', // Endpoint de referencia para el toast genérico
    [], // No hay QueryKeys para invalidar después del cambio de clave
    {
      mutationFn: ({ doctorId, newPassword }) => cambiarClave(doctorId, newPassword),
      
      onSuccess: (data, variables, context) => {
        console.log("Clave cambiada con éxito.");
        
        // El toast global ya se dispara desde useApiMutation.
        
        // Ejecuta el onSuccess pasado en options (ej. redireccionar)
        if (options.onSuccess) {
            options.onSuccess(data, variables, context);
        }
      },
      // El manejo de onError (toast y console.error) es centralizado en useApiMutation.
      ...options,
    }
  );
};