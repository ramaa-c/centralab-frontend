import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getDoctorById, updateDoctor, getDoctorEstablishments, getAllEstablishments, addDoctorEstablishment, removeDoctorEstablishment, getAllSpecialties,setActiveEstablishmentForDoctor
} from "../../services/doctorService.js";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/perfil.css";
import "../../styles/login.css";

export default function PerfilUsuario() {
  const { user, updateActiveEstablishment } = useAuth();
  const doctorId = user?.id;
  const [draftActiveEstablishment, setDraftActiveEstablishment] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [doctorEstablishments, setDoctorEstablishments] = useState([]);
  const [initialDoctor, setInitialDoctor] = useState(null);
  const [initialDoctorEstablishments, setInitialDoctorEstablishments] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });

  useEffect(() => {
    fetchData();
  }, [doctorId]);

  const fetchData = async () => {
    try {
      const [doctorData, estData, allEstData, specialtiesData] = await Promise.all([
        getDoctorById(doctorId),
        getDoctorEstablishments(doctorId),
        getAllEstablishments(),
        getAllSpecialties(),
      ]);
      setDoctor(doctorData);
      setInitialDoctor(doctorData);
      setDoctorEstablishments(estData);
      setInitialDoctorEstablishments(estData);
      setEstablishments(allEstData);
      setEspecialidades(specialtiesData.List || []);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
      const userEst = user?.establecimientoId;
      if (userEst !== undefined && userEst !== null) {
        setDraftActiveEstablishment(String(userEst));
      } else {
        if (Array.isArray(estData) && estData.length > 0) {
          setDraftActiveEstablishment(String(estData[0].EstablecimientoID));
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor({ ...doctor, [name]: value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleAddEstablishment = () => {

    const alreadyExists = doctorEstablishments.some(
      (est) => est.EstablecimientoID === parseInt(selectedEstablishment)
    );
    if (alreadyExists) return;

    const establishmentToAdd = establishments.find(
      (est) => est.EstablecimientoID === parseInt(selectedEstablishment)
    );

    if (establishmentToAdd) {
      setDoctorEstablishments([...doctorEstablishments, establishmentToAdd]);
      setSelectedEstablishment("");
    }
  };

  const handleRemoveEstablishment = (idToRemove) => {
    const nuevaLista = doctorEstablishments.filter((est) => est.EstablecimientoID !== idToRemove);
    setDoctorEstablishments(nuevaLista);

    if (String(idToRemove) === draftActiveEstablishment) {
      setDraftActiveEstablishment("");
    }
  };

  const handleSave = async () => {
    setShowConfirmModal(false);
    const apiCalls = [];

    if (JSON.stringify(doctor) !== JSON.stringify(initialDoctor) || selectedFile) {
      let firmaBase64 = doctor.FirmaImagen;
      if (selectedFile) {
        firmaBase64 = await toBase64(selectedFile);
      }

      const payload = {
        MedicoID: doctor.MedicoID,
        EspecialidadID: parseInt(doctor.EspecialidadID),
        DNI: doctor.DNI,
        Email: doctor.Email,
        Denominacion: doctor.Denominacion,
        Matricula: doctor.Matricula,
        FirmaTexto: doctor.FirmaTexto,
        FirmaImagen: firmaBase64 || "",
      };
      apiCalls.push(updateDoctor(payload));
    }

    const added = doctorEstablishments.filter(
      (e) => !initialDoctorEstablishments.some((i) => i.EstablecimientoID === e.EstablecimientoID)
    );
    added.forEach((e) => apiCalls.push(addDoctorEstablishment(doctorId, e.EstablecimientoID)));

    const removed = initialDoctorEstablishments.filter(
      (i) => !doctorEstablishments.some((e) => e.EstablecimientoID === i.EstablecimientoID)
    );
    removed.forEach((e) => apiCalls.push(removeDoctorEstablishment(doctorId, e.EstablecimientoID)));

    try {
      await Promise.all(apiCalls);

      if (draftActiveEstablishment) {
        updateActiveEstablishment(Number(draftActiveEstablishment));
        console.log("Establecimiento activo actualizado en sesión:", draftActiveEstablishment);
      }

      setInitialDoctor(doctor);
      setInitialDoctorEstablishments(doctorEstablishments);
      console.log("Guardado correctamente. Establecimiento activo:", draftActiveEstablishment );
    } catch (error) {
      console.error("Error al guardar perfil:", error);
    }
  };

  if (isLoading || !doctor) return <div className="p-4">Cargando perfil...</div>;

  return (
    // 🚨 CRÍTICO: El div padre envuelve todo, incluyendo el Modal
    <div className="profile-page-wrapper"> 
      
      <div className="profile-card"> 
        <h2 className="text-2xl font-semibold mb-4">Perfil del Médico</h2>

        {/* 🚨 CRÍTICO: CONTENEDOR SPLIT DE DOS COLUMNAS */}
        <div className="profile-main-split">
            
            {/* ======================================= */}
            {/* 1. COLUMNA IZQUIERDA: DATOS PERSONALES */}
            {/* ======================================= */}
            <div className="profile-data-column">
                
                {/* GRID DE EMAIL, MATRÍCULA, etc. */}
                <div className="profile-grid">
                    
                    {/* Campo: Email */}
                    <div>
                      <label className="font-medium">Email</label>
                      <input
                        name="Email"
                        value={doctor.Email || ""}
                        onChange={handleChange}
                        className="profile-card-input"
                      />
                    </div>

                    {/* Campo: Especialidad */}
                    <div>
                      <label className="font-medium">Especialidad:</label>
                      <select
                        name="EspecialidadID"
                        value={doctor.EspecialidadID || ""}
                        onChange={handleChange}
                        className="profile-card-input"
                      >
                        {especialidades.map((esp) => (
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
                        value={doctor.Matricula || ""}
                        onChange={handleChange}
                        className="profile-card-input"
                      />
                    </div>

                    {/* Campo: Firma Texto */}
                    <div>
                      <label className="font-medium">Firma Texto</label>
                      <input
                        name="FirmaTexto"
                        value={doctor.FirmaTexto || ""}
                        onChange={handleChange}
                        className="profile-card-input"
                      />
                    </div>

                    {/* Campo: Firma Imagen (Ocupa dos columnas en el grid interno) */}
                    <div className="md:col-span-2"> 
                      <label className="font-medium">Firma Imagen</label>
                      <input type="file" onChange={handleFileChange} className="profile-card-input" />
                      {doctor.FirmaImagen && (
                        <img
                          src={
                            doctor.FirmaImagen.startsWith("data:")
                              ? doctor.FirmaImagen
                              : `data:image/png;base64,${doctor.FirmaImagen}`
                          }
                          alt="Firma actual"
                          className="mt-2 h-16 border rounded"
                          style={{ maxWidth: '200px' }}
                        />
                      )}
                    </div>
                </div> {/* Fin de profile-grid */}

            </div> {/* Fin de profile-data-column */}


            {/* ======================================= */}
            {/* 2. COLUMNA DERECHA: ESTABLECIMIENTOS */}
            {/* ======================================= */}
            <div className="profile-est-column">
                
                {/* 🚨 SECCIÓN ESTABLECIMIENTOS (Contenido Completo) */}
                <div className="establishment-section"> 
                    <h3 className="text-lg font-semibold mb-2">Establecimientos vinculados</h3>
                    
                    <ul className="space-y-2">
                        {doctorEstablishments.map((est) => (
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
                        {establishments.map((est) => (
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
                </div> {/* Fin de establishment-section */}

            </div> {/* Fin de profile-est-column */}

        </div> {/* Fin de profile-main-split */}
        
        
        {/* 🚨 CRÍTICO: Botón Guardar Centrado Debajo de las Columnas */}
        <div className="save-button-wrapper">
            <button
                onClick={() => setShowConfirmModal(true)}
                className="ingresar-btn" 
                style={{ width: '300px' }}
            >
                Guardar cambios
            </button>
        </div>

      </div> {/* Fin de profile-card */}
      
      {/* 🚨 MODAL DE CONFIRMACIÓN */}
      <ConfirmModal
        isOpen={showConfirmModal}
        message="¿Desea guardar los cambios realizados en su perfil?"
        onConfirm={handleSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div> 
  );
}