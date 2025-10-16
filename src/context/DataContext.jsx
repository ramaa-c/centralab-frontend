import React, { createContext, useState, useContext, useEffect } from "react";
import { getDoctorById, getDoctorEstablishments } from "../services/doctorService";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  const [establecimientos, setEstablecimientos] = useState([]);
  const [establecimientoActivo, setEstablecimientoActivo] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setDoctor(storedUser);
      const storedEstId = localStorage.getItem("establecimientoId");
      if (storedEstId) setEstablecimientoActivo(storedEstId);

      getDoctorEstablishments(storedUser.DoctorID).then(setEstablecimientos);
    }
  }, []);

  const actualizarDoctor = async (doctorActualizado) => {
    setDoctor(doctorActualizado);
    localStorage.setItem("user", JSON.stringify(doctorActualizado));
  };

  const cambiarEstablecimiento = (nuevoEstablecimientoId) => {
    setEstablecimientoActivo(nuevoEstablecimientoId);
    localStorage.setItem("establecimientoId", nuevoEstablecimientoId);
  };

  const value = {
    doctor,
    establecimientos,
    establecimientoActivo,
    actualizarDoctor,
    cambiarEstablecimiento,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
