import React, { useState, useEffect } from "react"; // Eliminamos useEffect
import { useAuth } from "../../context/AuthContext";
// ❌ Eliminamos las importaciones directas de servicios de carga de datos
import {
  updateDoctor,
  addDoctorEstablishment,
  removeDoctorEstablishment,
} from "../../services/doctorService.js";
import ConfirmModal from "../../components/ConfirmModal.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../styles/perfil.css";
import "../../styles/login.css";

// 💡 Importamos el nuevo hook
import { useDoctorProfileData } from "../../hooks/useDoctorProfileData.js"; 

export default function PerfilUsuario() {
  const { user, updateActiveEstablishment } = useAuth();
  const doctorId = user?.id;
    
  // 1. Usamos el nuevo hook para obtener los datos y el estado de carga/error
  const {
    profile, 
    doctorEstablishments: currentDoctorEstablishments, // Renombrado para evitar conflicto con el setter local
    allEstablishments,
    specialties: especialidadesFromHook, // Renombrado para usarlo en la vista
    loading, // Estado de carga ahora viene del hook
    error,
  } = useDoctorProfileData(doctorId); 

  // --- ESTADOS LOCALES ---
  // Mantenemos los estados que manejan la interacción del usuario y los cambios (drafts/borradores)
  const [draftActiveEstablishment, setDraftActiveEstablishment] = useState("");
  // 'doctor' será nuestro borrador de los datos del perfil
  const [doctor, setDoctor] = useState(null); 
  // 'doctorEstablishments' será nuestro borrador de los establecimientos vinculados
  const [doctorEstablishments, setDoctorEstablishments] = useState([]);
  
  // Guardamos las versiones iniciales para el cálculo de cambios
  const [initialDoctor, setInitialDoctor] = useState(null);
  const [initialDoctorEstablishments, setInitialDoctorEstablishments] = useState([]);

  // Eliminamos: especialidades, establishments (vienen del hook)
  const [selectedEstablishment, setSelectedEstablishment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  // Eliminamos: isLoading (ahora es 'loading' del hook)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  // 2. Lógica para inicializar los estados locales (borradores) cuando el hook termina de cargar
    useEffect(() => {
    // Solo inicializa si los datos están cargados y aún no se ha inicializado
    if (profile && currentDoctorEstablishments && !isInitialized) { 

      // 1. Inicializar el estado del doctor
      setDoctor(profile);
      setInitialDoctor(profile);
      
      // 2. Inicializar los establecimientos (borradores)
      setDoctorEstablishments(currentDoctorEstablishments);
      setInitialDoctorEstablishments(currentDoctorEstablishments);

      // 3. Inicializar el establecimiento activo
      const userEst = user?.establecimientoId;
      if (userEst !== undefined && userEst !== null) {
        setDraftActiveEstablishment(String(userEst));
      } else if (Array.isArray(currentDoctorEstablishments) && currentDoctorEstablishments.length > 0) {
        setDraftActiveEstablishment(String(currentDoctorEstablishments[0].EstablecimientoID));
      }

      // 4. Establecer el flag a true para evitar futuras ejecuciones
      setIsInitialized(true); 
    }

    if (error) {
      console.error("Error cargando el perfil desde el hook:", error);
    }
  // Se eliminan las dependencias que cambian (como user?.establecimientoId)
  // y solo se deja 'isInitialized' para que React no se queje si se usa en el cuerpo del efecto.
  }, [profile, currentDoctorEstablishments, error, user?.establecimientoId, isInitialized]);


  // Función para convertir archivo a Base64 (se mantiene igual)
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  // --- Handlers (se mantienen casi idénticos) ---

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

    // Usamos allEstablishments que viene del hook
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
    
    // 1. Guardar cambios del perfil y firma
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

    // 2. Guardar cambios en los establecimientos (añadir/eliminar)
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

      // 3. Actualizar el establecimiento activo en sesión
      if (draftActiveEstablishment) {
        // Asumo que updateActiveEstablishment también actualiza el backend si es necesario,
        // si no, deberías llamar a setActiveEstablishmentForDoctor aquí.
        updateActiveEstablishment(Number(draftActiveEstablishment)); 
        console.log("Establecimiento activo actualizado en sesión:", draftActiveEstablishment);
      }

      // 4. Actualizar los estados iniciales después de guardar exitosamente
      setDoctor(newDoctorState); 
      setInitialDoctor(newDoctorState); 
      setInitialDoctorEstablishments(doctorEstablishments);
      setSelectedFile(null); 
      
      console.log("Guardado correctamente. Establecimiento activo:", draftActiveEstablishment);
    } catch (error) {
      console.error("Error al guardar perfil:", error);
    }
  };

  // --- Renderizado ---

  // Usamos 'loading' del hook y verificamos que 'doctor' (el borrador) exista
  if (loading || !doctor) return <div className="p-4">Cargando perfil...</div>;
  
  // Si hay un error, puedes mostrar un mensaje de error
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

              {/* Campo: Matrícula (y otros campos de la izquierda... se mantienen iguales) */}
              {/* ... */}
              
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
                  {/* Usamos allEstablishments que viene del hook */}
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