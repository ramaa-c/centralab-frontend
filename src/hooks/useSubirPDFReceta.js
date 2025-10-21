// En useSubirPDFReceta.js
import { useApiMutation } from "./useApiMutation"; 
import { subirPDFReceta } from "../services/prescriptionService"; 

export const useSubirPDFReceta = (options = {}) => {
  return useApiMutation(
    'post', 
    '/api/prescription/pdf', 
    ['/api/prescriptions'], 
    {
        mutationFn: ({ recetaId, archivoBase64 }) => subirPDFReceta(recetaId, archivoBase64),

        onMutate: async (variables) => {
            console.log("📤 Mutación iniciar subida de PDF:", variables);
        },
        
        onSuccess: (data, variables, context) => {
            console.log("✅ PDF subido correctamente (Hook específico):", data);
            
            // Si necesitaras invalidar la query de una receta específica (ej. ["receta", 123]), 
            // la lógica iría aquí, después de la invalidación de la lista principal.
        },

        ...options,
    }
  );
};