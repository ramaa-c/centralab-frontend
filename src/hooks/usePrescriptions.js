import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { obtenerRecetas } from "../services/prescriptionService";

export const usePrescriptions = (doctorId, options = {}) => {
  const {
    ttl = 300000,
    pageSize = 15,
    debounceMs = 300,
    patientId = null,
  } = options;

  const cacheRef = useRef(new Map());

  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimer = useRef(null);
  const loadingRef = useRef(loading);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const cacheKey = useMemo(
    () => `prescriptions_${doctorId || "all"}_${patientId || "none"}`,
    [doctorId, patientId]
  );

  const fetchData = useCallback(
    async ({ reset = false, targetPage = 1 } = {}) => {
      if (loadingRef.current) return;

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
        setPrescriptions(cached.data);
        setHasMore(cached.hasMore);
        setPage(cached.lastPage);
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

        setPrescriptions((prev) => (reset ? recetas : [...prev, ...recetas]));
        const more = meta?.has_next_page ?? recetas.length === pageSize;
        setHasMore(more);

        if (!reset) setPage((prev) => prev + 1);

        cache.set(cacheKey, {
          data: reset ? recetas : [...(cached?.data || []), ...recetas],
          hasMore: more,
          lastPage: currentPage,
          timestamp: now,
        });

        const validEntries = [...cache.entries()].filter(
          ([, v]) => now - v.timestamp < ttl
        );
        sessionStorage.setItem("prescriptions_cache", JSON.stringify(validEntries));
      } catch (err) {
        console.error("Error al obtener recetas:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [doctorId, patientId, pageSize, ttl, cacheKey]
  );

  const loadMore = useCallback(() => {
    if (hasMore && !loadingRef.current) {
      const nextPage = page + 1;
      fetchData({ reset: false, targetPage: nextPage });
    }
  }, [hasMore, page, fetchData]);

  useEffect(() => {
    clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchData({ reset: true });
    }, debounceMs);

    return () => clearTimeout(debounceTimer.current);
  }, [doctorId, patientId, debounceMs, fetchData]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchData({ reset: true });
  }, [fetchData]);

  useEffect(() => {
    const stored = sessionStorage.getItem("prescriptions_cache");
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
    prescriptions,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};
