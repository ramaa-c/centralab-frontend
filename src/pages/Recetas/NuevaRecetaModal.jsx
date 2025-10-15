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
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
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
  const [searchTerm, setSearchTerm] = useState('');
  const filteredPacientes = pacientes?.filter(p => {
    const term = searchTerm.toLowerCase();
    const fullName = `${p.Apellido} ${p.Nombres}`.toLowerCase();
    return (
      p.DNI?.toString().includes(term) || 
      fullName.includes(term)
    );
  }) || [];

  useEffect(() => {
        // Bloquea el scroll y evita el salto visual
        document.body.style.overflow = 'hidden'; 
        document.body.style.paddingRight = '10px'; 
        
        // 1. Define el handler de la tecla Esc
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose(); 
            }
        };

        // 2. Adjunta el escuchador
        document.addEventListener('keydown', handleEscape);

        return () => {
            // 3. Limpieza: Desbloquea scroll y elimina el escuchador
            document.body.style.overflow = 'unset'; 
            document.body.style.paddingRight = '0';
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);
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

  const handleBackdropClick = (e) => {
    // Si el clic ocurrió directamente en el fondo (y no en un hijo)
    if (e.target === e.currentTarget) {
        onClose();
    }
};


  return createPortal(
  // 1. Contenedor del fondo (Backdrop)
  
  // Aquí se aplican estilos para que ocupe toda la pantalla y tenga el fondo oscuro.
  <div className="modal-backdrop"onClick={handleBackdropClick}>
     
    
        
    {/* 2. Contenedor del contenido (Modal Content)
        Aquí se aplican estilos para el color de fondo (blanco) y el tamaño del modal. */}
    <div className="modal-content"onClick={(e) => e.stopPropagation()}>

      {/* 3. Tu contenido original */}
      {/* Se mantiene la clase 'container' pero se recomienda quitar el 'marginTop'
          ya que el centrado ahora lo maneja 'modal-backdrop' */}
      <div className="container" style={{ textAlign: "center" }}>
        <h1 className="main-title">Registrar Receta</h1>

        <form className="Formulario" onSubmit={handleSubmit(enviar)}>

          {/* Paciente */}
<div className="field-wrapper">
    <label>Paciente:</label>
    {pacienteRecibido ? (
        // 🚨 BLOQUE 1: Paciente Recibido por Props (No requiere búsqueda)
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '10px', 
            backgroundColor: '#f9f9f9', /* Fondo gris claro */
            borderRadius: '5px',
            color: '#333' /* Texto oscuro asegurado */
        }}>
            <strong style={{ fontSize: '1.1em' }}>
                {pacienteRecibido.Apellido} {pacienteRecibido.Nombres}
            </strong>
            <span style={{ color: '#666', fontSize: '0.9em' }}>DNI: {pacienteRecibido.DNI}</span>
            <input
                type="hidden"
                value={pacienteRecibido.PacienteID}
                {...register("Paciente")}
            />
        </div>
    ) : (
        // 🚨 BLOQUE 2: Selección de Paciente (CON BÚSQUEDA)
        <>
            {/* 🚨 CRÍTICO: 1. Campo de Búsqueda por DNI/Nombre */}
            <div className="field-wrapper" style={{ marginBottom: '5px' }}>
                <input
                    type="text"
                    placeholder="Buscar por DNI o Nombre/Apellido"
                    className="select-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el estado de búsqueda
                />
            </div>
            
            {/* 🚨 CRÍTICO: 2. Combo de selección FILTRADO */}
            <div className="select-container">
                <select
                    {...register("Paciente", { required: "Selecciona un paciente" })}
                    className={`select-input ${errors.Paciente ? "input-error" : ""}`}
                    onChange={(e) => {
                        const seleccionado = pacientes?.find((p) => p.PacienteID === parseInt(e.target.value));
                        setDniPaciente(seleccionado ? seleccionado.DNI : "");
                        setValue("Paciente", e.target.value); // Asigna el valor del paciente seleccionado
                    }}
                >
                    <option value="">Selecciona un paciente</option>
                    {/* Usamos la lista filtrada */}
                    {filteredPacientes.map((p) => (
                        <option key={p.PacienteID} value={p.PacienteID}>
                            {p.Apellido} {p.Nombres} (DNI: {p.DNI})
                        </option>
                    ))}
                </select>
                {errors.Paciente && <p className="error-msg">{errors.Paciente.message}</p>}
                {dniPaciente && <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '5px' }}>DNI: {dniPaciente}</p>}
            </div>
        </>
    )}
</div>

          {/* Fecha */}
          <div className="field-wrapper">
            <label>Fecha:</label>
            <input
              type="date"
              className={`select-input ${errors.Fecha ? "input-error" : ""}`}
              {...register("Fecha", { required: "Campo obligatorio" })}
            />
            {errors.Fecha && <p className="error-msg">{errors.Fecha.message}</p>}
          </div>

          {/* Diagnóstico */}
          <div className="field-wrapper">
            <label>Diagnóstico:</label>
            <select
              {...register("Diagnostico", { required: "Campo obligatorio" })}
              className={`select-input ${errors.Diagnostico ? "input-error" : ""}`}
            >
              <option value="">Selecciona un diagnóstico</option>
              {diagnosticos.map((d) => (
                <option key={d.DiagnosticoID} value={d.DiagnosticoID}>
                  {d.Descripcion}
                </option>
              ))}
            </select>
            {errors.Diagnostico && <p className="error-msg">{errors.Diagnostico.message}</p>}
          </div>

          {/* Cobertura */}
          <div className="field-wrapper">
            <label>Cobertura:</label>
            <select
              {...register("Cobertura", { required: "Campo obligatorio" })}
              className={`select-input ${errors.Cobertura ? "input-error" : ""}`}
            >
              <option value="">Selecciona una cobertura</option>
              {coberturas.map((c) => (
                <option key={c.PrepagaID} value={c.PrepagaID}>
                  {c.Denominacion}
                </option>
              ))}
            </select>
            {errors.Cobertura && <p className="error-msg">{errors.Cobertura.message}</p>}
          </div>

          {/* Plan */}
          <div className="field-wrapper">
            <label>Plan:</label>
            <select
              {...register("Plan", { required: "Campo obligatorio" })}
              className={`select-input ${errors.Plan ? "input-error" : ""}`}
            >
              <option value="">Selecciona un plan</option>
              {planes.map((p) => (
                <option key={p.PrepagaPlanID} value={p.PrepagaPlanID}>
                  {p.Denominacion}
                </option>
              ))}
            </select>
            {errors.Plan && <p className="error-msg">{errors.Plan.message}</p>}
          </div>

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
            className="add-practice-btn" 
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
          <div style={{ display: "center", justifyContent: "center", gap: "10px" }}>
            <button className="enviar" type="submit">
              Registrar Receta
            </button>
            
          </div>
        </form>
      </div>

    </div>
  </div>,
  document.getElementById("modal-root")
);
}
