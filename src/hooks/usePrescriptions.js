import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (!doctorId) return;

    const cacheKey = `prescriptions_${doctorId}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      setPrescriptions(cached.data);
      setLoading(false);
      return;
    }

    let timeoutId;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await obtenerRecetas(doctorId);
        setPrescriptions(response);
        cache.set(cacheKey, { data: response, timestamp: Date.now() });
      } catch (err) {
        console.error("Error al obtener prescripciones:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    timeoutId = setTimeout(fetchData, debounceMs);

    return () => clearTimeout(timeoutId);

  }, [doctorId, ttl, debounceMs]);

  return { prescriptions, loading, error };
};
