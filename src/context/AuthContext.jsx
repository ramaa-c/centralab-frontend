import React, { createContext, useState, useContext, useEffect } from "react";
import { queryClient } from "../queryClient";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService";
import api from "../services/apiAuthenticated";
import { toast } from "react-toastify";

const AuthContext = createContext();

const STATIC_QUERY_OPTIONS = {
  staleTime: Infinity, 
  cacheTime: Infinity,
};

const STATIC_ENDPOINTS = [
  "/diagnostics",
  "/private_healthcares",
  "/tests/all",
  "/RD/PrescriptionOrder",
  "/sexs",
  "/identificationtypes",
  "/establishments",
  "/specialties",
];

const prefetchFetcher = async (endpoint) => {
    const { data } = await api.get(endpoint);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.List)) return data.List;
    if (Array.isArray(data.data)) return data.data;
    return data;
};


export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  const prefetchInitialData = async (doctorId) => {
    try {
      console.log("⚡ Prefetching datos iniciales...");

      const prefetchPromises = [];
      
      STATIC_ENDPOINTS.forEach(endpoint => {
          prefetchPromises.push(
              queryClient.prefetchQuery({
                  queryKey: [endpoint.includes('?') ? endpoint.split('?')[0] : endpoint],
                  queryFn: () => prefetchFetcher(endpoint),
                  ...STATIC_QUERY_OPTIONS,
              })
          );
      });
      
      if (doctorId) {
          prefetchPromises.push(
              queryClient.prefetchQuery({
                  queryKey: ["doctor", doctorId], 
                  queryFn: () => prefetchFetcher(`/doctors/${doctorId}`),
              })
          );
          prefetchPromises.push(
              queryClient.prefetchQuery({
                  queryKey: ["doctorEstablishments", doctorId], 
                  queryFn: () => prefetchFetcher(`/doctors/${doctorId}/establishments`),
              })
          );
          prefetchPromises.push(
              queryClient.prefetchQuery({
                  queryKey: ["metricas"], 
                  queryFn: () => prefetchFetcher("/RD/Info"),
              })
          );
      }
      
      await Promise.all(prefetchPromises);
      console.log("✅ Prefetch inicial completado");

    } catch (err) {
      console.error("❌ Error en prefetchInitialData:", err);
    }
  };

  const login = async (credentials) => {
    try {
      console.log("🚀 Iniciando login...");
      const { user: loggedInUser, token } = await loginService(credentials);

      localStorage.setItem("user", JSON.stringify(loggedInUser));

      if (token && token !== "") {
          localStorage.setItem("token", token);
          api.defaults.headers.Authorization = `Bearer ${token}`;
      } else {
          localStorage.removeItem("token");
          api.defaults.headers.Authorization = null;
      }

      setUser(loggedInUser);

      await prefetchInitialData(loggedInUser.id || loggedInUser.DoctorID);

      if (loggedInUser.must_change_password) {
        navigate("/cambiarclave");
      } else {
        navigate("/prescripciones");
      }

      toast.success(`Bienvenido ${loggedInUser.nombre || ""}`);
    } catch (error) {
      console.error("❌ Error en login:", error);
      toast.error("Error al iniciar sesión");
      throw error;
    }
  };

  const logout = () => {
    console.log("🔒 Cerrando sesión...");

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.clear();
    setUser(null);

    api.defaults.headers.Authorization = null;

    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      console.log("🔁 Rehidratando sesión existente...");
      api.defaults.headers.Authorization = (token && token !== "") ? `Bearer ${token}` : null;

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      prefetchInitialData(parsedUser.id || parsedUser.DoctorID).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const updateActiveEstablishment = (newEstablishmentId) => {
    if (!user) return;

    const updatedUser = { ...user, establecimientoId: Number(newEstablishmentId) };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isLoggedIn = !!user;

  const value = {
    user,
    isLoggedIn,
    login,
    logout,
    updateActiveEstablishment,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);