import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createPortal } from "react-dom";
import { useApi } from "../../hooks/useApi";
import { crearReceta } from "../../services/authService";

export default function NuevaRecetaModal({ paciente: pacienteProp, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id || 0;
  const establecimientoId = user?.establecimientoId || 1;
  console.log("dortor id:",doctorId, "establecimiento id:" ,establecimientoId);
  const { register, handleSubmit, watch, setValue } = useForm();
  const pacienteRecibido = pacienteProp || null;
  const [practicasSeleccionadas, setPracticasSeleccionadas] = useState([]);
  const [error, setError] = useState(null);
  const [dniPaciente, setDniPaciente] = useState(pacienteRecibido?.DNI || "");
  const coberturaSeleccionada = watch("Cobertura");
  const { data: diagnosticos } = useApi("/api/diagnostics");
  const { data: coberturas } = useApi("/api/private_healthcares");
  const { data: practicas } = useApi("/api/tests/all");
  const { data: pacientes } = useApi("/api/patients");
  const { data: credencialData, fetchData: fetchCredencial } = useApi(null, false);
  const { data: planes, fetchData: fetchPlanes } = useApi(null, false);

  useEffect(() => {
    if (coberturaSeleccionada) {
      fetchPlanes(`/api/private_healthcares/${coberturaSeleccionada}/plans`);
    }
  }, [coberturaSeleccionada]);

  useEffect(() => {
    if (pacienteRecibido) {
      setValue("Paciente", pacienteRecibido.PacienteID);
    }
  }, [pacienteRecibido, setValue]);

  useEffect(() => {
  const pacienteId = pacienteRecibido?.PacienteID || watch("Paciente");
  if (pacienteId) {
    fetchCredencial(`/api/patients/${pacienteId}/credentials`);
  }
  }, [pacienteRecibido, watch("Paciente")]);

  const handleAgregarPractica = (id) => {
    const practica = practicas.find((p) => p.PracticaID === id);
    if (!practica) return;
    if (practicasSeleccionadas.some((p) => p.PracticaID === practica.PracticaID)) return;
    setPracticasSeleccionadas([...practicasSeleccionadas, practica]);
  };

  const handleEliminarPractica = (id) => {
    setPracticasSeleccionadas(practicasSeleccionadas.filter((p) => p.PracticaID !== id));
  };

  const enviar = async (data) => {
    try {
      const payload = {
        Prescription: {
          RecetaID: 0,
          fchReceta: new Date().toISOString().slice(0, 19),
          EstablecimientoID: establecimientoId,
          MedicoID: doctorId,
          PacienteID: parseInt(data.Paciente) || pacienteRecibido?.PacienteID || 0,
          DiagnosticoID: parseInt(data.Diagnostico) || 0,
          Notas: data.Notas || "",
          NotasReceta: data.NotasReceta || "",
          PrepagaPlanID: parseInt(data.Plan),
          Activo: "1",
          MomentoAlta: new Date().toISOString().slice(0, 19),
        },
        Credential:credencialData?.List?.[0]?.Credencial || "credencial-temporal",
        Tests: practicasSeleccionadas.map((p) => ({
          PracticaID: p.PracticaID,
          Comentario: p.Descripcion || "",
        })),
      };

      const response = await crearReceta(payload);
      alert(response.message || "Receta creada correctamente");
      onClose();
    } catch (err) {
      console.error("Error al enviar la receta:", err);
      setError(err.message);
    }
  };

  return createPortal(
  // 1. Contenedor del fondo (Backdrop)
  // Aquí se aplican estilos para que ocupe toda la pantalla y tenga el fondo oscuro.
  <div className="modal-backdrop">
    {/* 2. Contenedor del contenido (Modal Content)
        Aquí se aplican estilos para el color de fondo (blanco) y el tamaño del modal. */}
    <div className="modal-content">

      {/* 3. Tu contenido original */}
      {/* Se mantiene la clase 'container' pero se recomienda quitar el 'marginTop'
          ya que el centrado ahora lo maneja 'modal-backdrop' */}
      <div className="container" style={{ textAlign: "center" }}>
        <h1 className="main-title">Registrar Receta</h1>

        <form className="Formulario" onSubmit={handleSubmit(enviar)}>
          <label>Paciente:</label>
          {pacienteRecibido ? (
            <>
              <p>
                <strong>
                  {pacienteRecibido.Apellido} {pacienteRecibido.Nombres}
                </strong>
              </p>
              <p>DNI: {pacienteRecibido.DNI}</p>
              <input
                type="hidden"
                value={pacienteRecibido.PacienteID}
                {...register("Paciente")}
              />
            </>
          ) : (
            <>
              <select
                {...register("Paciente", { required: true })}
                onChange={(e) => {
                  const seleccionado = pacientes.find(
                    (p) => p.PacienteID === parseInt(e.target.value)
                  );
                  setDniPaciente(seleccionado ? seleccionado.DNI : "");
                }}
              >
                <option value="">Selecciona un paciente</option>
                {pacientes.map((p) => (
                  <option key={p.PacienteID} value={p.PacienteID}>
                    {p.Apellido} {p.Nombres}
                  </option>
                ))}
              </select>
              {dniPaciente && <p>DNI: {dniPaciente}</p>}
            </>
          )}
          <br /><br />

          <label>Fecha:</label>
          <input type="date" {...register("Fecha", { required: true })} />
          <br /><br />

          <label>Diagnóstico:</label>
          <select {...register("Diagnostico", { required: true })}>
            <option value="">Selecciona un diagnóstico</option>
            {diagnosticos.map((d) => (
              <option key={d.DiagnosticoID} value={d.DiagnosticoID}>
                {d.Descripcion}
              </option>
            ))}
          </select>
          <br /><br />

          <label>Cobertura:</label>
          <select {...register("Cobertura", { required: true })}>
            <option value="">Selecciona una cobertura</option>
            {coberturas.map((c) => (
              <option key={c.PrepagaID} value={c.PrepagaID}>
                {c.Denominacion}
              </option>
            ))}
          </select>
          <br /><br />

          <label>Plan:</label>
          <select {...register("Plan", { required: true })} >
            <option value="">Selecciona un plan</option>
            {planes.map((p) => (
              <option key={p.PrepagaPlanID} value={p.PrepagaPlanID}>
                {p.Denominacion}
              </option>
            ))}
          </select>
          <br /><br />

          <label>Prácticas:</label>
          <select id="comboPracticas" {...register("PracticaTemp")}>
            <option value="">Selecciona una práctica</option>
            {practicas.map((p) => (
              <option key={p.PracticaID} value={p.PracticaID}>
                {p.Descripcion}
              </option>
            ))}
          </select>
          <button
            type="button"
            style={{ marginLeft: "10px" }}
            onClick={() => handleAgregarPractica(watch("PracticaTemp"))}
          >
            <i className="fa-solid fa-plus"></i> Agregar
          </button>

          <br /><br />

          <h3>Prácticas seleccionadas:</h3>
          {practicasSeleccionadas.length === 0 ? (
            <p>No hay prácticas agregadas</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {practicasSeleccionadas.map((p) => (
                <li key={p.PracticaID}>
                  {p.Descripcion}{" "}
                  <button type="button" onClick={() => handleEliminarPractica(p.PracticaID)}>
                    <i className="fa-solid fa-x"></i>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <br />
          <label>Notas:</label>
          <br />
          <textarea
            {...register("Notas")} placeholder="Nota de receta..." rows="3" 
          />
          <br /><br />

          <label>Observaciones al laboratorio:</label>
          <textarea
            {...register("NotasReceta")} placeholder="Nota al laboratorio..." rows="3" 
          />
          <br /><br />

          {error && <p style={{ color: "red" }}>{error}</p>}

          <br />
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button className="enviar" type="submit">
              Registrar Receta
            </button>
            <button
              type="button"
              onClick={onClose} // CAMBIO CLAVE: Usa onClose para cerrar el modal
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            >
              Volver
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>,
  document.getElementById("modal-root")
);
}
