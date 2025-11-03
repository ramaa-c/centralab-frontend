import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user, isLoggedIn } = useAuth();

  if (isLoggedIn && user) {

    if (user.must_change_password || user.must_change_password === "1") {
      return <Navigate to="/cambiarclave" replace />;
    }
    return <Navigate to="/prescripciones" replace />;
  }

  return children;
}
