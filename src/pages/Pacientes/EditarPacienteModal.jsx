import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { createPortal } from 'react-dom';
import { editarPaciente } from '../../services/patientService';
import { useApi } from '../../hooks/useApi';

export default function EditarPacienteModal({ paciente, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      tipoDoc: paciente.TipoDocPacienteID,
      documento: paciente.DNI,
      email: paciente.Email,
      apellido: paciente.Apellido,
      nombre: paciente.Nombres,
      sexo: paciente.SexoID,
      fechaNacimiento: paciente.fchNacimiento
        ? paciente.fchNacimiento.split('T')[0]
        : '',
    }
  });

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

  

  const { data: sexs, isLoading: loadingSexs } = useApi('/api/sexs');
  const { data: tiposDoc, isLoading: loadingTipos } = useApi('/api/identificationtypes');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        PacienteID: paciente.PacienteID,
        DNI: formData.documento,
        Apellido: formData.apellido,
        Nombres: formData.nombre,
        SexoID: Number(formData.sexo),
        fchNacimiento: `${formData.fechaNacimiento}T00:00:00`,
        Email: formData.email,
        TipoDocPacienteID: Number(formData.tipoDoc),
        MomentoAlta: new Date().toISOString().slice(0, 19),
      };

      console.log("Contenido payload:", payload);
      await editarPaciente(payload);

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al actualizar el paciente');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        

        <h1 className="main-title" style={{ textAlign: 'center' }}>Editar Paciente</h1>

        <form className="Formulario" onSubmit={handleSubmit(enviar)}>

          {/* Tipo de Documento */}
          <div className="field-wrapper">
            <label>Tipo de Documento</label>
            <select {...register("tipoDoc", { required: "Campo obligatorio" })}
            className={`select-input ${errors.tipoDoc ? 'input-error' : ''}`}>
              {loadingTipos ? (
                <option>Cargando...</option>
              ) : (
                tiposDoc?.map(tipo => (
                  <option key={tipo.TipoDocPacienteID} value={tipo.TipoDocPacienteID}>
                    {tipo.Descripcion}
                  </option>
                ))
              )}
            </select>
            {errors.tipoDoc && <p className="error-msg">{errors.tipoDoc.message}</p>}
          </div>

          {/* Documento */}
          <div className="field-wrapper">
            <label>Documento</label>
            <input
              type="text"
              placeholder="Documento"
              className={errors.documento ? 'input-error' : ''}
              {...register("documento", { required: "Campo obligatorio" })}
            />
            {errors.documento && <p className="error-msg">{errors.documento.message}</p>}
          </div>

          {/* Email */}
          <div className="field-wrapper">
            <label>Email</label>
            <input
              type="text"
              placeholder="Email"
              className={errors.email ? 'input-error' : ''}
              {...register("email", { required: "El correo es obligatorio" })}
            />
            {errors.email && <p className="error-msg">{errors.email.message}</p>}
          </div>

          {/* Apellido */}
          <div className="field-wrapper">
            <label>Apellido</label>
            <input
              type="text"
              placeholder="Apellido"
              className={errors.apellido ? 'input-error' : ''}
              {...register("apellido", { required: "El apellido es obligatorio" })}
            />
            {errors.apellido && <p className="error-msg">{errors.apellido.message}</p>}
          </div>

          {/* Nombre */}
          <div className="field-wrapper">
            <label>Nombre</label>
            <input
              type="text"
              placeholder="Nombre"
              className={errors.nombre ? 'input-error' : ''}
              {...register("nombre", { required: "El nombre es obligatorio" })}
            />
            {errors.nombre && <p className="error-msg">{errors.nombre.message}</p>}
          </div>

          {/* Sexo */}
          <div className="field-wrapper">
            <label>Sexo</label>
            <select {...register("sexo", { required: "Campo obligatorio" })}
            className={`select-input ${errors.sexo ? 'input-error' : ''}`}>
              {loadingSexs ? (
                <option>Cargando...</option>
              ) : (
                sexs?.map(sexo => (
                  <option key={sexo.SexoID} value={sexo.SexoID}>
                    {sexo.Descripcion}
                  </option>
                ))
              )}
            </select>
            {errors.sexo && <p className="error-msg">{errors.sexo.message}</p>}
          </div>

        {/* Fecha Nacimiento */}
        <div className="field-wrapper">
        <label>Fecha de Nacimiento</label>
        <input
            type="date"
            {...register("fechaNacimiento", { required: "Campo obligatorio" })}
            className={`select-input ${errors.fechaNacimiento ? 'input-error' : ''}`}
        />
        {errors.fechaNacimiento && <p className="error-msg">{errors.fechaNacimiento.message}</p>}
        </div>

          {error && (
            <p className="text-red-600" style={{ color: 'red', marginTop: '15px' }}>
              {error}
            </p>
          )}

          <div
            className="modal-footer"
            style={{
              borderTop: '1px solid #eee',
              paddingTop: '20px',
              textAlign: 'right',
              marginTop: '30px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
           
            <button type="submit" className="enviar" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}