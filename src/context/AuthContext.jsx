import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Leer el usuario del localStorage al inicio
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem("user");
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Error al parsear user desde localStorage:", e);
            return null;
        }
    });

    // 2. Variable CLAVE: Es TRUE si existe el objeto user
    const isLoggedIn = !!user; 

    const login = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        // Tu lógica de borrado: borra el ítem de 'user'
        localStorage.removeItem("user");
        // Asegúrate de que, si borras otros ítems como 'password', los añadas aquí.
        
        setUser(null);
    };

    const authContextValue = {
        user,
        isLoggedIn, // Este valor es el que usa ProtectedRoute
        login,
        logout
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);