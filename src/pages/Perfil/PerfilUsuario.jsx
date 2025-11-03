import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  updateDoctor,
  addDoctorEstablishment,
  removeDoctorEstablishment,
} from "../../services/doctorService.js";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/perfil.css";
import "../../styles/login.css";

import { useDoctorProfileData } from "../../hooks/useDoctorProfileData.js"; 

export default function PerfilUsuario() {
  const { user, updateActiveEstablishment } = useAuth();
  const doctorId = user?.id;
    
  const {
    profile, 
    doctorEstablishments: currentDoctorEstablishments,
    allEstablishments,
    specialties: especialidadesFromHook,
    loading,
    error,
  } = useDoctorProfileData(doctorId); 

  const [draftActiveEstablishment, setDraftActiveEstablishment] = useState("");
  const [doctor, setDoctor] = useState(null); 
  const [doctorEstablishments, setDoctorEstablishments] = useState([]);
  const [initialDoctor, setInitialDoctor] = useState(null);
  const [initialDoctorEstablishments, setInitialDoctorEstablishments] = useState([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
    useEffect(() => {
    if (profile && currentDoctorEstablishments && !isInitialized) { 

      setDoctor(profile);
      setInitialDoctor(profile);
      
      setDoctorEstablishments(currentDoctorEstablishments);
      setInitialDoctorEstablishments(currentDoctorEstablishments);

      const userEst = user?.establecimientoId;
      if (userEst !== undefined && userEst !== null) {
        setDraftActiveEstablishment(String(userEst));
      } else if (Array.isArray(currentDoctorEstablishments) && currentDoctorEstablishments.length > 0) {
        setDraftActiveEstablishment(String(currentDoctorEstablishments[0].EstablecimientoID));
      }

      setIsInitialized(true); 
    }

    if (error) {
      console.error("Error cargando el perfil desde el hook:", error);
    }
  }, [profile, currentDoctorEstablishments, error, user?.establecimientoId, isInitialized]);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

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

    const establishmentToAdd = allEstablishments.find(
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
    let newDoctorState = { ...doctor };
    
    if (JSON.stringify(doctor) !== JSON.stringify(initialDoctor) || selectedFile) {
      let firmaBase64 = doctor.FirmaImagen;
      if (selectedFile) {
        firmaBase64 = await toBase64(selectedFile);
        newDoctorState.FirmaImagen = firmaBase64;
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
      }

      setDoctor(newDoctorState); 
      setInitialDoctor(newDoctorState); 
      setInitialDoctorEstablishments(doctorEstablishments);
      setSelectedFile(null); 
      
    } catch (error) {
      console.error("Error al guardar perfil:", error);
    }
  };

  if (loading || !doctor) return <div className="p-4">Cargando perfil...</div>;
  
  if (error) return <div className="p-4 text-red-500">Error al cargar el perfil: {error.message}</div>;


  return (
    <div className="profile-page-wrapper">
      <div className="profile-card">
        <h2 className="text-2xl font-semibold mb-4">Perfil del Médico</h2>
        <div className="profile-main-split">
          {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
          <div className="profile-data-column">
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
                  {/* Usamos especialidadesFromHook (que es specialties del hook) */}
                  {especialidadesFromHook.map((esp) => (
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

                {doctor.FirmaImagen && (
                  <img
                    src={
                      doctor.FirmaImagen.startsWith("data:")
                        ? doctor.FirmaImagen
                        : `data:image/png;base64,${doctor.FirmaImagen}`
                    }
                    alt="Firma actual"
                    className="mt-2 h-16 border rounded"
                  />
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: ESTABLECIMIENTOS */}
          <div className="profile-est-column">
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

              <div className="mt-4 flex gap-2 items-center est-control-group">
                <select
                  value={selectedEstablishment}
                  onChange={(e) => setSelectedEstablishment(e.target.value)}
                  className="border p-2 rounded flex-1 profile-card-input"
                >
                  <option value="">Seleccionar establecimiento</option>
                  {allEstablishments.map((est) => (
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
        <div className="save-button-wrapper">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="ingresar-btn"
            style={{ width: '300px' }}
          >
            Guardar cambios
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        message="¿Desea guardar los cambios realizados en su perfil?"
        onConfirm={handleSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}