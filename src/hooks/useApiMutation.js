// En useApiMutation.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/apiAuthenticated"; // La instancia de Axios que usas
import { toast } from "react-toastify"; // Para el manejo de errores global

/**
 * Hook genérico para manejar mutaciones (POST, PUT, DELETE) con React Query.
 *
 * @param {string} method - El método HTTP ('post', 'put', 'delete').
 * @param {string} endpoint - La ruta de la API (ej: '/api/patients').
 * @param {Array<string | Array>} queryKeysToInvalidate - QueryKeys a invalidar después del éxito (ej: ['/api/patients']).
 * @param {object} options - Opciones adicionales para useMutation.
 * @returns {object} El objeto de mutación de React Query.
 */
export const useApiMutation = (method, endpoint, queryKeysToInvalidate = [], options = {}) => {
  const queryClient = useQueryClient();

  const mutationFn = async (data) => {
    // Asegura que el método exista en la instancia de Axios
    const apiCall = api[method]; 
    if (!apiCall) {
      throw new Error(`Método HTTP inválido: ${method}`);
    }

    // El endpoint es opcional en la llamada, ya que el endpoint base puede 
    // venir dado por el hook.
    const response = await apiCall(endpoint, data);
    return response.data;
  };

  return useMutation({
    mutationFn,
    
    // 🔹 MANEJO DE ÉXITO GLOBAL
    onSuccess: (data, variables, context) => {
      // Invalida las queries especificadas
      queryKeysToInvalidate.forEach(key => {
        // La key puede ser un string (ej: '/api/patients') o un array (ej: ['paciente', 123])
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
      });

      // Mostrar un toast de éxito genérico (opcionalmente)
      if (options.showSuccessToast !== false) {
          toast.success(`Operación exitosa en ${endpoint}`);
      }
      
      // Ejecutar onSuccess personalizado (si se pasó en options)
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },

    // 🔹 MANEJO DE ERROR GLOBAL
    onError: (error, variables, context) => {
      console.error(`❌ Error en mutación ${method.toUpperCase()} ${endpoint}:`, error);
      
      // Mostrar un toast de error genérico
      if (options.showErrorToast !== false) {
          toast.error(`Error en operación (${endpoint}).`);
      }

      // Ejecutar onError personalizado
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    
    // Pasar cualquier otra opción de useMutation
    ...options,
  });
};