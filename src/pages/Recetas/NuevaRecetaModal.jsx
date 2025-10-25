import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from 'react-select';
import { createPortal } from "react-dom";
import { useApi } from "../../hooks/useApi";
import { usePatients } from "../../hooks/usePatients";
import { crearReceta, subirPDFReceta } from "../../services/prescriptionService.js";
import RecetaPreview from '../../components/RecetaPreview.jsx';
import { getDoctorById } from "../../services/doctorService";
import { useDoctorEstablishments } from "../../hooks/useDoctorEstablishments";
import { generarPDF } from "../../components/generarPDF";


export default function NuevaRecetaModal({ paciente: pacienteProp, onClose }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const doctorId = user?.id || 0;
  const establecimientoId = user?.establecimientoId || 1;
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm();
  const watchedValues = watch();
  const paciente = pacienteProp; 
  const pacienteRecibido = pacienteProp || null;
  const [doctorData, setDoctorData] = useState(null); // <--- CONTINÚA
  const [practicasSeleccionadas, setPracticasSeleccionadas] = useState([]);
  const [error, setError] = useState(null);
  const coberturaSeleccionada = watch("Cobertura");
  const { data: diagnosticos } = useApi("/diagnostics", true, { cache: true, ttl: 86400000 });
  const { data: coberturas } = useApi("/private_healthcares", true, { cache: true, ttl: 86400000 });
  const { data: practicas } = useApi("/tests/all", true, { cache: true, ttl: 86400000 });
  const { data: practicasNormales } = useApi("/RD/PrescriptionOrder", true, { cache: true, ttl: 86400000 });
  const [establecimientoName, setEstablecimientoName] = useState("Cargando...");
  const [credencialSeleccionada, setCredencialSeleccionada] = useState(null); 
  const { activeEstablishment, loading } = useDoctorEstablishments(doctorId, establecimientoId);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
 
const { 
    patients: pacientes, 
    loading: loadingPacientes, 
    error: errorPacientes,
    setSearchDni 
} = usePatients(doctorId);
  
  useEffect(() => {
    if (!loading) {
      setEstablecimientoName(
        activeEstablishment?.Descripcion || "Establecimiento desconocido"
      );
    }
  }, [activeEstablishment, loading]);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const local = localStorage.getItem(`doctor_${doctorId}`);
        if (local) {
          const parsed = JSON.parse(local);
          setDoctorData(parsed);
          return;
        }

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
    
  const diagnosticoOptions = useMemo(() =>
      diagnosticos?.map(d => ({
          value: d.DiagnosticoID,
          label: d.Descripcion
      })) || [],
      [diagnosticos]
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
      fetchPlanes(`/private_healthcares/${coberturaSeleccionada}/plans`);
    }
  }, [coberturaSeleccionada]);

  useEffect(() => {
    if (pacienteRecibido) {
      setValue("Paciente", pacienteRecibido.PacienteID);
    }
  }, [pacienteRecibido, setValue]);

  useEffect(() => {
    if (paciente) {
      setValue("Paciente", paciente.PacienteID);
    }
  }, [paciente, setValue]);

  const coberturaId = watch("Cobertura");
  const planId = watch("Plan");
  const pacienteId = paciente?.PacienteID || watch("Paciente");

  useEffect(() => {
    if (!coberturaId) {
      setValue("Plan", null);
      setValue("Credencial", "");
      setCredencialSeleccionada(null);
    } else {
      setValue("Plan", null);
      setValue("Credencial", "");
      setCredencialSeleccionada(null);
    }
  }, [coberturaId, setValue]);

  useEffect(() => {
    if (!planId) {
      setValue("Credencial", "");
      setCredencialSeleccionada(null);
    } else {
      setValue("Credencial", "");
      setCredencialSeleccionada(null);
    }
  }, [planId, setValue]);

  useEffect(() => {
    if (pacienteId) {
      fetchCredencial(`/patients/${pacienteId}/credentials`);
    }
  }, [pacienteId]);

  useEffect(() => {

    if (!Array.isArray(credencialData) || !credencialData.length) {
      setCredencialSeleccionada(null);
      return;
    }

    const encontrada = credencialData.find(
      (c) =>
        Number(c.PrepagaID) === coberturaId &&
        Number(c.PrepagaPlanID) === planId
    );

    if (encontrada) {
      console.log("Credencial encontrada:", encontrada);
      setCredencialSeleccionada(encontrada);
    } else {
      setCredencialSeleccionada(null);
    }
  }, [credencialData, coberturaId, planId]);

  useEffect(() => {
    if (credencialSeleccionada?.Credencial) {
      setValue("Credencial", credencialSeleccionada.Credencial);
    }
  }, [credencialSeleccionada, setValue]);

  const handleAgregarPractica = (id) => {
    const listaPracticas = practicas?.List || practicas || [];
    const practica = listaPracticas.find((p) => p.PracticaID === id);

    if (!practica) return;
    if (practicasSeleccionadas.some((p) => p.PracticaID === practica.PracticaID)) return;

    setPracticasSeleccionadas([...practicasSeleccionadas, { ...practica, origen: "manual" }]);
  };

  const handleEliminarPractica = (practicaId) => {
    setPracticasSeleccionadas(prevPracticas =>
        prevPracticas.filter(p => p.PracticaID !== practicaId)
    );
  };

  const enviar = async (data) => {
    try {
      console.log("Enviando receta...");
      console.log("Datos del formulario:", data);

      const payload = {
        Prescription: {
          RecetaID: 0,
          fchReceta: new Date().toISOString().slice(0, 19),
          EstablecimientoID: establecimientoId,
          MedicoID: doctorId,
          PacienteID: parseInt(data.Paciente) || paciente.PacienteID || 0,
          DiagnosticoID: parseInt(data.Diagnostico) || 0,
          Notas: data.Notas || "",
          NotasReceta: data.NotasReceta || "",
          PrepagaPlanID: parseInt(data.Plan),
          Activo: "1",
          MomentoAlta: new Date().toISOString().slice(0, 19),
        },
        Credential: data.Credencial || credencialSeleccionada?.Credencial || null,
        Tests: practicasSeleccionadas.map((p) => ({
          PracticaID: p.PracticaID,
          Comentario: p.Descripcion || "",
        }))
      };
      console.log("Contenido de Credencial:", payload.Credential);
      console.log("Payload final enviado a crearReceta:", payload);

      const response = await crearReceta(payload);
      console.log("Respuesta de crearReceta:", response);

      const recetaId = response?.assigned_id;
      if (!recetaId || recetaId === 0) {
        console.error("No se recibió un ID válido de la receta");
        throw new Error("No se recibió un ID válido de la receta");
      }

      console.log("ID de la receta creada:", recetaId);

      const previewElement = document.querySelector(".preview-column");
      if (!previewElement) {
        console.error("No se encontró el elemento .preview-container para generar PDF");
        throw new Error("No se encontró el elemento del preview para generar PDF");
      }

      console.log("Generando PDF...");
      const pdfBase64 = await generarPDF(previewElement);
      console.log("PDF generado correctamente, tamaño Base64:", pdfBase64.length);

      console.log("Subiendo PDF al backend...");
      const resultadoSubida = await subirPDFReceta(recetaId, pdfBase64);
      console.log("Respuesta del backend al subir PDF:", resultadoSubida);

      console.log("Receta completa registrada y PDF asociado correctamente.");
   
      return true;

    } catch (err) {
      console.error("Error al enviar la receta:", err);
      setError(err.message);
      return false;
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  };

  const previewData = useMemo(() => {
    const selectedPaciente = paciente;
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
      establecimientoName: establecimientoName,
      credencial: credencialSeleccionada?.Credencial || null,      
    };
  }, [
    watchedValues,
    practicasSeleccionadas,
    paciente,
    diagnosticos,
    coberturas,
    planes,
    pacienteRecibido,
    doctorData,
    user,
    credencialSeleccionada
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
  <div className="modal-backdrop" onClick={handleBackdropClick}>
    <div className="modal-content wide">
      <button 
        type="button" 
        onClick={onClose} 
        style={{ 
            position: 'absolute', 
            top: '-10px',
            right: '0px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: '#666',
            cursor: 'pointer',
            zIndex: 100 
        }}
      >
        &times;
      </button>
      <div className="modal-body-split">
        <div className="form-wrapper" style={{ textAlign: "center" }}>
        <h1 className="main-title">Nueva Receta</h1>

        <form className="Formulario" id="recetaForm">

          {/* Paciente */}
          <div className="field-wrapper">
              <label>Paciente:</label>
              {paciente ? (
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
                          {paciente.Apellido} {paciente.Nombres}
                      </strong>
                      <span style={{ color: '#666', fontSize: '0.9em' }}>DNI: {paciente.DNI}</span>
                      <input
                          type="hidden"
                          value={paciente.PacienteID}
                          {...register("Paciente")}
                      />
                  </div>
              ) : (
                  <p style={{ color: 'red' }}>Error: No se ha seleccionado un paciente. Cierre e intente de nuevo.</p>
              )}
          </div>

          <div className="form-row diag-calendar">
          {/* Diagnóstico */}
          <div className="field-wrapper">
            <label>Diagnóstico:</label>
            <Controller
                name="Diagnostico"
                control={control}
                rules={{ required: "Selecciona un diagnóstico" }}
                render={({ field, fieldState: { error } }) => (
                    <div className={error ? 'select-container-error' : ''}>
                      <Select
                          {...field}
                          options={diagnosticoOptions}
                          value={diagnosticoOptions.find(option => option.value === field.value)}
                          onChange={option => field.onChange(option ? option.value : null)}
                          placeholder="Escribe para buscar y seleccionar un diagnóstico..."
                          isClearable
                          isLoading={!diagnosticos} 
                          loadingMessage={() => "Cargando diagnósticos..."}
                          noOptionsMessage={() => "No se encontraron diagnósticos"}
                          classNamePrefix="custom-select"
                      />
                      
                      {error && <p className="error-msg-paciente" style={{ marginTop: '5px' }}>{error.message}</p>}
                    
                    </div>
                )}
            />
          </div>

          {/* Fecha */}
          <div className="field-wrapper"style={{ marginBottom: '25px'}}>
            <label>Fecha:</label>
            <input
              type="date"
              className={`select-input ${errors.Fecha ? "input-error-paciente" : ""}`}
              {...register("Fecha", { required: "Campo obligatorio" })}
            />
            {errors.Fecha && <p className="error-msg-paciente">{errors.Fecha.message}</p>}
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
                              onChange={(option) => {
                                field.onChange(option ? option.value : null);
                                setValue("Plan", null);
                                setValue("Credencial", "");
                                setCredencialSeleccionada(null);
                              }}
                              placeholder="Buscar cobertura..."
                              isClearable
                              isLoading={!coberturas}
                              noOptionsMessage={() => "No se encontraron coberturas"}
                              classNamePrefix="custom-select"
                          />
                          {error && <p className="error-msg-paciente">{error.message}</p>}
                      </div>
                  )}
              />
          </div>

          {/* Plan */}
          <div className="field-wrapper">
            <label>Plan:</label>
            <Controller
              name="Plan"
              control={control}
              rules={{ required: "Selecciona un plan" }}
              render={({ field, fieldState: { error } }) => (
                  <div className={error ? 'select-container-error' : ''}>
                      <Select
                          {...field}
                          options={planes?.map(p => ({ value: p.PrepagaPlanID, label: p.Denominacion })) || []}
                          value={planes?.map(p => ({ value: p.PrepagaPlanID, label: p.Denominacion })).find(option => option.value === field.value) || null}
                          onChange={(option) => {
                            field.onChange(option ? option.value : null);
                            setValue("Credencial", "");
                            setCredencialSeleccionada(null);
                          }}
                          placeholder="Selecciona un plan"
                          isClearable
                          isDisabled={!coberturaSeleccionada || !planes}
                          classNamePrefix="custom-select"
                      />
                      {error && <p className="error-msg-paciente">{error.message}</p>}
                  </div>
              )}
          />
            </div>
            {/* Número de Afiliado / Credencial */}
            <div className="field-wrapper">
              <label>N° de Afiliado:</label>
              <input
                type="text"
                className="select-input"
                {...register("Credencial", {
                  required: "Debes ingresar un número de afiliado o credencial",
                })}
                defaultValue={credencialSeleccionada?.Credencial || ""}
                placeholder="Ej: 123456789"
                onChange={(e) => setCredencialSeleccionada({
                  ...credencialSeleccionada,
                  Credencial: e.target.value
                })}
              />
              {errors.Credencial && (
                <p className="error-msg-paciente">{errors.Credencial.message}</p>
              )}
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
                                setPracticasSeleccionadas([...practicasSeleccionadas, { ...p, origen: "check" }]);
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
          
        {/* Otras prácticas */}
      <div className="field-wrapper">
      <label>Otras prácticas:</label>
      <div className="practice-selector-wrapper" style={{ display: 'flex', gap: '10px' }}>
      <div style={{ flex: 1 }}>
      <Controller
        name="PracticaTemp"
        control={control}
        render={({ field }) => (
                <Select
                  {...field}
                  options={practicas?.map(p => ({ value: p.PracticaID, label: p.Descripcion })) || []}
                  value={practicas?.map(p => ({ value: p.PracticaID, label: p.Descripcion })).find(option => option.value === field.value)}
                  onChange={option => field.onChange(option ? option.value : null)}
                  placeholder="Buscar otra práctica..."
                   
                  isLoading={!practicas}
                  noOptionsMessage={() => "No se encontraron prácticas"}
                  classNamePrefix="custom-select"
                 />
                )}
                />
                </div>
                <button
                type="button"
                onClick={() => {
                  const practicaId = watch("PracticaTemp");
                  if (practicaId) {
                  handleAgregarPractica(practicaId);
                  setValue("PracticaTemp", null);
                }}}>
          <i className="fa-solid fa-plus"></i> Agregar
          </button>
          </div>
          <div className="field-wrapper" style={{ marginTop: '15px' }}>
            <label>Prácticas en Receta:</label>
            <div
              className="selected-practices-list"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '150px',
                overflowY: 'auto',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            >
              {practicasSeleccionadas.filter(p => p.origen === "manual").length === 0 ? (
                <p style={{ color: '#999', margin: 0, fontSize: '0.9em' }}>
                  No se ha seleccionado ninguna práctica.
                </p>
              ) : (
                practicasSeleccionadas
                  .filter(p => p.origen === "manual")
                  .map((p) => (
                    <div
                      key={p.PracticaID}
                      className="selected-practice-item"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '5px 8px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '3px',
                      }}
                    >
                      <span style={{ flex: 1, textAlign: 'left' }}>
                        {p.Descripcion}
                        {p.Columna === undefined && (
                          <span style={{ fontSize: '0.8em', color: '#666' }}></span>
                        )}
                      </span>

                      {/* Botón de Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleEliminarPractica(p.PracticaID)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '1.2em',
                          marginLeft: '10px',
                          padding: '0 5px',
                          lineHeight: '1',
                        }}
                        title={`Quitar práctica: ${p.Descripcion}`}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ))
              )}
            </div>
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

            <div style={{ display: "flex", justifyContent: "center", gap: "10px",marginTop: "20px" }}>
              <button className="enviar" type="button" onClick={() => setShowConfirmModal(true)}>
                
                Registrar Receta
              </button>
              
            </div>
          </form>
        </div>
          <div className="preview-column">
              <RecetaPreview data={previewData} />
          </div>
      </div>
    </div>
    {showConfirmModal && createPortal(
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowConfirmModal(false)}>
          <div className="modal-content small">
            <h3>¿Deseas guardar la receta?</h3>
            <p>Selecciona una opción para continuar:</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              
              {/* Guardar simple */}
             <button
              className="enviar"
              onClick={async () => { // Hacemos la función ASÍNCRONA
                  setShowConfirmModal(false);
                  await handleSubmit(async (data) => {
                      const ok = await enviar(data);
                      if (ok) {
                          onClose(); // 🎯 Cierra el modal principal SOLO si el envío fue exitoso
                      }
                  })();
              }}
          >
              Guardar
          </button>

              {/* Guardar e imprimir */}
              <button
			  className="enviar"
			  style={{ backgroundColor: '#007bff' }}
			  onClick={async () => {
			    setShowConfirmModal(false);
			    
			    const printWindow = window.open("", "_blank"); 
			    if (!printWindow) {
			        alert("El navegador bloqueó la ventana de impresión. Deshabilite el bloqueador de pop-ups y vuelva a intentarlo.");
			        return; 
			    }

			    await handleSubmit(async (data) => {
			        try {
			            const ok = await enviar(data); 
			            if (!ok) {
                            printWindow.close();
			                return; 
			            }

			            const previewElement = document.querySelector(".preview-column");
			            if (!previewElement) {
                            printWindow.close();
			                console.error("No se encontró el preview para imprimir.");
			                alert("Error: No se encontró el preview para imprimir. Receta guardada, pero no impresa.");
			                onClose(); 
			                return;
			            }

			            const pdfBase64 = await generarPDF(previewElement); 
			            const binaryString = atob(pdfBase64);
			            const len = binaryString.length;
			            const bytes = new Uint8Array(len);
			            for (let i = 0; i < len; i++) {
			                bytes[i] = binaryString.charCodeAt(i);
			            }

			            const blob = new Blob([bytes], { type: "application/pdf" });
			            const url = URL.createObjectURL(blob);
			            
			            printWindow.location.href = url;
			            
			            onClose(); 

			        } catch (err) {
			            console.error("Error en la secuencia Guardar e Imprimir:", err);
                        printWindow.close();
			            alert("Hubo un problema inesperado al guardar o generar el PDF. Revise la consola.");
			        }
			    })().catch((validationError) => {
			        console.log("Error de validación del formulario al intentar imprimir.", validationError);
                    printWindow.close();
			    });
			  }}
			>
			  Guardar e Imprimir
			</button>
              
              {/* Cancelar */}
              <button
                className="cancelar"
                onClick={() => setShowConfirmModal(false)}
                style={{ backgroundColor: '#ccc', color: '#333' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>,
        document.getElementById("modal-root")
      )}

    </div>,
    document.getElementById("modal-root")
  );
}
