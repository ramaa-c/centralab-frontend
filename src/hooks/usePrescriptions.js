import { useState, useEffect, useRef, useCallback } from "react";
import { obtenerRecetas } from "../services/prescriptionService";

const cache = new Map();

export const usePrescriptions = (doctorId, options = {}) => {
  const {
    ttl = 300000, // 5 minutos de cache
    pageSize = 15,
    debounceMs = 300,
    patientId = null, // nuevo filtro opcional
  } = options;

  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  // 🔑 Clave de cache dinámica (por doctor + paciente)
  const cacheKey = `prescriptions_${doctorId || "all"}_${patientId || "none"}`;

  /**
   * 📡 Función principal para traer recetas (paginadas)
   */
  const fetchData = useCallback(
    async ({ reset = false } = {}) => {
      if (loading) return;

      const currentPage = reset ? 1 : page;
      const cached = cache.get(cacheKey);

      // 🧠 Usa cache si es válida y no se solicitó reset
      if (!reset && cached && Date.now() - cached.timestamp < ttl) {
        setPrescriptions(cached.data);
        setHasMore(cached.hasMore);
        return;
      }

      try {
        setLoading(true);

        const { recetas, meta } = await obtenerRecetas({
          doctor_id: doctorId,
          patient_id: patientId,
          page: currentPage,
          page_size: pageSize,
        });

        // 📦 Mezclar nuevas recetas o reiniciar lista
        setPrescriptions((prev) =>
          reset ? recetas : [...prev, ...recetas]
        );

        // 🔍 Determinar si hay más páginas
        const more = meta?.has_next_page ?? recetas.length === pageSize;
        setHasMore(more);

        // 💾 Guardar en cache
        cache.set(cacheKey, {
          data: reset ? recetas : [...(cached?.data || []), ...recetas],
          hasMore: more,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error("❌ Error al obtener recetas:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [doctorId, patientId, page, pageSize, ttl, loading]
  );

  /**
   * 🔁 Efecto para cargar recetas iniciales o al cambiar paciente
   */
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchData({ reset: true });
      setPage(1);
    }, debounceMs);

    return () => clearTimeout(debounceTimer.current);
  }, [doctorId, patientId]);

  /**
   * 📜 Cargar más recetas (paginación)
   */
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  /**
   * ⏱️ Efecto para cambio de página
   */
  useEffect(() => {
    if (page > 1) fetchData();
  }, [page]);

  return {
    prescriptions,
    loading,
    error,
    hasMore,
    loadMore,
    refresh: () => fetchData({ reset: true }),
  };
};
