import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import NuevaRecetaModal from "./NuevaRecetaModal";
import NuevoPacienteModal from "../Pacientes/NuevoPacienteModal";
import EditarPacienteModal from "../Pacientes/EditarPacienteModal";

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
    <div className="p-6 space-y-10">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pacientes</h2>
          <button
            onClick={handleNuevoPaciente}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Nuevo Paciente
          </button>
        </div>

        {loadingPacientes ? (
          <p>Cargando pacientes...</p>
        ) : errorPacientes ? (
          <p className="text-red-600">Error: {errorPacientes}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">DNI</th>
                  <th className="px-4 py-2 text-left">Apellido</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Nacimiento</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No hay pacientes registrados
                    </td>
                  </tr>
                ) : (
                  pacientes.map((p) => (
                    <tr key={p.PacienteID} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{p.DNI}</td>
                      <td className="px-4 py-2">{p.Apellido}</td>
                      <td className="px-4 py-2">{p.Nombres}</td>
                      <td className="px-4 py-2">{p.Email}</td>
                      <td className="px-4 py-2">{p.fchNacimiento}</td>
                      <td className="px-4 py-2">
                      <button
                        onClick={() => handleOpenRecetaModal(p)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        + Receta
                      </button>
                      <button
                        onClick={() => handleEditarPaciente(p)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                      >
                        Editar
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

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Prescripciones</h2>
          <button
            onClick={() => handleOpenRecetaModal()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            + Nueva Prescripción
          </button>
        </div>

        {loadingPrescripciones ? (
          <p>Cargando prescripciones...</p>
        ) : errorPrescripciones ? (
          <p className="text-red-600">Error: {errorPrescripciones}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Paciente</th>
                  <th className="px-4 py-2 text-left">Diagnóstico</th>
                  <th className="px-4 py-2 text-left">Notas</th>
                  <th className="px-4 py-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {prescripciones.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No hay prescripciones registradas
                    </td>
                  </tr>
                ) : (
                  prescripciones.map((r) => (
                    <tr key={r.RecetaID} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{r.fchReceta}</td>
                      <td className="px-4 py-2">
                        {r.Apellido} {r.Nombres}
                      </td>
                      <td className="px-4 py-2">{r.DescripcionDiagnostico}</td>
                      <td className="px-4 py-2">{r.NotasReceta}</td>
                      <td className="px-4 py-2">{r.Email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
