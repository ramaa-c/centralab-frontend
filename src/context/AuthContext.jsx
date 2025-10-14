import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));

  const login = async (credentials) => {
    try {
      const { user: loggedInUser } = await loginService(credentials);

      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      
      if (loggedInUser.must_change_password) {
        navigate('/cambiarclave'); 
      } else {
        navigate('/prescripciones');
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

    setUser(null);

    navigate("/login");
  };

  const isLoggedIn = !!user;
  const value = { user, isLoggedIn, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}