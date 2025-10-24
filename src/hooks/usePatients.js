import { useState, useEffect, useRef, useCallback } from "react";
import { obtenerPacientes } from "../services/patientService";

// 🧩 Cache en memoria para evitar recargas innecesarias
const cache = new Map();

export const usePatients = (doctorId, options = {}) => {
  const {
    ttl = 300000, // 5 min de cache
    pageSize = 15,
    debounceMs = 300,
  } = options;

  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchDni, setSearchDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  const cacheKey = `patients_${doctorId || "all"}_${searchDni || "none"}`;

  const fetchData = useCallback(
    async ({ reset = false } = {}) => {
      if (loading) return;

      const currentPage = reset ? 1 : page;
      const cached = cache.get(cacheKey);

      // 🧠 Usa cache si sigue siendo válida y no hay búsqueda nueva
      if (!reset && cached && Date.now() - cached.timestamp < ttl) {
        setPatients(cached.data);
        setHasMore(cached.hasMore);
        return;
      }

      try {
        setLoading(true);

        const { pacientes, meta } = await obtenerPacientes({
          doctor_id: doctorId,
          page: currentPage,
          page_size: pageSize,
          id_number: searchDni || "",
        });

        setPatients((prev) =>
          reset ? pacientes : [...prev, ...pacientes]
        );

        // Si no hay más resultados, hasMore = false
        const more = meta?.has_next_page ?? pacientes.length === pageSize;
        setHasMore(more);

        cache.set(cacheKey, {
          data: reset ? pacientes : [...(cached?.data || []), ...pacientes],
          hasMore: more,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.error("❌ Error al obtener pacientes:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [doctorId, page, pageSize, searchDni, ttl, loading]
  );

  // 🔍 Efecto para búsqueda por DNI (con debounce)
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchData({ reset: true });
      setPage(1);
    }, debounceMs);

    return () => clearTimeout(debounceTimer.current);
  }, [searchDni]);

  // 📜 Cargar más resultados
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  // ⏱️ Efecto para cambio de página
  useEffect(() => {
    if (page > 1) fetchData();
  }, [page]);

  return {
    patients,
    loading,
    error,
    hasMore,
    searchDni,
    setSearchDni,
    loadMore,
    refresh: () => fetchData({ reset: true }),
  };
};