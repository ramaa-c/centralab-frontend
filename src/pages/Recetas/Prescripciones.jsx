import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { usePatients } from "../../hooks/usePatients";
import { usePrescriptions } from "../../hooks/usePrescriptions";
import NuevaRecetaModal from "./NuevaRecetaModal";
import NuevoPacienteModal from "../Pacientes/NuevoPacienteModal";
import EditarPacienteModal from "../Pacientes/EditarPacienteModal";
import axios from "axios";
import "../../styles/prescripciones.css";
import ConfirmModal from "../../components/ConfirmModal.jsx";

const Prescripciones = () => {
  const [showRecetaModal, setShowRecetaModal] = useState(false);
  const [patientForActionOrModal, setPatientForActionOrModal] = useState(null);
  const [selectedPatientFiltered, setSelectedPatientFiltered] = useState(null);
  const [showPacienteModal, setShowPacienteModal] = useState(false);
  const [showEditarPacienteModal, setShowEditarPacienteModal] = useState(false);
  const [prescriptionsExpanded, setPrescriptionsExpanded] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [prescriptionToDeleteId, setPrescriptionToDeleteId] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    field: "fchReceta",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const search = debouncedSearch.toLowerCase();

  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id || 0;

  const patientOptions = useMemo(
    () => ({
      pageSize: 15,
    }),
    []
  );

  const {
    patients: pacientes,
    loading: loadingPacientes,
    error: errorPacientes,
    setSearchDni,
    searchDni,
    refresh: fetchPacientes,
    hasMore: hasMorePacientes,
    loadMore: loadMorePacientes,
  } = usePatients(patientOptions);

  const {
    prescriptions: prescripciones,
    loading: loadingPrescripciones,
    error: errorPrescripciones,
    hasMore,
    loadMore,
    refresh: fetchPrescripciones,
  } = usePrescriptions(doctorId, {
    patientId: selectedPatientFiltered?.PacienteID || null,
    pageSize: 15,
  });

  const sortedPrescripciones = useMemo(() => {
    const sortableItems = prescripciones ? [...prescripciones] : [];

    if (sortConfig.field) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];

        const dateA = new Date(aValue);
        const dateB = new Date(bValue);

        if (dateA < dateB) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (dateA > dateB) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [prescripciones, sortConfig]);

  const handleSort = (field) => {
    let direction = "asc";
    if (sortConfig.field === field && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ field, direction });
  };

  const filteredAndSortedPrescripciones = sortedPrescripciones;

  const handleOpenRecetaModal = (paciente = null) => {
    setPatientForActionOrModal(paciente);
    setShowRecetaModal(true);
  };

  const handleNuevoPaciente = () => setShowPacienteModal(true);

  const handlePacienteCreado = () => {
    fetchPacientes();
  };

  const handleEditarPaciente = (paciente) => {
    setPatientForActionOrModal(paciente);
    setShowEditarPacienteModal(true);
  };

  const handlePacienteActualizado = () => {
    fetchPacientes();
  };

  const handleVerODescargarPDF = async (prescriptionId, accion) => {
    try {
      const response = await axios.get(
        `/api/prescription/${prescriptionId}/pdf`
      );
      const base64PDF = response.data?.ArchivoPDF;

      if (!base64PDF) {
        alert("No se encontró el archivo PDF de esta prescripción.");
        return;
      }

      const byteArray = Uint8Array.from(atob(base64PDF), (c) =>
        c.charCodeAt(0)
      );
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (accion === "ver") {
        window.open(url, "_blank");
      } else if (accion === "descargar") {
        const link = document.createElement("a");
        link.href = url;
        link.download = `prescripcion_${prescriptionId}.pdf`;
        link.click();
      }

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al obtener el PDF:", error);
      alert("Hubo un error al obtener el PDF de la prescripción.");
    }
  };

  const handleEliminarPrescripcion = async (prescriptionId) => {
    setPrescriptionToDeleteId(prescriptionId);
    setShowConfirmDeleteModal(true);
  };

  const confirmEliminarPrescripcion = async () => {
    if (!prescriptionToDeleteId) return;

    try {
      await axios.delete(`/api/prescription/${prescriptionToDeleteId}`);

      fetchPrescripciones();
    } catch (error) {
      console.error("Error al eliminar prescripción:", error);
    } finally {
      setShowConfirmDeleteModal(false);
      setPrescriptionToDeleteId(null);
    }
  };

  const handleClearSelection = () => {
    setSelectedPatientFiltered(null);
    setSearchTerm("");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const pacientesScrollRef = useRef(null);
  const prevScrollTop = useRef(0);
  const prevScrollHeight = useRef(0);
  const isPaginating = useRef(false);

  const prescripcionesScrollRef = useRef(null);
  const prevPrescScrollTop = useRef(0);
  const prevPrescScrollHeight = useRef(0);
  const isPrescPaginating = useRef(false);

  const handleLoadMorePacientes = () => {
    if (pacientesScrollRef.current) {
      prevScrollTop.current = pacientesScrollRef.current.scrollTop;
      prevScrollHeight.current = pacientesScrollRef.current.scrollHeight;
      isPaginating.current = true;
    }
    loadMorePacientes();
  };

  const handleLoadMorePrescripciones = () => {
    if (prescripcionesScrollRef.current) {
      prevPrescScrollTop.current = prescripcionesScrollRef.current.scrollTop;
      prevPrescScrollHeight.current =
        prescripcionesScrollRef.current.scrollHeight;
      isPrescPaginating.current = true;
    }
    loadMore();
  };

  useLayoutEffect(() => {
    if (pacientesScrollRef.current && isPaginating.current) {
      const area = pacientesScrollRef.current;

      const newScrollHeight = area.scrollHeight;
      const heightDifference = newScrollHeight - prevScrollHeight.current;

      if (heightDifference > 0) {
        area.scrollTop = prevScrollTop.current + heightDifference;
      }

      isPaginating.current = false;
      prevScrollTop.current = 0;
      prevScrollHeight.current = 0;
    }
  }, [pacientes]);

  useLayoutEffect(() => {
    if (prescripcionesScrollRef.current && isPrescPaginating.current) {
      const area = prescripcionesScrollRef.current;

      const newScrollHeight = area.scrollHeight;
      const heightDifference = newScrollHeight - prevPrescScrollHeight.current;

      if (heightDifference > 0) {
        area.scrollTop = prevPrescScrollTop.current + heightDifference;
      }

      isPrescPaginating.current = false;
      prevPrescScrollTop.current = 0;
      prevPrescScrollHeight.current = 0;
    }
  }, [prescripciones]);

  return (
    <div className="prescriptions-view-bg">
      <div className="main-content-wrapper">
        <section className="content-card patients-column">
          <div
            className="flex-header-pacientes"
            style={{
              marginTop: "20px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "30px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h2
                className="section-title"
                style={{ margin: 0, marginBottom: "10px" }}
              >
                Pacientes
              </h2>
              <button onClick={handleNuevoPaciente} className="btn-primary">
                <i className="fa-solid fa-user-plus mr-2"></i> + Nuevo Paciente
              </button>
            </div>

            <div
              className="search-input-container"
              style={{
                flexGrow: 1,
                maxWidth: "800px",
                marginRight: "20px",
                marginTop: "44px",
              }}
            >
              <input
                type="text"
                placeholder="Buscar paciente por DNI"
                onChange={(e) => {
                  setSearchDni(e.target.value);
                  setSelectedPatientFiltered(null);
                }}
                className="search-input"
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
              
            </div>
          </div>

          {loadingPacientes ? (
            <p>Cargando pacientes...</p>
          ) : errorPacientes ? (
            <p className="text-red-600">Error: {errorPacientes}</p>
          ) : (
            <div className="overflow-x-auto">
              <div
                ref={pacientesScrollRef}
                className={`list-scroll-area ${
                  prescriptionsExpanded ? "expanded" : ""
                }`}
              >
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
                        <td colSpan="4" className="text-center py-4">
                          {searchDni.length > 0 && searchDni.length < 5
                            ? "Escribe el número de DNI completo para buscar."
                            : "No hay pacientes que coincidan con la búsqueda."}
                        </td>
                      </tr>
                    ) : (
                      pacientes.map((p) => (
                        <tr
                          key={p.PacienteID}
                          onClick={() => setSelectedPatientFiltered(p)}
                          className={`cursor-pointer hover:bg-gray-100 ${
                            selectedPatientFiltered?.PacienteID === p.PacienteID
                              ? "selected-row"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-2">{p.DNI}</td>
                          <td className="px-4 py-2">{p.Apellido}</td>
                          <td className="px-4 py-2">{p.Nombres}</td>
                          <td className="px-4 py-2 action-cell">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRecetaModal(p);
                              }}
                              className="btn-action-receta"
                            >
                              <i className="fa-solid fa-file-circle-plus"></i>{" "}
                              Receta
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditarPaciente(p);
                              }}
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
              {/* INICIO: Botón Cargar Más */}
              {hasMorePacientes && (
                <div style={{ textAlign: "center", padding: "15px 0" }}>
                  <button
                    onClick={handleLoadMorePacientes}
                    className="btn-primary"
                    disabled={loadingPacientes}
                  >
                    {loadingPacientes ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Cargando más...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-caret-down"></i>
                        Cargar más
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="content-card prescriptions-column">
          <div
            className="flex justify-between items-center"
            style={{ marginBottom: "20px" }}
          >
            <h2 className="section-title">Prescripciones</h2>
            {selectedPatientFiltered && (
              <div
                className="selected-patient-info"
                style={{
                  padding: "10px",
                  backgroundColor: "#e6f7ff",
                  borderLeft: "3px solid #1890ff",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={handleClearSelection}
                  className="btn-clear-filter"
                  style={{ padding: "5px 10px", fontSize: "0.8rem" }}
                >
                  <i className="fa-solid fa-xmark"></i> Quitar Filtro (
                  {selectedPatientFiltered.Apellido}{" "}
                  {selectedPatientFiltered.Nombres})
                </button>
              </div>
            )}
            
          </div>

          {loadingPrescripciones && prescripciones.length === 0 ? (
            <p>Cargando prescripciones...</p>
          ) : errorPrescripciones ? (
            <p className="text-red-600">Error: {errorPrescripciones}</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="list-scroll-area">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th
                        className="px-4 py-2 text-left sortable"
                        onClick={() => handleSort("fchReceta")}
                      >
                        Fecha
                        {sortConfig.field === "fchReceta" && (
                          <i
                            className={`fa-solid ml-2 ${
                              sortConfig.direction === "asc"
                                ? "fa-sort-up"
                                : "fa-sort-down"
                            }`}
                          ></i>
                        )}
                      </th>
                      <th className="px-4 py-2 text-left">Diagnóstico</th>
                      <th className="px-4 py-2 text-left">Paciente</th>
                      <th className="px-4 py-2 text-left">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAndSortedPrescripciones?.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          {selectedPatientFiltered
                            ? `El paciente ${selectedPatientFiltered.Apellido} no tiene recetas registradas.`
                            : "No hay prescripciones registradas."}
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedPrescripciones?.map((r) => (
                        <tr key={r.RecetaID}>
                          <td className="px-4 py-2">
                            {r.fchReceta ? r.fchReceta.slice(0, 10) : "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            {r.DescripcionDiagnostico}
                          </td>
                          <td className="px-4 py-2">
                            {r.Apellido} {r.Nombres}
                          </td>

                          <td className="px-4 py-2 action-cell">
                            <button
                              className="btn-action-ver"
                              onClick={() =>
                                handleVerODescargarPDF(r.RecetaID, "ver")
                              }
                              title="Ver PDF"
                            >
                              <i className="fa-solid fa-file-pdf"></i>
                            </button>

                            <button
                              className="btn-action-imprimir"
                              onClick={() =>
                                handleVerODescargarPDF(r.RecetaID, "descargar")
                              }
                              title="Descargar/Imprimir PDF"
                            >
                              <i className="fa-solid fa-print"></i>
                            </button>

                            <button
                              className="btn-action-eliminar"
                              onClick={() =>
                                handleEliminarPrescripcion(r.RecetaID)
                              }
                              title="Eliminar Prescripción"
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* INICIO: Botón Cargar Más Prescripciones */}
              {hasMore && (
                <div style={{ textAlign: "center", padding: "15px 0" }}>
                  <button
                    onClick={handleLoadMorePrescripciones}
                    className="btn-primary"
                    disabled={loadingPrescripciones}
                  >
                    {loadingPrescripciones ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                        Cargando más...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-caret-down"></i>
                        Cargar más
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {showRecetaModal && (
        <NuevaRecetaModal
          paciente={patientForActionOrModal}
          onClose={() => {
            setShowRecetaModal(false);
            fetchPrescripciones();
          }}
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
          paciente={patientForActionOrModal}
          onClose={() => setShowEditarPacienteModal(false)}
          onSuccess={handlePacienteActualizado}
        />
      )}
      {showConfirmDeleteModal && (
        <ConfirmModal
          isOpen={showConfirmDeleteModal}
          message="¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE esta prescripción? Esta acción no se puede deshacer."
          onConfirm={confirmEliminarPrescripcion}
          onCancel={() => {
            setShowConfirmDeleteModal(false);
            setPrescriptionToDeleteId(null);
          }}
        />
      )}
    </div>
  );
};

export default Prescripciones;
