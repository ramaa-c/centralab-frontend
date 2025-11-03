import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!isLoggedIn || !user) return <Navigate to="/login" replace />;

  if (user.must_change_password || user.must_change_password === "1") {
    return <Navigate to="/cambiarclave" replace />;
  }

  return children;
}
