// En hooks/useRegistroDoctor.js

import { useApiMutation } from "./useApiMutation";
import { register as registerService } from "../services/authService"; 
import { toast } from "react-toastify";

export const useRegistroDoctor = (options = {}) => {
  return useApiMutation(
    'post', 
    '/doctors', // Endpoint de referencia para el toast genérico
    [], // No hay keys para invalidar después de un registro
    {
      // Usamos la función de servicio simplificada como mutationFn
      mutationFn: registerService, 
      
      onSuccess: (data, variables, context) => {
        // Mantenemos el toast de éxito global (el toast.error ya se maneja en useApiMutation)
        toast.success("Registro completado. Ahora puedes iniciar sesión."); 
        
        if (options.onSuccess) {
            options.onSuccess(data, variables, context);
        }
      },
      // El onError no se necesita aquí ya que useApiMutation lo centraliza,
      // pero si quieres un log o toast específico, lo pondrías en options.onError.
      ...options,
    }
  );
};