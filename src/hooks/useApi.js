import { useState, useEffect, useRef } from "react";
import api from "../services/apiAuthenticated"; // tu instancia de axios autenticado

// 🧠 Caché en memoria (por sesión)
const memoryCache = new Map();

// 🧩 Normalizador (igual que antes)
const normalizeToArray = (respData) => {
  if (!respData && respData !== 0) return [];
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.List)) return respData.List;
  if (Array.isArray(respData.list)) return respData.list;
  if (Array.isArray(respData.data)) return respData.data;
  return [respData];
};

/**
 * Hook genérico para consumir APIs con soporte de caché.
 * @param {string} endpoint - Ruta del endpoint (por ejemplo, /api/tiposdocumento)
 * @param {boolean} autoFetch - Indica si debe cargar automáticamente al montar el componente.
 * @param {object} options - { cache: boolean, ttl: number }
 */
export const useApi = (endpoint, autoFetch = true, options = {}) => {
  const { cache = false, ttl = 300000 } = options; // TTL = 5 min por defecto
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const cacheKey = endpoint;
  const mounted = useRef(true);

  const fetchData = async (url = endpoint, { forceRefresh = false } = {}) => {
    if (!url) return;

    // 🧠 1. Intentar cargar desde memoria si aplica
    if (cache && !forceRefresh && memoryCache.has(cacheKey)) {
      const { data: cachedData, timestamp } = memoryCache.get(cacheKey);
      if (Date.now() - timestamp < ttl) {
        setData(cachedData);
        return;
      } else {
        memoryCache.delete(cacheKey); // expira
      }
    }

    // 🧱 2. Intentar cargar desde localStorage si está habilitado
    if (cache && !forceRefresh) {
      const stored = localStorage.getItem(`cache_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < ttl) {
          setData(parsed.data);
          return;
        } else {
          localStorage.removeItem(`cache_${cacheKey}`);
        }
      }
    }

    // 🌐 3. Petición real a la API
    try {
      setLoading(true);
      const response = await api.get(url);
      const result = normalizeToArray(response.data);

      if (!mounted.current) return;

      setData(result);
      setError(null);

      // 🧠 Guardar en memoria y localStorage
      if (cache) {
        const cachedValue = { data: result, timestamp: Date.now() };
        memoryCache.set(cacheKey, cachedValue);
        localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cachedValue));
      }
    } catch (err) {
      if (!mounted.current) return;
      console.error("Error al obtener datos:", err);
      setError(err.message || "Error al cargar datos");
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    if (autoFetch && endpoint) fetchData(endpoint);
    return () => {
      mounted.current = false;
    };
  }, [endpoint]);

  return { data, error, loading, fetchData };
};
