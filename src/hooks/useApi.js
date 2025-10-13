import { useState, useEffect } from "react";
import axios from "axios";

const normalizeToArray = (respData) => {
  if (!respData && respData !== 0) return [];
  if (Array.isArray(respData)) return respData;
  if (Array.isArray(respData.List)) return respData.List;
  if (Array.isArray(respData.list)) return respData.list;
  if (Array.isArray(respData.data)) return respData.data;
  return [respData];
};

export const useApi = (endpoint, autoFetch = true) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (url = endpoint) => {
    try {
      setLoading(true);
      const response = await axios.get(url);
      const result = normalizeToArray(response.data);
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Error al obtener datos:", err);
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && endpoint) fetchData(endpoint);
  }, [endpoint]);

  return { data, error, loading, fetchData };
};