import { useApiMutation } from "./useApiMutation"; 
// Ya NO necesitas useMutation, useQueryClient o prescriptionService
// (si movemos la lógica de llamada a Axios a useApiMutation)

export const useCrearReceta = (options = {}) => {
    // 1. Usar el hook genérico para POST
    // 2. Apuntar al endpoint de recetas
    // 3. Invalidar la query que lista todas las recetas (la clave que usas en useApiQuery)
    return useApiMutation(
        'post', 
        '/api/prescriptions', 
        ['/api/prescriptions'], // <- Invalida la lista
        options // Pasa onSuccess, onError, etc.
    );
};