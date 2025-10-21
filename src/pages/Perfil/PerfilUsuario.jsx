import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApiQuery } from "../../hooks/useApiQuery"; // Nuevo import
import { useActualizarPerfil } from "../../hooks/useActualizarPerfil.js"; // Nuevo import
import ConfirmModal from "../../components/ConfirmModal.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/perfil.css";
import "../../styles/login.css";

// 🚨 Eliminamos los imports individuales de doctorService.js

export default function PerfilUsuario() {
    const { user, updateActiveEstablishment } = useAuth();
    const doctorId = user?.id;

    // QUERIES: Usamos useApiQuery para todas las lecturas
    const { data: doctor, isLoading: loadingDoctor } = useApiQuery(["doctor", doctorId]);
    const { data: doctorEstablishmentsData, isLoading: loadingDoctorEst } = useApiQuery(["doctorEstablishments", doctorId]);
    const { data: establishments, isLoading: loadingAllEst } = useApiQuery("/establishments");
    const { data: especialidades, isLoading: loadingSpecialties } = useApiQuery("/specialties");

    // MUTACIÓN ORQUESTADORA
    const { 
        mutate: updateDoctorMutate, 
        isPending: isSaving, 
        error: saveError 
    } = useActualizarPerfil({
        onSuccess: (result, variables) => {
            // Actualizar estados locales con el nuevo estado retornado por la mutación
            setDraftDoctor(result.newDoctorState); 
            setInitialDoctor(result.newDoctorState); // Sincroniza el estado inicial
            setInitialEstablishments(draftEstablishments); // Sincroniza estado inicial de est.
            setSelectedFile(null); // Limpia el archivo
            setShowConfirmModal(false); // Cierra modal
        },
        onError: () => {
            // El toast se maneja en el hook, solo limpiamos el modal
            setShowConfirmModal(false);
        }
    });

    // ESTADOS LOCALES PARA EDICIÓN
    const [draftDoctor, setDraftDoctor] = useState(null);
    const [draftEstablishments, setDraftEstablishments] = useState([]);
    const [initialDoctor, setInitialDoctor] = useState(null); // Para comparación
    const [initialEstablishments, setInitialEstablishments] = useState([]); // Para comparación
    
    const [draftActiveEstablishment, setDraftActiveEstablishment] = useState("");
    const [selectedEstablishment, setSelectedEstablishment] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // 🚨 EFECTO DE SINCRONIZACIÓN DE CACHÉ A ESTADO LOCAL (Reemplaza fetchData y useEffect inicial)
    useEffect(() => {
        if (doctor && !draftDoctor) {
            setDraftDoctor(doctor);
            setInitialDoctor(doctor); // Estado inicial para comparación
        }
        if (doctorEstablishmentsData && initialEstablishments.length === 0) {
            setDraftEstablishments(doctorEstablishmentsData);
            setInitialEstablishments(doctorEstablishmentsData);
        }
        
        // Sincroniza el establecimiento activo desde AuthContext/user
        const userEst = user?.establecimientoId;
        if (userEst !== undefined && userEst !== null && String(userEst) !== draftActiveEstablishment) {
            setDraftActiveEstablishment(String(userEst));
        } else if (!userEst && doctorEstablishmentsData && doctorEstablishmentsData.length > 0 && !draftActiveEstablishment) {
             setDraftActiveEstablishment(String(doctorEstablishmentsData[0].EstablecimientoID));
        }
    }, [doctor, doctorEstablishmentsData, user, draftDoctor, initialEstablishments.length, draftActiveEstablishment]);

    // 🚨 ELIMINAMOS: const toBase64 = ...
    // 🚨 ELIMINAMOS: useEffect de carga inicial
    // 🚨 ELIMINAMOS: fetchData

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDraftDoctor({ ...draftDoctor, [name]: value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleAddEstablishment = () => {
        const alreadyExists = draftEstablishments.some(
            (est) => est.EstablecimientoID === parseInt(selectedEstablishment)
        );
        if (alreadyExists) return;

        const establishmentToAdd = establishments.find(
            (est) => est.EstablecimientoID === parseInt(selectedEstablishment)
        );

        if (establishmentToAdd) {
            setDraftEstablishments([...draftEstablishments, establishmentToAdd]);
            setSelectedEstablishment("");
        }
    };

    const handleRemoveEstablishment = (idToRemove) => {
        const nuevaLista = draftEstablishments.filter((est) => est.EstablecimientoID !== idToRemove);
        setDraftEstablishments(nuevaLista);

        if (String(idToRemove) === draftActiveEstablishment) {
            setDraftActiveEstablishment("");
        }
    };

    // 🚨 REEMPLAZAMOS handleSave por la llamada al mutate
    const handleSave = () => {
        // La validación de cambios y la orquestación de API se hacen dentro del hook
        updateDoctorMutate({
            doctor: draftDoctor,
            initialDoctor: initialDoctor,
            draftEstablishments: draftEstablishments,
            initialEstablishments: initialEstablishments,
            selectedFile: selectedFile,
            draftActiveEstablishment: draftActiveEstablishment,
            doctorId: doctorId,
            updateActiveEstablishment: updateActiveEstablishment // Función del AuthContext
        });
    };

    const isPageLoading = loadingDoctor || loadingDoctorEst || loadingAllEst || loadingSpecialties || !draftDoctor;

    if (isPageLoading) return <div className="p-4">Cargando perfil...</div>;
    
    // Usamos draftDoctor en el render
    const displayDoctor = draftDoctor;

    return (
        <div className="profile-page-wrapper"> 
            
            <div className="profile-card"> 
                <h2 className="text-2xl font-semibold mb-4">Perfil del Médico</h2>

                <div className="profile-main-split">
                    {/* 1. COLUMNA IZQUIERDA: DATOS PERSONALES */}
                    <div className="profile-data-column">
                        <div className="profile-grid">
                            
                            {/* Campo: Email */}
                            <div>
                                <label className="font-medium">Email</label>
                                <input
                                    name="Email"
                                    value={displayDoctor.Email || ""}
                                    onChange={handleChange}
                                    className="profile-card-input"
                                />
                            </div>

                            {/* Campo: Especialidad */}
                            <div>
                                <label className="font-medium">Especialidad:</label>
                                <select
                                    name="EspecialidadID"
                                    value={displayDoctor.EspecialidadID || ""}
                                    onChange={handleChange}
                                    className="profile-card-input"
                                >
                                    {/* Usar el array de especialidades directamente desde la query */}
                                    {especialidades?.map((esp) => (
                                        <option key={esp.EspecialidadID} value={esp.EspecialidadID}>
                                            {esp.Descripcion}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Campo: Matrícula */}
                            <div>
                                <label className="font-medium">Matrícula</label>
                                <input
                                    name="Matricula"
                                    value={displayDoctor.Matricula || ""}
                                    onChange={handleChange}
                                    className="profile-card-input"
                                />
                            </div>

                            {/* Campo: Firma Texto */}
                            <div>
                                <label className="font-medium">Firma Texto</label>
                                <input
                                    name="FirmaTexto"
                                    value={displayDoctor.FirmaTexto || ""}
                                    onChange={handleChange}
                                    className="profile-card-input"
                                />
                            </div>

                            {/* Campo: Firma Imagen */}
                            <div className="md:col-span-2"> 
                                <label className="font-medium">Firma Imagen</label>
                                <label htmlFor="file-upload-input" className="file-upload-label">
                                    <input
                                        id="file-upload-input" 
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden-file-input" 
                                    />
                                    <span className="custom-placeholder">
                                        {selectedFile ? selectedFile.name : "Click aquí para subir archivo o arrastrar"}
                                    </span>
                                </label>
                                
                                {(displayDoctor.FirmaImagen || selectedFile) && (
                                    <img
                                        src={
                                            selectedFile 
                                            ? URL.createObjectURL(selectedFile) // Mostrar preview del archivo seleccionado
                                            : (displayDoctor.FirmaImagen.startsWith("data:")
                                            ? displayDoctor.FirmaImagen
                                            : `data:image/png;base64,${displayDoctor.FirmaImagen}`)
                                        }
                                        alt="Firma actual"
                                        className="mt-2 h-16 border rounded"
                                    />
                                )}
                            </div>
                        </div> 
                    </div> 


                    {/* 2. COLUMNA DERECHA: ESTABLECIMIENTOS */}
                    <div className="profile-est-column">
                        <div className="establishment-section"> 
                            <h3 className="text-lg font-semibold mb-2">Establecimientos vinculados</h3>
                            
                            <ul className="space-y-2">
                                {/* Usamos draftEstablishments para la lista editable */}
                                {draftEstablishments.map((est) => (
                                    <li key={est.EstablecimientoID} className="est-item">
                                        <label
                                            className={`flex items-center gap-2 ${
                                                draftActiveEstablishment === String(est.EstablecimientoID)
                                                ? "active-est"
                                                : ""
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="activeEstablishment"
                                                value={String(est.EstablecimientoID)}
                                                checked={draftActiveEstablishment === String(est.EstablecimientoID)}
                                                onChange={(e) => {
                                                    const value = String(e.target.value);
                                                    setDraftActiveEstablishment(value);
                                                }}
                                            />
                                            {est.Descripcion}
                                        </label>
                                        <button
                                            onClick={() => handleRemoveEstablishment(est.EstablecimientoID)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Eliminar
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            
                            {/* Añadir Establecimiento */}
                            <div className="mt-4 flex gap-2 items-center est-control-group"> 
                                <select
                                    value={selectedEstablishment}
                                    onChange={(e) => setSelectedEstablishment(e.target.value)}
                                    className="border p-2 rounded flex-1 profile-card-input"
                                >
                                    <option value="">Seleccionar establecimiento</option>
                                    {/* Usamos establishments para la lista de opciones */}
                                    {establishments?.map((est) => (
                                        <option key={est.EstablecimientoID} value={est.EstablecimientoID}>
                                            {est.Descripcion}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleAddEstablishment}
                                    className="btn-add-est"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div> 
                    </div> 

                </div> 
                
                {/* Botón Guardar Centrado Debajo de las Columnas */}
                <div className="save-button-wrapper">
                    <button
                        onClick={() => setShowConfirmModal(true)}
                        className="ingresar-btn" 
                        style={{ width: '300px' }}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    {saveError && <p style={{ color: 'red', marginTop: '10px' }}>Error: {saveError.message}</p>}
                </div>

            </div> 
            
            {/* MODAL DE CONFIRMACIÓN */}
            <ConfirmModal
                isOpen={showConfirmModal}
                message="¿Desea guardar los cambios realizados en su perfil?"
                onConfirm={handleSave}
                onCancel={() => setShowConfirmModal(false)}
            />
        </div> 
    );
}