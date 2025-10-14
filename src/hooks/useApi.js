import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Hook genérico para interactuar con APIs REST (GET, POST, PUT, DELETE)
 * @param {string} url - Endpoint base (ej: /api/pacientes)
 * @param {boolean} autoFetch - Si debe hacer GET automáticamente al montar (default: true)
 */
export function useApi(url, autoFetch = true) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(autoFetch);

  // ✅ GET automático
  useEffect(() => {
    if (autoFetch) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // -----------------------
  // 🔹 Métodos API
  // -----------------------

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(url);
      const result = response.data.List || response.data || [];
      setData(result);
      setError(null);
    } catch (err) {
      console.error(`❌ Error GET ${url}:`, err);
      setError(err.response?.data?.message || "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const createData = async (payload) => {
    setLoading(true);
    try {
      const response = await axios.post(url, payload);
      setData((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error(`❌ Error POST ${url}:`, err);
      setError(err.response?.data?.message || "Error al crear el recurso");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (id, payload) => {
    setLoading(true);
    try {
      const response = await axios.put(`${url}/${id}`, payload);
      setData((prev) => prev.map((item) => (item.id === id ? response.data : item)));
      return response.data;
    } catch (err) {
      console.error(`❌ Error PUT ${url}/${id}:`, err);
      setError(err.response?.data?.message || "Error al actualizar el recurso");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${url}/${id}`);
      setData((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (err) {
      console.error(`❌ Error DELETE ${url}/${id}:`, err);
      setError(err.response?.data?.message || "Error al eliminar el recurso");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Devuelve todo lo necesario
  return {
    data,
    error,
    loading,
    fetchData,   // GET manual
    createData,  // POST
    updateData,  // PUT
    deleteData,  // DELETE
  };
}
