import React, { useState, useMemo, useEffect } from "react";
import { usePatients } from "../../hooks/usePatients";
import { usePrescriptions } from "../../hooks/usePrescriptions";
import NuevaRecetaModal from "./NuevaRecetaModal";
import NuevoPacienteModal from "../Pacientes/NuevoPacienteModal";
import EditarPacienteModal from "../Pacientes/EditarPacienteModal";
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
    const [sortConfig, setSortConfig] = useState({ field: 'fchReceta', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
    const search = debouncedSearch.toLowerCase();


    const user = JSON.parse(localStorage.getItem("user"));
    const doctorId = user?.id || 0;
    
    const {
        patients: pacientes,
        loading: loadingPacientes,
        error: errorPacientes,
        setSearchDni,
    } = usePatients({ pageSize: 15 });

    const { 
        prescriptions: prescripciones, 
        loading: loadingPrescripciones, 
        error: errorPrescripciones,
        hasMore,
        loadMore,
        refresh: fetchPrescripciones,
    } = usePrescriptions(doctorId, { 
        patientId: selectedPatient?.PacienteID || null,
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
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (dateA > dateB) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [prescripciones, sortConfig]);

    const handleSort = (field) => {
        let direction = 'asc';
        if (sortConfig.field === field && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ field, direction });
    };

    const filteredAndSortedPrescripciones = sortedPrescripciones
    ?.filter(receta => {
        const dni = String(receta.DNI || "").toLowerCase();
        return dni.includes(searchTerm.toLowerCase());
    });

    
    
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
        setSelectedPatient(null);
        setSearchTerm("");
    };

    useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
    }, [searchTerm]);

    return (
        <div className="prescriptions-view-bg"> 
            
            
            
            <div className="main-content-wrapper">
                
                <section className="content-card patients-column">
    
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
        
        <div style={{ display: 'flex', flexDirection: 'column' }}> 
            <h2 className="section-title" style={{ margin: 0, marginBottom: '10px' }}>Pacientes</h2> 
            <button
                onClick={handleNuevoPaciente}
                className="btn-primary"
            >
                <i className="fa-solid fa-user-plus mr-2"></i> + Nuevo Paciente
            </button>
        </div>


        <div 
            className="search-input-container" 
            style={{ 
                flexGrow: 1, 
                maxWidth: '800px', 
                marginRight: '20px',
                marginTop: '44px'
            }}
        >
            <input
            type="text"
            placeholder="Buscar paciente por DNI"
            onChange={(e) => {
                setSearchDni(e.target.value);
                setSelectedPatient(null);
            }}
            className="search-input"
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
        </div>
    </div>
    
    
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
        {pacientes?.length === 0 ? (
        <tr>
            <td colSpan="4" className="text-center py-4">
            No hay pacientes que coincidan con la búsqueda.
            </td>
        </tr>
        ) : (
        pacientes.map((p) => (
            <tr 
                key={p.PacienteID} 
                onClick={() => setSelectedPatient(p)}
                className={`cursor-pointer hover:bg-gray-100 ${selectedPatient?.PacienteID === p.PacienteID ? 'selected-row' : ''}`}
            >
                <td className="px-4 py-2">{p.DNI}</td>
                <td className="px-4 py-2">{p.Apellido}</td>
                <td className="px-4 py-2">{p.Nombres}</td>
                <td className="px-4 py-2 action-cell"> 
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenRecetaModal(p); }} 
                        className="btn-action-receta"
                    >
                        <i className="fa-solid fa-file-circle-plus"></i> Receta
                    </button>
                    
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
                                            onClick={() => handleSort('fchReceta')}
                                            >
                                                Fecha
                                                {sortConfig.field === 'fchReceta' && (
                                                    <i className={`fa-solid ml-2 ${sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
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
                                                    {selectedPatient 
                                                        ? `El paciente ${selectedPatient.Apellido} no tiene recetas registradas.`
                                                        : 'No hay prescripciones registradas.'
                                                    }
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAndSortedPrescripciones?.map((r) => (
                                                <tr key={r.RecetaID}>
                                                    <td className="px-4 py-2">
                                                        {r.fchReceta ? r.fchReceta.slice(0, 10) : 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-2">{r.DescripcionDiagnostico}</td>
                                                    <td className="px-4 py-2">
                                                        {r.Apellido} {r.Nombres}
                                                    </td>
                                                    
                                                    
                                                    <td className="px-4 py-2 action-cell">
                                                        {/* Botón para VER PDF (ya existente) */}
                                                        <button
                                                            className="btn-action-ver"
                                                            onClick={() => handleVerODescargarPDF(r.RecetaID, "ver")}
                                                            title="Ver PDF" // Agregado para mejor UX
                                                        >
                                                            <i className="fa-solid fa-file-pdf"></i>
                                                        </button>
                                                        
                                                        {/* 👇 NUEVO BOTÓN PARA IMPRIMIR/DESCARGAR PDF 👇 */}
                                                        <button
                                                            className="btn-action-imprimir" // Clase CSS para el botón de imprimir
                                                            onClick={() => handleVerODescargarPDF(r.RecetaID, "descargar")} // Se usa "descargar" para forzar la descarga o apertura del diálogo de impresión
                                                            title="Descargar/Imprimir PDF" // Agregado para mejor UX
                                                        >
                                                            <i className="fa-solid fa-print"></i> 
                                                        </button>
                                                        {/* 👆 FIN NUEVO BOTÓN 👆 */}

                                                        {/* Botón para ELIMINAR (ya existente) */}
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
                                {hasMore && !loadingPrescripciones && (
                                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                                        <button onClick={loadMore} className="btn-secondary">
                                            Cargar más
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </div>
            
            {showRecetaModal && (
                <NuevaRecetaModal
                    paciente={selectedPatient}
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