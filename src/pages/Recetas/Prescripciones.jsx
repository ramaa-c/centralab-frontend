import React, { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { usePatients } from "../../hooks/usePatients";
import { usePrescriptions } from "../../hooks/usePrescriptions";
import NuevaRecetaModal from "./NuevaRecetaModal";
import NuevoPacienteModal from "../Pacientes/NuevoPacienteModal";
import EditarPacienteModal from "../Pacientes/EditarPacienteModal";
import MetricCard from "../../components/MetricCard";
import axios from "axios";
import "../../styles/prescripciones.css";
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import ConfirmModal from "../../components/ConfirmModal.jsx";


const Prescripciones = () => {
    const [showRecetaModal, setShowRecetaModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPacienteModal, setShowPacienteModal] = useState(false);
    const [showEditarPacienteModal, setShowEditarPacienteModal] = useState(false);
    const [prescriptionsExpanded, setPrescriptionsExpanded] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [prescriptionToDeleteId, setPrescriptionToDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const doctorId = user?.id || 0;
    const { patients: pacientes, loading: loadingPacientes, error: errorPacientes } = usePatients(doctorId);
    const { prescriptions: prescripciones, loading: loadingPrescripciones, error: errorPrescripciones } = usePrescriptions(doctorId);
    
    const { 
        data: metricsData, 
        loading: loadingMetrics, 
        error: errorMetrics 
    } = useApi("/RD/Info"); 
    
    const metrics = (metricsData && Array.isArray(metricsData) && metricsData.length > 0) ? metricsData[0] : {};
    
    const handleOpenRecetaModal = (paciente = null) => {
        setSelectedPatient(paciente);
        setShowRecetaModal(true);
    };
    const handleNuevoPaciente = () => setShowPacienteModal(true);
    
    const handleEditarPaciente = (paciente) => {
        setSelectedPatient(paciente);
        setShowEditarPacienteModal(true);
    };

    const handleVerODescargarPDF = async (prescriptionId, accion) => {
        try {
            const response = await axios.get(`/api/prescription/${prescriptionId}/pdf`);
            const base64PDF = response.data?.ArchivoPDF;

            if (!base64PDF) {
            alert("No se encontró el archivo PDF de esta prescripción.");
            return;
            }

            const byteArray = Uint8Array.from(atob(base64PDF), (c) => c.charCodeAt(0));
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
    const handlePacienteCreado = () => {
        alert("Paciente creado correctamente ✅");
    };

    const handlePacienteActualizado = () => {
        alert("Paciente actualizado correctamente ✅");
    };
    const confirmEliminarPrescripcion = async () => {
        if (!prescriptionToDeleteId) return;

        try {
            await axios.delete(`/api/prescription/${prescriptionToDeleteId}`);
            alert("Prescripción eliminada correctamente ✅");
            window.location.reload();
        } catch (error) {
            console.error("Error al eliminar prescripción:", error);
            alert("Hubo un error al eliminar la prescripción ❌");
        } finally {
            setShowConfirmDeleteModal(false);
            setPrescriptionToDeleteId(null);
        }
    };
    const handleClearSelection = () => {
        setSelectedPatient(null);
        setSearchTerm("");
    };
    const filteredPacientes = pacientes?.filter(paciente => {
        const fullName = `${paciente.Apellido} ${paciente.Nombres}`.toLowerCase();
        const dni = String(paciente.DNI).toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return fullName.includes(search) || dni.includes(search);
    });
    const filteredPrescripciones = prescripciones?.filter(receta => {
        // Si no hay un paciente seleccionado, muestra todas las recetas
        if (!selectedPatient) {
            return true;
        }
        // Filtra por el ID del paciente seleccionado. Asume que 'receta' tiene un campo 'PacienteID'
        return receta.PacienteID === selectedPatient.PacienteID; 
    });

    return (
        <div className="prescriptions-view-bg"> 
            
            {/* ÁREA DE CONTADORES */}
            <div className="metrics-dashboard">
                <MetricCard 
                    title="Nuevos Pacientes" 
                    value={metrics.NewPacients || 0} 
                    icon="fa-user-plus" 
                    isLoading={loadingMetrics} 
                />
                <MetricCard 
                    title="Nuevas Recetas" 
                    value={metrics.NewPrescriptions || 0} 
                    icon="fa-file-medical" 
                    isLoading={loadingMetrics} 
                />
                <MetricCard 
                    title="Nuevos Médicos" 
                    value={metrics.NewDoctors || 0} 
                    icon="fa-user-md" 
                    isLoading={loadingMetrics} 
                />
                
            </div>
            
            <div className="main-content-wrapper">
                
                {/* COLUMNA IZQUIERDA: PACIENTES */}
           <section className="content-card patients-column">
    
    {/* CONTENEDOR FLEX PRINCIPAL: Título/Botón (Izquierda) y Búsqueda (Derecha) */}
    <div 
        className="flex-header-pacientes" 
        style={{ 
            marginTop: '20px', 
            marginBottom: '20px', 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'space-between', 
            gap: '30px' 
        }}
    >
        
        {/*
        #########################################
        #  CAMBIO CLAVE: Nuevo DIV contenedor  #
        #########################################
        */}
        <div style={{ display: 'flex', flexDirection: 'column' }}> 
            <h2 className="section-title" style={{ margin: 0, marginBottom: '10px' }}>Pacientes</h2> 
            <button
                onClick={handleNuevoPaciente}
                className="btn-primary"
            >
                <i className="fa-solid fa-user-plus mr-2"></i> + Nuevo Paciente
            </button>
        </div>
        {/* FIN DEL NUEVO DIV CONTENEDOR */}


        {/* GRUPO 2: CAMPO de BÚSQUEDA */}
        <div 
            className="search-input-container" 
            style={{ 
                flexGrow: 1, 
                maxWidth: '800px', 
                marginRight: '20px',
                marginTop: '44px' // Ajuste de alineación vertical
            }}
        >
            <input
                type="text"
                placeholder="Buscar paciente (Apellido, Nombre o DNI)"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedPatient(null);
                }}
                className="search-input"
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
        </div>
    </div> 
    {/* FIN DEL CONTENEDOR FLEX PRINCIPAL */}
    
    
    {selectedPatient && (
    <div className="selected-patient-info" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e6f7ff', borderLeft: '3px solid #1890ff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button 
            onClick={handleClearSelection} 
            className="btn-clear-filter" 
            style={{ padding: '5px 10px', fontSize: '0.8rem' }}
        >
            <i className="fa-solid fa-xmark"></i> Quitar Filtro ({selectedPatient.Apellido} {selectedPatient.Nombres})
        </button>
    </div>
    )}
                

                    {loadingPacientes ? (
                        <p>Cargando pacientes...</p>
                    ) : errorPacientes ? (
                        <p className="text-red-600">Error: {errorPacientes}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            
                            <div className={`list-scroll-area ${prescriptionsExpanded ? 'expanded' : ''}`}>
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
    {filteredPacientes?.length === 0 ? (
        <tr>
            <td colSpan="4" className="text-center py-4">
                No hay pacientes que coincidan con la búsqueda.
            </td>
        </tr>
    ) : (
        filteredPacientes?.map((p) => (
            <tr 
                key={p.PacienteID} 
                onClick={() => setSelectedPatient(p)} // <-- Manejador de selección de fila
                className={`cursor-pointer hover:bg-gray-100 ${selectedPatient?.PacienteID === p.PacienteID ? 'selected-row' : ''}`}
            >
                <td className="px-4 py-2">{p.DNI}</td>
                <td className="px-4 py-2">{p.Apellido}</td>
                <td className="px-4 py-2">{p.Nombres}</td>
                <td className="px-4 py-2 action-cell"> 
                    
                    {/* Botón de Receta (CORREGIDO: con e.stopPropagation) */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenRecetaModal(p); }} 
                        className="btn-action-receta"
                    >
                        <i className="fa-solid fa-file-circle-plus"></i> Receta
                    </button>
                    
                    {/* Botón de Editar (CORREGIDO: con e.stopPropagation) */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleEditarPaciente(p); }}
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
                
                {/* MENSAJE DE FILTRO ACTIVO */}
                

                {loadingPrescripciones ? (
                    <p>Cargando prescripciones...</p>
                ) : errorPrescripciones ? (
                    <p className="text-red-600">Error: {errorPrescripciones}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="list-scroll-area">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left">Fecha</th>
                                        <th className="px-4 py-2 text-left">Diagnóstico</th>
                                        <th className="px-4 py-2 text-left">Paciente</th>
                                        <th className="px-4 py-2 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                
                                <tbody>
                                    {/* MANEJO DE LISTA VACÍA O FILTRADA VACÍA */}
                                    {filteredPrescripciones?.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">
                                                {/* Muestra un mensaje diferente si hay un paciente seleccionado pero no tiene recetas */}
                                                {selectedPatient 
                                                    ? `El paciente ${selectedPatient.Apellido} no tiene recetas registradas.`
                                                    : 'No hay prescripciones registradas.'
                                                }
                                            </td>
                                        </tr>
                                    ) : (
                                        /* MAPEADO DE LA LISTA FILTRADA */
                                        filteredPrescripciones?.map((r) => (
                                            <tr key={r.RecetaID}>
                                                <td className="px-4 py-2">
                                                    {r.fchReceta ? r.fchReceta.slice(0, 10) : 'N/A'}
                                                </td>
                                                <td className="px-4 py-2">{r.DescripcionDiagnostico}</td>
                                                <td className="px-4 py-2">
                                                    {r.Apellido} {r.Nombres}
                                                </td>
                                                
                                                <td className="px-4 py-2 action-cell">
                                                    {/* 🔵 Ver PDF */}
                                                    <button
                                                        className="btn-action-ver"
                                                        onClick={() => handleVerODescargarPDF(r.RecetaID, "ver")}
                                                    >
                                                        <i className="fa-solid fa-file-pdf"></i>
                                                    </button>
                                                    {/* Eliminar */}
                                                    <button
                                                        className="btn-action-eliminar"
                                                        onClick={() => handleEliminarPrescripcion(r.RecetaID)}
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
                    </div>
                )}
            </section>
            </div>
            
            {/* MODALES */}
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