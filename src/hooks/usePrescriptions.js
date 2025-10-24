import { useState, useEffect, useCallback } from "react"; // Importamos useCallback
import { obtenerRecetas } from "../services/prescriptionService";

const cache = new Map();

/**
 * Hook para obtener prescripciones de un médico, con cache y debounce
 */
export const usePrescriptions = (doctorId, options = {}) => {
  const { ttl = 300000, debounceMs = 300 } = options;
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cacheKey = `prescriptions_${doctorId}`;

  // 1. Definimos fetchData/refetch usando useCallback para que la función sea estable
  const fetchData = useCallback(async (bypassCache = false) => {
    if (!doctorId) return;

    if (!bypassCache) {
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < ttl) {
            setPrescriptions(cached.data);
            setLoading(false);
            return;
        }
    }

    setLoading(true);
    try {
        const response = await obtenerRecetas(doctorId);
        setPrescriptions(response);
        cache.set(cacheKey, { data: response, timestamp: Date.now() });
        return response; // Opcional: devolver la respuesta
    } catch (err) {
        console.error("Error al obtener prescripciones:", err);
        setError(err);
    } finally {
        setLoading(false);
    }
  }, [doctorId, ttl]); // Dependencias para useCallback

  // 2. Modificamos el useEffect para usar la función estable fetchData
  useEffect(() => {
    if (!doctorId) return;
    
    // Si hay un debounce, usamos un timeout; si no, la llamamos directamente.
    if (debounceMs > 0) {
        const timeoutId = setTimeout(() => fetchData(), debounceMs);
        return () => clearTimeout(timeoutId);
    } else {
        fetchData();
    }
  }, [doctorId, debounceMs, fetchData]); // Incluimos fetchData como dependencia

  // 3. ¡Exponemos fetchData con el nombre refetch!
  return { prescriptions, loading, error, refetch: fetchData }; 
};