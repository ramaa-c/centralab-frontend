import React, { useEffect, useState } from "react";
/*import {
  getDoctorById, updateDoctor, getDoctorEstablishments, getAllEstablishments, addDoctorEstablishment, removeDoctorEstablishment, getAllSpecialties
} from "../../services/doctorService.js";
import ConfirmModal from "../../components/ConfirmModal.jsx";*/
import "@fortawesome/fontawesome-free/css/all.min.css"; // Para los iconos
import "../../styles/login.css"; // Para los estilos de la tarjeta

export default function PerfilUsuario() {
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id;
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
    setDoctorEstablishments(
      doctorEstablishments.filter((est) => est.EstablecimientoID !== idToRemove)
    );
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

    if (apiCalls.length === 0) return;

    try {
      await Promise.all(apiCalls);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading || !doctor) return <div className="p-4">Cargando perfil...</div>;

  return (
    // 🚨 CRÍTICO: Usamos un único div padre para envolver todo (Perfil + Modal)
    <div className="login-page" style={{ padding: '40px 0' }}> 
        
        {/* Fondo decorativo (las bolas celestes) */}
        <div className="decorative-background">
          <div className="shape-top"></div>
          <div className="shape-bottom"></div>
        </div>

        {/* Tarjeta principal - Estilo login-card pero ancho completo */}
        {/* Usamos el layout de tarjeta simple que definimos anteriormente */}
        <div className="login-card full-width-card"> 
          
          <div className="profile-content p-6 w-full">
            <h2 className="card-title" style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>Perfil del Médico</h2>

            {/* Bloque de Formulario y Campos (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Campo: Email */}
              <div>
                <label className="font-medium card-subtitle">Email</label>
                <input
                  name="Email"
                  value={doctor.Email || ""}
                  onChange={handleChange}
                  // Añadimos la clase de estilo de input de login para consistencia
                  className="w-full border p-2 rounded login-form-input" 
                />
              </div>

              {/* Campo: Especialidad */}
              <div>
                <label className="font-medium card-subtitle">Especialidad:</label>
                <select
                  name="EspecialidadID"
                  value={doctor.EspecialidadID || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded login-form-input" 
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
                <label className="font-medium card-subtitle">Matrícula</label>
                <input
                  name="Matricula"
                  value={doctor.Matricula || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded login-form-input"
                />
              </div>

              {/* Campo: Firma Texto */}
              <div>
                <label className="font-medium card-subtitle">Firma Texto</label>
                <input
                  name="FirmaTexto"
                  value={doctor.FirmaTexto || ""}
                  onChange={handleChange}
                  className="w-full border p-2 rounded login-form-input"
                />
              </div>

              {/* Campo: Firma Imagen */}
              <div className="md:col-span-2"> 
                <label className="font-medium card-subtitle">Firma Imagen</label>
                <input type="file" onChange={handleFileChange} className="w-full p-2" />
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
            </div> {/* Fin de Grid */}

            {/* Sección Establecimientos */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 card-subtitle">Establecimientos vinculados</h3>

              {/* Lista de Establecimientos */}
              <ul className="space-y-3">
                {doctorEstablishments.map((est) => (
                  <li
                    key={est.EstablecimientoID}
                    className="flex justify-between items-center border p-3 rounded"
                  >
                    <span className="font-medium">{est.Descripcion}</span>
                    <button
                      onClick={() => handleRemoveEstablishment(est.EstablecimientoID)}
                      className="text-red-600 hover:text-red-800 button-secondary"
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>

              {/* Selector para Agregar */}
              <div className="mt-4 flex gap-3 items-center">
                <select
                  value={selectedEstablishment}
                  onChange={(e) => setSelectedEstablishment(e.target.value)}
                  className="border p-2 rounded flex-1 login-form-input"
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
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ingresar-btn" 
                  style={{ width: 'auto', backgroundColor: '#0198CC' }} 
                >
                  Agregar
                </button>
              </div>
            </div>
            
            {/* Botón Guardar (Guardar cambios) */}
            <button
              onClick={() => setShowConfirmModal(true)}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 ingresar-btn" 
              style={{ width: '100%', fontSize: '1.1rem' }}
            >
              Guardar cambios
            </button>

          </div> {/* Fin de profile-content */}
        </div> {/* Fin de login-card */}
        
        {/* Modal: Ahora es un hijo directo del div padre */}
        <ConfirmModal
          isOpen={showConfirmModal}
          message="¿Desea guardar los cambios realizados en su perfil?"
          onConfirm={handleSave}
          onCancel={() => setShowConfirmModal(false)}
        />
    </div> 
  );
}