import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { createPortal } from 'react-dom';
import { crearPaciente } from '../../services/authService';
import { useApi } from '../../hooks/useApi';


export default function NuevoPacienteModal({ onClose, onSuccess }) {
  const { register, handleSubmit } = useForm();

  const { data: sexs, isLoading: loadingSexs, error: errorSexs } = useApi('/api/sexs');
  const { data: tiposDoc, isLoading: loadingTipos, error: errorTipos } = useApi('/api/identificationtypes');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        PacienteID: 0,
        DNI: formData.documento,
        Apellido: formData.apellido,
        Nombres: formData.nombre,
        SexoID: Number(formData.sexo),
        fchNacimiento: `${formData.fechaNacimiento}T00:00:00`,
        Email: formData.email,
        TipoDocPacienteID: Number(formData.tipoDoc),
        MomentoAlta: new Date().toISOString().slice(0, 19),
      };

      await crearPaciente(payload);
      onSuccess();
      onClose();

    } catch (err) {
      setError(err.message || 'Error al crear el paciente');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">
    <button onClick={onClose} className="absolute top-2 right-4 text-2xl font-bold">&times;</button>
    <h1 className="main-title">Nuevo Paciente</h1>
      <form className="Formulario" onSubmit={handleSubmit(enviar)}>

        <select {...register("tipoDoc", { required: true })} defaultValue="">
          <option value="" disabled>Seleccione tipo de documento</option>
          {loadingTipos && <option>Cargando...</option>}
          {errorTipos && <option>Error al cargar tipos</option>}
          {tiposDoc.map(tipo => (
            <option key={tipo.TipoDocPacienteID} value={tipo.TipoDocPacienteID}>
              {tipo.Descripcion}
            </option>
          ))}
        </select>
        <br /><br />

        <input type="text" placeholder="Documento" {...register("documento", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Email" {...register("email", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Apellido" {...register("apellido", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Nombre" {...register("nombre", { required: true })} />
        <br /><br />

        <select {...register("sexo", { required: true })} defaultValue="">
          <option value="" disabled>Seleccione sexo</option>
          {loadingSexs && <option>Cargando...</option>}
          {errorSexs && <option>Error al cargar sexos</option>}
          {sexs.map(sexo => (
            <option key={sexo.SexoID} value={sexo.SexoID}>
              {sexo.Descripcion}
            </option>
          ))}
        </select>
        <br /><br />

        <input type="date" placeholder="Fecha de nacimiento" {...register("fechaNacimiento", { required: true })} />
        <br /><br />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button className="enviar" type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear Paciente'}
        </button>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}
