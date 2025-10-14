import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { crearReceta } from "../../services/authService";

export default function Receta() {
  const { register, handleSubmit, watch } = useForm();
  const navigate = useNavigate();

  const [practicasSeleccionadas, setPracticasSeleccionadas] = useState([]);
  const [error, setError] = useState(null);

  const coberturaSeleccionada = watch("Cobertura");

  // Hooks reutilizables 👇
  const { data: diagnosticos, error: errDiag } = useApi("/api/diagnostics");
  const { data: coberturas, error: errCob } = useApi("/api/private_healthcares");
  const { data: practicas, error: errPract } = useApi("/api/tests/all");

  // Planes se cargan según la cobertura seleccionada (no automático)
  const { data: planes, fetchData: fetchPlanes } = useApi(null, false);

  // 🔹 cargar planes solo cuando cambia la cobertura
  useEffect(() => {
    if (coberturaSeleccionada) {
      fetchPlanes(`/api/private_healthcares/${coberturaSeleccionada}/plans`);
    }
  }, [coberturaSeleccionada]);

  // 🔹 agregar práctica
  const handleAgregarPractica = (id) => {
    const practica = practicas.find((p) => p.PracticaID === parseInt(id));
    if (!practica) return;
    if (practicasSeleccionadas.some((p) => p.PracticaID === practica.PracticaID)) return;
    setPracticasSeleccionadas([...practicasSeleccionadas, practica]);
  };

  // 🔹 eliminar práctica
  const handleEliminarPractica = (id) => {
    setPracticasSeleccionadas(practicasSeleccionadas.filter((p) => p.PracticaID !== id));
  };

  // 🔹 enviar receta
  const enviar = async (data) => {
    try {
      const payload = {
        Prescription: {
          RecetaID: 0,
          fchReceta: data.Fecha,
          EstablecimientoID: 1,
          MedicoID: 1,
          PacienteID: parseInt(data.Paciente) || 0,
          DiagnosticoID: parseInt(data.Diagnostico) || 0,
          Notas: data.Notas || "",
          NotasReceta: "Generada desde el portal web",
          PrepagaPlanID: parseInt(data.Plan),
          Activo: "1",
          MomentoAlta: new Date().toISOString(),
        },
        Credential: localStorage.getItem("token") || "credencial-temporal",
        Tests: practicasSeleccionadas.map((p) => ({
          PracticaID: p.PracticaID,
          Comentario: p.Descripcion || "",
        })),
      };

      await crearReceta(payload);
      alert("Receta registrada correctamente ✅");
      navigate("/perfil");
    } catch (err) {
      console.error("Error al enviar la receta:", err);
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ textAlign: "center", marginTop: "40px" }}>
      <h1 className="main-title">Registrar Receta</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <label>Documento:</label>
        <input type="text" placeholder="Documento" {...register("Documento", { required: true })} />
        <br /><br />

        <label>Paciente:</label>
        <input type="text" placeholder="Paciente (ID)" {...register("Paciente", { required: true })} />
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

        <label>Fecha:</label>
        <input type="date" {...register("Fecha", { required: true })} />
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
        <select {...register("Plan", { required: true })} disabled={!planes.length}>
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
          onClick={() => {
            const select = document.getElementById("comboPracticas");
            handleAgregarPractica(select.value);
          }}
        >
          ➕ Agregar
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
                  ❌
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <br />
        <button className="enviar" type="submit">
          Registrar Receta
        </button>
      </form>
    </div>
  );
}