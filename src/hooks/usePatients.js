import { useState, useEffect } from "react";
import { obtenerPacientes } from "../services/patientService";

const cache = new Map();

/**
 * Hook para obtener pacientes con cache global, TTL y debounce
 */
export const usePatients = (doctorId, options = {}) => {
  const { ttl = 300000, debounceMs = 300 } = options; // ⏱️ debounce configurable
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId) return;

    const cacheKey = `patients_${doctorId}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      setPatients(cached.data);
      setLoading(false);
      return;
    }

    let timeoutId;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await obtenerPacientes(doctorId);
        setPatients(response);
        cache.set(cacheKey, { data: response, timestamp: Date.now() });
      } catch (err) {
        console.error("Error al obtener pacientes:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // 🧘 Espera unos ms antes de ejecutar
    timeoutId = setTimeout(fetchData, debounceMs);

    // Limpieza por si el efecto se dispara otra vez rápido
    return () => clearTimeout(timeoutId);

  }, [doctorId, ttl, debounceMs]);

  return { patients, loading, error };
};
