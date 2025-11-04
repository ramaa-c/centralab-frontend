import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { obtenerPacientes } from "../services/patientService";

export const usePatients = (options = {}) => {
  const { ttl = 300000, pageSize = 15, debounceMs = 300 } = options;

  const cacheRef = useRef(new Map());

  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchDni, setSearchDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimer = useRef(null);
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const cacheKey = useMemo(
    () => `patients_search_${searchDni || "none"}`,
    [searchDni]
  );

  const fetchData = useCallback(
    async ({ reset = false, targetPage = 1 } = {}) => {
      if (loadingRef.current) return;

      const currentSearch = searchDni.trim();
      if (currentSearch.length > 0 && currentSearch.length < 5) {
        if (reset) {
          setPatients([]);
          setHasMore(false);
        }
        setLoading(false);
        return;
      }

      const currentPage = reset ? 1 : targetPage;
      const cache = cacheRef.current;
      const cached = cache.get(cacheKey);
      const now = Date.now();

      const isCacheValid =
        !reset &&
        cached &&
        now - cached.timestamp < ttl &&
        (!cached.lastPage || currentPage <= cached.lastPage);

      if (isCacheValid) {
        setPatients(cached.data);
        setHasMore(cached.hasMore);
        setPage(cached.lastPage);
        return;
      }

      try {
        setLoading(true);
        const { pacientes, meta } = await obtenerPacientes({
          page: currentPage,
          page_size: pageSize,
          id_number: currentSearch,
        });

        setPatients((prev) => (reset ? pacientes : [...prev, ...pacientes]));
        const more = meta?.has_next_page ?? pacientes.length === pageSize;
        setHasMore(more);

        if (!reset) setPage((prev) => prev + 1);

        cache.set(cacheKey, {
          data: reset ? pacientes : [...(cached?.data || []), ...pacientes],
          hasMore: more,
          lastPage: currentPage,
          timestamp: now,
        });

        const validEntries = [...cache.entries()].filter(
          ([, v]) => now - v.timestamp < ttl
        );
        sessionStorage.setItem("patients_cache", JSON.stringify(validEntries));
      } catch (err) {
        console.error("Error al obtener pacientes:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [pageSize, searchDni, ttl, cacheKey]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loadingRef.current) {
      const nextPage = page + 1;
      fetchData({ reset: false, targetPage: nextPage });
    }
  }, [hasMore, page, fetchData]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    const currentSearchLength = searchDni.trim().length;

    if (currentSearchLength > 0 && currentSearchLength < 5) {
      setPatients([]);
      setHasMore(false);
      return;
    }

    if (currentSearchLength === 0) {
      const cache = cacheRef.current;
      const cachedBase = cache.get("patients_search_none");
      if (cachedBase && cachedBase.data?.length) {
        setPatients(cachedBase.data);
        setHasMore(cachedBase.hasMore);
        setPage(cachedBase.lastPage || 1);
        return;
      }
      setHasMore(true);
    }

    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchData({ reset: true });
    }, debounceMs);

    return () => clearTimeout(debounceTimer.current);
  }, [searchDni, debounceMs, fetchData]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchData({ reset: true });
  }, [fetchData]);

  useEffect(() => {
    const stored = sessionStorage.getItem("patients_cache");
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const validEntries = parsed.filter(([, v]) => now - v.timestamp < ttl);
      const restored = new Map(validEntries);
      restored.forEach((v, k) => cacheRef.current.set(k, v));
    }
  }, [ttl]);

  useEffect(() => {
    return () => {
      cacheRef.current.clear();
    };
  }, []);

  return {
    patients,
    loading,
    error,
    hasMore,
    searchDni,
    setSearchDni,
    loadMore,
    refresh,
  };
};
