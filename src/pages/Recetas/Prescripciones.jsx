import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import NuevaRecetaModal from "./NuevaRecetaModal";
import NuevoPacienteModal from "../Pacientes/NuevoPacienteModal";
import EditarPacienteModal from "../Pacientes/EditarPacienteModal";
import "../../styles/prescripciones.css";
// Si usas Font Awesome en este archivo, descomenta la línea
// import '@fortawesome/fontawesome-free/css/all.min.css'; 

const Prescripciones = () => {
  const [showRecetaModal, setShowRecetaModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showEditarPacienteModal, setShowEditarPacienteModal] = useState(false);
  const { data: pacientes, loading: loadingPacientes, error: errorPacientes, fetchData: fetchPacientes } = useApi("/api/patients");
  const { data: prescripciones, loading: loadingPrescripciones, error: errorPrescripciones } = useApi("/api/prescriptions");
  
  const handleOpenRecetaModal = (paciente = null) => {
    setSelectedPatient(paciente);
    setShowRecetaModal(true);
  };
  const handleNuevoPaciente = () => setShowPacienteModal(true);
  const handlePacienteCreado = () => {
    fetchPacientes();
  };
  const handleEditarPaciente = (paciente) => {
    setSelectedPatient(paciente);
    setShowEditarPacienteModal(true);
  };
  const handlePacienteActualizado = () => {
    fetchPacientes();
  };

  return (
    // 🚨 Contenedor principal que envuelve todo el layout dividido
    <div className="prescriptions-view-bg"> 
      
      {/* ================================== */}
      {/* CONTENEDOR DE LA VISTA DIVIDIDA */}
      {/* ================================== */}
      <div className="main-content-wrapper">
        
        {/* 1. COLUMNA IZQUIERDA: PACIENTES */}
        <section className="content-card patients-column">
          <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
            <h2 className="section-title">Pacientes</h2>
            <button
              onClick={handleNuevoPaciente}
              className="btn-primary"
            >
              <i className="fa-solid fa-user-plus mr-2"></i> + Nuevo Paciente
            </button>
          </div>

          {loadingPacientes ? (
            <p>Cargando pacientes...</p>
          ) : errorPacientes ? (
            <p className="text-red-600">Error: {errorPacientes}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">DNI</th>
                    <th className="px-4 py-2 text-left">Apellido</th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    
                    
                    <th className="px-4 py-2 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        No hay pacientes registrados
                      </td>
                    </tr>
                  ) : (
                    pacientes?.map((p) => (
                      <tr key={p.PacienteID}>
                        <td className="px-4 py-2">{p.DNI}</td>
                        <td className="px-4 py-2">{p.Apellido}</td>
                        <td className="px-4 py-2">{p.Nombres}</td>
                        
                        
                        <td className="px-4 py-2 action-cell"> 
                        <button onClick={() => handleOpenRecetaModal(p)} className="btn-action-receta">
                        <i className="fa-solid fa-file-circle-plus"></i> Receta
                      </button>
                      <button 
                        onClick={() => handleEditarPaciente(p)}
                        className="btn-action-editar"
                      >
                        <i className="fa-solid fa-pen-to-square"></i> 
                      </button>
                    </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* 2. COLUMNA DERECHA: PRESCRIPCIONES */}
        <section className="content-card prescriptions-column">
          <div className="flex justify-between items-center" style={{ marginBottom: '20px' }}>
            <h2 className="section-title">Prescripciones</h2>
            <button
              onClick={() => handleOpenRecetaModal()}
              className="btn-primary"
            >
              <i className="fa-solid fa-prescription-bottle-medical mr-2"></i> + Nueva Prescripción
            </button>
          </div>

          {loadingPrescripciones ? (
            <p>Cargando prescripciones...</p>
          ) : errorPrescripciones ? (
            <p className="text-red-600">Error: {errorPrescripciones}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Fecha</th>
                    
                    <th className="px-4 py-2 text-left">Paciente</th>
                    <th className="px-4 py-2 text-left">Diagnóstico</th>
                    
                    
                  </tr>
                </thead>
                <tbody>
                  {prescripciones?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No hay prescripciones registradas
                      </td>
                    </tr>
                  ) : (
                    prescripciones?.map((r) => (
                      <tr key={r.RecetaID}>
                        <td className="px-4 py-2">
                        {r.fchReceta ? r.fchReceta.slice(0, 10) : 'N/A'}
                        </td>
                        
                        <td className="px-4 py-2">
                          {r.Apellido} {r.Nombres}
                        </td>
                        <td className="px-4 py-2">{r.DescripcionDiagnostico}</td>
                        
                        
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div> {/* FIN de .main-content-wrapper */}
      
      {/* MODALES (permanecen al final) */}
      {showRecetaModal && (
        <NuevaRecetaModal
          paciente={selectedPatient}
          onClose={() => setShowRecetaModal(false)}
        />
      )}
      {showPacienteModal && (
        <NuevoPacienteModal
          onClose={() => setShowPacienteModal(false)}
          onSuccess={handlePacienteCreado}
        />
      )}
      {showEditarPacienteModal && (
        <EditarPacienteModal
          paciente={selectedPatient}
          onClose={() => setShowEditarPacienteModal(false)}
          onSuccess={handlePacienteActualizado}
        />
      )}
    </div>
  );
};

export default Prescripciones;