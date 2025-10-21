import { useApiMutation } from "./useApiMutation";

export const useEliminarPrescripcion = (options = {}) => {
    // Definimos la mutación de tipo 'delete'. 
    // El endpoint se construye dentro del mutationFn.
    // La lista a invalidar es '/api/prescriptions'.
    return useApiMutation(
        'delete', 
        '', // El endpoint base es vacío, lo construiremos en el mutationFn
        ['/api/prescriptions'], // Clave para forzar el refetch de la lista
        {
            // Sobreescribimos el mutationFn para construir la URL con el ID
            mutationFn: (prescriptionId) => api.delete(`/api/prescription/${prescriptionId}`),
            
            // Reemplazamos el 'alert' manual con un toast (gestionado en useApiMutation)
            onSuccess: (data, prescriptionId, context) => {
                // Aquí podrías agregar un mensaje específico si lo deseas
                // toast.success(`Prescripción ${prescriptionId} eliminada.`);
                if (options.onSuccess) {
                    options.onSuccess(data, prescriptionId, context);
                }
            },
            ...options,
        }
    );
};