import React, { useState, useEffect } from "react";
import { useApiQuery } from "../../hooks/useApiQuery";
import { usePdfViewer, processPdfAction } from "../../hooks/usePDFViewer";
import { useEliminarPrescripcion } from "../../hooks/useEliminarPrescripcion";
import NuevaRecetaModal from "./NuevaRecetaModal";
import NuevoPacienteModal from "../Pacientes/NuevoPacienteModal";
import EditarPacienteModal from "../Pacientes/EditarPacienteModal";
import MetricCard from "../../components/MetricCard";
import "../../styles/prescripciones.css";
import '@fortawesome/fontawesome-free/css/all.min.css'; 


const Prescripciones = () => {
    const [showRecetaModal, setShowRecetaModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPacienteModal, setShowPacienteModal] = useState(false);
    const [showEditarPacienteModal, setShowEditarPacienteModal] = useState(false);
    const [prescriptionsExpanded, setPrescriptionsExpanded] = useState(false);
    const [pdfAction, setPdfAction] = useState({ id: null, action: null });
    
    // QUERIES MIGRADAS
    const { 
        data: pacientes, 
        isLoading: loadingPacientes, 
        error: errorPacientes 
    } = useApiQuery("/patients");
    
    const { 
        data: prescripciones, 
        isLoading: loadingPrescripciones, 
        error: errorPrescripciones 
    } = useApiQuery("/prescriptions");
    
    const { 
        data: metricsData, 
        isLoading: loadingMetrics, 
        error: errorMetrics 
    } = useApiQuery("/RD/Info"); 

    const { 
        data: pdfBase64, 
        isLoading: isPdfLoading,
        fetchPdf 
    } = usePdfViewer(pdfAction.id);
    
    const metrics = (metricsData && typeof metricsData === "object") ? metricsData : {};    

    // MUTATION DE ELIMINACIÓN
    const { mutate: eliminarPrescripcionMutate } = useEliminarPrescripcion(); 

    const handleOpenRecetaModal = (paciente = null) => {
        setSelectedPatient(paciente);
        setShowRecetaModal(true);
    };
    
    const handleNuevoPaciente = () => setShowPacienteModal(true);
    
    // 🚨 ELIMINADAS: La invalidación ocurre dentro de los hooks de mutación de los modales.
    const handlePacienteCreado = () => {}; 
    const handlePacienteActualizado = () => {}; 
    
    const handleEditarPaciente = (paciente) => {
        setSelectedPatient(paciente);
        setShowEditarPacienteModal(true);
    };

    const handleEliminarPrescripcion = (prescriptionId) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta prescripción?")) return;

        // 🟢 Reemplazamos Axios y fetchPrescripciones por el mutate de React Query
        eliminarPrescripcionMutate(prescriptionId); 
    };

    useEffect(() => {
        if (pdfBase64 && pdfAction.id && pdfAction.action) {
            // 2. Si recibimos el Base64, ejecutamos la acción.
            processPdfAction(pdfBase64, pdfAction.action, pdfAction.id);

            // 3. Limpiamos el estado después de procesar para evitar repeticiones.
            setPdfAction({ id: null, action: null });
        }
    }, [pdfBase64, pdfAction]);

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
            {/* ---------------------------------- */}
            
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
                                    {pacientes?.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-4">
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
                        <p className="text-red-600">Error: {errorPrescripciones.message}</p>
                    ) : (
                        
                    <div className="overflow-x-auto">
                        
                        
                        <div className="list-scroll-area">
                            <table className="data-table">
                                <thead >
                                    <tr>
                                        <th className="px-4 py-2 text-left">Fecha</th>
                                        <th className="px-4 py-2 text-left">Diagnóstico</th>
                                        <th className="px-4 py-2 text-left">Paciente</th>
                                        <th className="px-4 py-2 text-left">Acciones</th>
                                    </tr>
                                </thead>
                                
                                <tbody>
                                    {prescripciones?.map((r) => (
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
                                            onClick={() => handlePdfAction(r.RecetaID, "ver")} // Usar la nueva función
                                            // Deshabilitar si se está cargando ESTE O CUALQUIER PDF
                                            disabled={isPdfLoading} 
                                        >
                                        {isPdfLoading && pdfAction.id === r.RecetaID ? (
                                            <i className="fa-solid fa-spinner fa-spin"></i> 
                                        ) : (
                                            <i className="fa-solid fa-file-pdf"></i>
                                        )}
                                        </button>
                                        {/* 🟣 Descargar PDF */}
                                        <button
                                            className="btn-action-ver"
                                            onClick={() => handlePdfAction(r.RecetaID, "descargar")} // Usar la nueva función
                                            disabled={isPdfLoading} 
                                        >
                                            {isPdfLoading && pdfAction.id === r.RecetaID ? (
                                                <i className="fa-solid fa-spinner fa-spin"></i> 
                                            ) : (
                                                <i className="fa-solid fa-download"></i>
                                            )}
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
                                    ))}
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
                    onSuccess={handlePacienteCreado} // Ya no hace fetch, pero se mantiene la prop
                />
            )}
            {showEditarPacienteModal && (
                <EditarPacienteModal
                    paciente={selectedPatient}
                    onClose={() => setShowEditarPacienteModal(false)}
                    onSuccess={handlePacienteActualizado} // Ya no hace fetch, pero se mantiene la prop
                />
            )}
        </div>
    );
};

export default Prescripciones;