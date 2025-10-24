import { useState, useEffect, useRef } from "react";
import api from "../services/apiAuthenticated";

const memoryCache = new Map();
const pendingRequests = new Map(); // 🧩 Mapa global para evitar peticiones duplicadas

const normalizeToArray = (respData) => {
  if (!respData && respData !== 0) return [];
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.List)) return respData.List;
  if (Array.isArray(respData.list)) return respData.list;
  if (Array.isArray(respData.data)) return respData.data;
  return [respData];
};

export const useApi = (endpoint, autoFetch = true, options = {}) => {
  const { cache = false, ttl = 300000, debounce = 200 } = options;
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const cacheKey = endpoint;
  const mounted = useRef(true);
  const debounceTimer = useRef(null);

  const fetchData = async (url = endpoint, { forceRefresh = false } = {}) => {
    if (!url || pendingRequests.has(url)) return; // 🚫 evita duplicado
    console.log("🔥 useApi ejecutado para:", url, "desde", new Error().stack);

    // 🧠 1. Verificar caché en memoria
    if (cache && !forceRefresh && memoryCache.has(cacheKey)) {
      const { data: cachedData, timestamp } = memoryCache.get(cacheKey);
      if (Date.now() - timestamp < ttl) {
        console.log(`💾 Cache en memoria válida para ${cacheKey}`);
        setData(cachedData);
        return;
      } else {
        memoryCache.delete(cacheKey);
      }
    }

    // 🧱 2. Verificar localStorage
    if (cache && !forceRefresh) {
      const stored = localStorage.getItem(`cache_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < ttl) {
          console.log(`📦 Cache localStorage válida para ${cacheKey}`);
          setData(parsed.data);
          return;
        } else {
          localStorage.removeItem(`cache_${cacheKey}`);
        }
      }
    }

    // 🌐 3. Evitar duplicado y hacer request real
    try {
      setLoading(true);
      pendingRequests.set(url, true); // 🚧 marca request en curso
      const response = await api.get(url);
      const result = normalizeToArray(response.data);

      if (!mounted.current) return;

      setData(result);
      setError(null);

      if (cache) {
        const cachedValue = { data: result, timestamp: Date.now() };
        memoryCache.set(cacheKey, cachedValue);
        localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(cachedValue));
      }
    } catch (err) {
      if (!mounted.current) return;
      console.error(`❌ Error al obtener datos de ${url}:`, err);
      setError(err.message || "Error al cargar datos");
    } finally {
      pendingRequests.delete(url); // ✅ libera el endpoint
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;

    if (autoFetch && endpoint) {
      // ⏱️ debounce: evita múltiples llamadas en montajes consecutivos
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        fetchData(endpoint);
      }, debounce);
    }

    return () => {
      mounted.current = false;
      clearTimeout(debounceTimer.current);
    };
  }, [endpoint]);

  return { data, error, loading, fetchData };
};
