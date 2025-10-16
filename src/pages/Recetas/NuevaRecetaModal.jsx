import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select';
import { createPortal } from "react-dom";
import { useApi } from "../../hooks/useApi";
import { crearReceta } from "../../services/authService";
import RecetaPreview from '../../components/RecetaPreview.jsx';
import { getDoctorById } from "../../services/doctorService";

export default function NuevaRecetaModal({ paciente: pacienteProp, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id || 0;
  const establecimientoId = user?.establecimientoId || 1;
  console.log("dortor id:",doctorId, "establecimiento id:" ,establecimientoId);
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm();
  const watchedValues = watch();
  const pacienteRecibido = pacienteProp || null;
  const [practicasSeleccionadas, setPracticasSeleccionadas] = useState([]);
  const [error, setError] = useState(null);
  const coberturaSeleccionada = watch("Cobertura");
  const { data: diagnosticos } = useApi("/api/diagnostics");
  const { data: coberturas } = useApi("/api/private_healthcares");
  const { data: practicas } = useApi("/api/tests/all");
  const { data: practicasNormales } = useApi("/api/RD/PrescriptionOrder");
  const { data: pacientes } = useApi("/api/patients");
  const [doctorData, setDoctorData] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await getDoctorById(doctorId);
        setDoctorData(data);
      } catch (error) {
        console.error("Error al obtener datos del doctor:", error);
      }
    };
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  const { data: credencialData, fetchData: fetchCredencial } = useApi(null, false);
  const { data: planes, fetchData: fetchPlanes } = useApi(null, false);

  const pacienteOptions = useMemo(() =>
      pacientes?.map(p => ({
          value: p.PacienteID,
          label: `${p.Apellido} ${p.Nombres} (DNI: ${p.DNI})`
      })) || [],
      [pacientes]
  );

  useEffect(() => {
        document.body.style.overflow = 'hidden'; 
        document.body.style.paddingRight = '10px'; 
        
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose(); 
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
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
    const listaPracticas = practicas?.List || practicas || [];
    const practica = listaPracticas.find((p) => p.PracticaID === id);

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
    if (e.target === e.currentTarget) {
        onClose();
    }
  };

  const previewData = useMemo(() => {
    const selectedPaciente = pacientes.find(p => p.PacienteID === parseInt(watchedValues.Paciente)) || pacienteRecibido;
    const selectedDiagnostico = diagnosticos.find(d => d.DiagnosticoID === parseInt(watchedValues.Diagnostico));
    const selectedCobertura = coberturas.find(c => c.PrepagaID === parseInt(watchedValues.Cobertura));
    const selectedPlan = planes.find(p => p.PrepagaPlanID === parseInt(watchedValues.Plan));

    return {
      paciente: selectedPaciente ? {
          NombreCompleto: `${selectedPaciente.Apellido} ${selectedPaciente.Nombres}`,
          DNI: selectedPaciente.DNI
      } : null,
      fecha: watchedValues.Fecha
        ? new Date(watchedValues.Fecha + 'T00:00:00').toLocaleDateString('es-AR')
        : '',
      diagnostico: selectedDiagnostico,
      cobertura: selectedCobertura,
      plan: selectedPlan,
      practicas: practicasSeleccionadas,
      notas: watchedValues.Notas,
      notasReceta: watchedValues.NotasReceta,
      doctorName: `${user?.apellido} ${user?.nombres}`,
      firmaImagen: doctorData?.FirmaImagen || null,
    };
  }, [
    watchedValues,
    practicasSeleccionadas,
    pacientes,
    diagnosticos,
    coberturas,
    planes,
    pacienteRecibido,
    doctorData,
    user
  ]);

  const coberturaOptions = useMemo(() => 
      coberturas?.map(c => ({
          value: c.PrepagaID,
          label: c.Denominacion
      })) || [],
      [coberturas]
  );

  const NUM_COLUMNAS = 3;

  const practicasOrdenadas = [...(practicasNormales || [])]
    .sort((a, b) => {
      if (a.Columna !== b.Columna) return a.Columna - b.Columna;
      return a.Orden - b.Orden;
    });

  const columnas = Array.from({ length: NUM_COLUMNAS }, () => []);

  practicasOrdenadas.forEach((p, index) => {
    const columnaIndex = index % NUM_COLUMNAS;
    columnas[columnaIndex].push(p);
  });

  return createPortal(
  <div className="modal-backdrop">
    <div className="modal-content wide">
      <div className="modal-body-split">
        <div className="form-wrapper" style={{ textAlign: "center" }}>
        <h1 className="main-title">Nueva Receta</h1>

        <form className="Formulario" onSubmit={handleSubmit(enviar)}>

        {/* Paciente */}
        <div className="field-wrapper">
            <label>Paciente:</label>
            {pacienteRecibido ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '5px',
                    color: '#333'
                }}>
                    <strong>
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
                <Controller
                    name="Paciente"
                    control={control}
                    rules={{ required: "Debes seleccionar un paciente" }}
                    render={({ field, fieldState: { error } }) => (
                        <>
                        <div className={error ? 'select-container-error' : ''}>
                            <Select
                                {...field}
                                options={pacienteOptions}
                                value={pacienteOptions.find(option => option.value === field.value)}
                                onChange={option => field.onChange(option ? option.value : null)}
                                placeholder="Escribe para buscar y seleccionar un paciente..."
                                isClearable
                                isLoading={!pacientes} 
                                loadingMessage={() => "Cargando pacientes..."}
                                noOptionsMessage={() => "No se encontraron pacientes"}
                                classNamePrefix="custom-select"
                            />
                            {error && <p className="error-msg" style={{ marginTop: '5px' }}>{error.message}</p>}
                          </div>
                        </>
                    )}
                />
            )}
        </div>

          <div className="form-row diag-calendar">
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
          </div>

          <div className="form-row cober-plan">
          {/* Cobertura */}
          <div className="field-wrapper">
              <label>Cobertura:</label>
              <Controller
                  name="Cobertura"
                  control={control}
                  rules={{ required: "Debes seleccionar una cobertura" }}
                  render={({ field, fieldState: { error } }) => (
                      <div className={error ? 'select-container-error' : ''}>
                          <Select
                              {...field}
                              options={coberturaOptions}
                              value={coberturaOptions.find(option => option.value === field.value)}
                              onChange={option => {
                                  setValue("Plan", ""); 
                                  field.onChange(option ? option.value : null);
                              }}
                              placeholder="Buscar y seleccionar cobertura..."
                              isClearable
                              isLoading={!coberturas}
                              noOptionsMessage={() => "No se encontraron coberturas"}
                              classNamePrefix="custom-select"
                          />
                          {error && <p className="error-msg">{error.message}</p>}
                      </div>
                  )}
              />
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
            </div>

          {/* Practicas */}
          <div className="field-wrapper">
            <label>Prácticas:</label>
              <div className="practice-list" style={{ display: 'flex', gap: '1rem' }}>
                {columnas.map((columna, i) => (
                  <div key={i} className="practice-column" style={{ flex: 1 }}>
                    {columna.map((p) => (
                      <div key={p.PracticaID} className="practice-item">
                        <label>
                          <input
                            type="checkbox"
                            checked={practicasSeleccionadas.some(sel => sel.PracticaID === p.PracticaID)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPracticasSeleccionadas([...practicasSeleccionadas, p]);
                              } else {
                                setPracticasSeleccionadas(
                                  practicasSeleccionadas.filter(sel => sel.PracticaID !== p.PracticaID)
                                );
                              }
                            }}
                          />
                          {p.Descripcion}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
          </div>

          {/* Notas */}
            <label>Notas:</label>
            <textarea
              {...register("Notas")} placeholder="Nota de receta..." rows="3" 
            />

            <label>Observaciones al laboratorio:</label>
            <textarea
              {...register("NotasReceta")} placeholder="Nota al laboratorio..." rows="3" 
            />

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button className="enviar" type="submit">
                Registrar Receta
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Volver
              </button>
            </div>
          </form>
        </div>
          <div className="preview-column">
                  <RecetaPreview data={previewData} />
          </div>
      </div>
    </div>
  </div>,
  document.getElementById("modal-root")
);
}
