import { useState, useEffect } from "react";
import { getDoctorEstablishments } from "../services/doctorService";

const cache = new Map();

export const useDoctorEstablishments = (doctorId, establecimientoId, delay = 300) => {
  const [establishments, setEstablishments] = useState([]);
  const [activeEstablishment, setActiveEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const findActive = (list) => {
    if (!Array.isArray(list)) return;
    let active = list.find((e) => e.Activo === "1");
    if (!active && establecimientoId) {
      active = list.find((e) => e.EstablecimientoID === establecimientoId);
    }
    setActiveEstablishment(active || null);
  };

  useEffect(() => {
    if (!doctorId) return;

    const cacheKey = `doctor_${doctorId}_establishments`;

    // 🧠 Intentamos cargar desde cache primero
    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < 300000) {
        setEstablishments(data);
        findActive(data);
        setLoading(false);
        return;
      }
    }

    // 🌐 Debounce con setTimeout
    const handler = setTimeout(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await getDoctorEstablishments(doctorId);
          setEstablishments(response);
          findActive(response);
          cache.set(cacheKey, { data: response, timestamp: Date.now() });
        } catch (err) {
          console.error("Error al obtener establecimientos:", err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, delay);

    // Cleanup si doctorId/establecimientoId cambian antes de que pase el delay
    return () => clearTimeout(handler);
  }, [doctorId, establecimientoId, delay]);

  return { establishments, activeEstablishment, loading, error };
};
