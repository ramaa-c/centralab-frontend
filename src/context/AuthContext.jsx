import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService";
import api from "../services/apiAuthenticated";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // 🧠 Leer usuario desde localStorage con manejo seguro
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("⚠️ Error al parsear user desde localStorage:", e);
      return null;
    }
  });

  // 🔄 Caché en memoria compartida (para evitar múltiples fetchs)
  const memoryCache = new Map();

  // ⚙️ Precarga de endpoints estáticos con cache local
  const prefetchStaticData = async () => {
    const staticEndpoints = [
      "/api/diagnostics",
      "/api/private_healthcares",
      "/api/tests/all",
      "/api/RD/PrescriptionOrder",
    ];

    const ttl = 24 * 60 * 60 * 1000; // 24 horas

    await Promise.all(
      staticEndpoints.map(async (endpoint) => {
        try {
          const response = await api.get(endpoint);
          const result = Array.isArray(response.data)
            ? response.data
            : response.data.List || response.data.data || [];
          const cachedValue = { data: result, timestamp: Date.now() };

          // 🧠 Guardar en memoria
          memoryCache.set(endpoint, cachedValue);

          // 💾 Guardar en localStorage (para persistencia entre sesiones)
          localStorage.setItem(`cache_${endpoint}`, JSON.stringify(cachedValue));

          console.log(`✅ Prefetch completado: ${endpoint} (${result.length} registros)`);
        } catch (error) {
          console.error(`❌ Error precargando ${endpoint}:`, error);
        }
      })
    );
  };

  // 🔐 Login profesional con prefetch + redirección segura
  const login = async (credentials) => {
    try {
      const { user: loggedInUser } = await loginService(credentials);

      // Guardar en localStorage
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);

      // 🚀 Precarga paralela de datos estáticos
      prefetchStaticData();

      // Redirección según estado de usuario
      if (loggedInUser.must_change_password) {
        navigate("/cambiarclave");
      } else {
        navigate("/prescripciones");
      }
    } catch (error) {
      console.error("💥 Error en login:", error);
      throw error;
    }
  };

  // 🏥 Actualizar establecimiento activo
  const updateActiveEstablishment = (newEstablishmentId) => {
    if (!user) return;

    const updatedUser = { ...user, establecimientoId: Number(newEstablishmentId) };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // 🚪 Logout completo con limpieza de caché y sesión
  const logout = () => {
    console.log("🔒 Cerrando sesión...");

    // Borrar datos persistentes
    localStorage.removeItem("user");

    // 🧹 Limpiar caché local
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("cache_/")) localStorage.removeItem(key);
    });

    // Resetear sesión
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
