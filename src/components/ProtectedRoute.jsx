import React from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
    // 🔑 Obtener el estado de login del contexto
    const { isLoggedIn } = useAuth(); 

    if (!isLoggedIn) {
        // Si no está logueado, redirige al login y limpia el historial
        return <Navigate to="/login" replace />;
    }

    // Si está logueado, muestra el contenido
    return children;
}