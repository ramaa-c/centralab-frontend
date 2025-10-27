import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService";
import api from "../services/apiAuthenticated";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error al parsear user desde localStorage:", e);
      return null;
    }
  });

  const memoryCache = new Map();

  const prefetchStaticData = async () => {
    const staticEndpoints = [
      "/diagnostics",
      "/private_healthcares",
      "/tests/all",
      "/RD/PrescriptionOrder",
    ];

    const ttl = 24 * 60 * 60 * 1000;

    await Promise.all(
      staticEndpoints.map(async (endpoint) => {
        try {
          const response = await api.get(endpoint);
          const result = Array.isArray(response.data)
            ? response.data
            : response.data.List || response.data.data || [];
          const cachedValue = { data: result, timestamp: Date.now() };

          memoryCache.set(endpoint, cachedValue);

          localStorage.setItem(`cache_${endpoint}`, JSON.stringify(cachedValue));

        } catch (error) {
          console.error(`Error precargando ${endpoint}:`, error);
        }
      })
    );
  };

  const login = async (credentials) => {
    try {
      const { user: loggedInUser } = await loginService(credentials);

      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      prefetchStaticData();

      return loggedInUser;
      
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const updateActiveEstablishment = (newEstablishmentId) => {
    if (!user) return;

    const updatedUser = { ...user, establecimientoId: Number(newEstablishmentId) };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    console.log("Cerrando sesión...");

    localStorage.removeItem("user");
      
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("cache_/") || key.startsWith("doctor_")) {
        localStorage.removeItem(key);
      }
    });

    setUser(null);
    navigate("/login");
  };

  const isLoggedIn = !!user;

  const value = {
    user,
    isLoggedIn,
    login,
    logout,
    updateActiveEstablishment,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
