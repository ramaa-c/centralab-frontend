import { useState, useEffect, useRef, useCallback } from "react";
import { obtenerPacientes } from "../services/patientService";

const cache = new Map();

export const usePatients = (doctorId, options = {}) => {
  const {
    ttl = 300000,
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
      
      const currentSearch = searchDni.trim();
      
      if (currentSearch.length > 0 && currentSearch.length < 5 && reset) {
          setPatients([]);
          setHasMore(false);
          setLoading(false);
          return;
      }

      const currentPage = reset ? 1 : page;
      const cached = cache.get(cacheKey);

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
          id_number: currentSearch,
        });

        setPatients((prev) =>
          reset ? pacientes : [...prev, ...pacientes]
        );

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

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    
    const currentSearchLength = searchDni.trim().length;

    if (currentSearchLength > 0 && currentSearchLength < 5) {
      setPatients([]);
      setHasMore(false);
      return;
    }

    debounceTimer.current = setTimeout(() => {
      fetchData({ reset: true });
      setPage(1);
    }, debounceMs);

    return () => clearTimeout(debounceTimer.current);
  }, [searchDni]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

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