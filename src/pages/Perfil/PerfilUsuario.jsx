import React, { useEffect, useState } from "react";
import {
  getDoctorById, updateDoctor, getDoctorEstablishments, getAllEstablishments, addDoctorEstablishment, removeDoctorEstablishment, getAllSpecialties
} from "../../services/doctorService.js";
import ConfirmModal from "../../components/ConfirmModal.jsx";

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
    <>
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">Perfil del Médico</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-medium">Email</label>
          <input
            name="Email"
            value={doctor.Email || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="font-medium">Especialidad:</label>
          <select
            name="EspecialidadID"
            value={doctor.EspecialidadID || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            {especialidades.map((esp) => (
              <option key={esp.EspecialidadID} value={esp.EspecialidadID}>
                {esp.Descripcion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-medium">Matrícula</label>
          <input
            name="Matricula"
            value={doctor.Matricula || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="font-medium">Firma Texto</label>
          <input
            name="FirmaTexto"
            value={doctor.FirmaTexto || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="font-medium">Firma Imagen</label>
          <input type="file" onChange={handleFileChange} />
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

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Establecimientos vinculados</h3>

        <ul className="space-y-2">
          {doctorEstablishments.map((est) => (
            <li
              key={est.EstablecimientoID}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>{est.Descripcion}</span>
              <button
                onClick={() => handleRemoveEstablishment(est.EstablecimientoID)}
                className="text-red-600 hover:text-red-800"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2 items-center">
          <select
            value={selectedEstablishment}
            onChange={(e) => setSelectedEstablishment(e.target.value)}
            className="border p-2 rounded flex-1"
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
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Agregar
          </button>
        </div>
      </div>
      <button
        onClick={() => setShowConfirmModal(true)}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
          Guardar cambios
      </button>
    </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        message="¿Desea guardar los cambios realizados en su perfil?"
        onConfirm={handleSave}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}
