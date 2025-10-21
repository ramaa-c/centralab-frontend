import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService";
import api from "../services/apiAuthenticated";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

  // 🧠 Caché en memoria compartida (igual que en useApi)
  const memoryCache = new Map();

  // 🧩 Función genérica para precargar endpoints estáticos
  const prefetchStaticData = async () => {
    const staticEndpoints = [
      "/api/diagnostics",
      "/api/private_healthcares",
      "/api/tests/all",
      "/api/RD/PrescriptionOrder",
    ];

    const ttl = 24 * 60 * 60 * 1000; // 24h

    await Promise.all(
      staticEndpoints.map(async (endpoint) => {
        try {
          const response = await api.get(endpoint);
          const result = Array.isArray(response.data) ? response.data : response.data.List || response.data.data || [];
          const cachedValue = { data: result, timestamp: Date.now() };

          // 🧠 Guardar en memoria
          memoryCache.set(endpoint, cachedValue);

          // 💾 Guardar en localStorage
          localStorage.setItem(`cache_${endpoint}`, JSON.stringify(cachedValue));

          console.log(`✅ Prefetch completado para ${endpoint} (${result.length} registros)`);
        } catch (error) {
          console.error(`❌ Error precargando ${endpoint}:`, error);
        }
      })
    );
  };

  // 🔐 Login normal con prefetch
  const login = async (credentials) => {
    try {
      const { user: loggedInUser } = await loginService(credentials);

      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      // 🚀 Precarga de datos estáticos
      await prefetchStaticData();

      if (loggedInUser.must_change_password) {
        navigate("/cambiarclave");
      } else {
        navigate("/prescripciones");
      }
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Cerrando sesión...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 💣 Limpieza opcional del caché
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("cache_")) localStorage.removeItem(key);
    });

    setUser(null);
    navigate("/login");
  };

  const updateActiveEstablishment = (newEstablishmentId) => {
    if (!user) return;
    const updatedUser = { ...user, establecimientoId: Number(newEstablishmentId) };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isLoggedIn = !!user;
  const value = { user, isLoggedIn, login, logout, updateActiveEstablishment };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
