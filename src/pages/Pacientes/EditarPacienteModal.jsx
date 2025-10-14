import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { createPortal } from 'react-dom';
import { editarPaciente } from '../../services/patientService';
import { useApi } from '../../hooks/useApi';

export default function EditarPacienteModal({ paciente, onClose, onSuccess }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      tipoDoc: paciente.TipoDocPacienteID,
      documento: paciente.DNI,
      email: paciente.Email,
      apellido: paciente.Apellido,
      nombre: paciente.Nombres,
      sexo: paciente.SexoID,
      fechaNacimiento: paciente.fchNacimiento.split('T')[0],
    }
  });

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-2xl font-bold">&times;</button>
        
        <h1 className="main-title text-xl mb-4">Editar Paciente</h1>
        
        <form className="Formulario" onSubmit={handleSubmit(enviar)}>

          <label className="block mb-1 text-left">Tipo de Documento</label>
          <select 
            {...register("tipoDoc", { required: true })}
            className="w-full border p-2 rounded mb-4"
          >
            {loadingTipos ? <option>Cargando...</option> : tiposDoc.map(tipo => (
              <option key={tipo.TipoDocPacienteID} value={tipo.TipoDocPacienteID}>
                {tipo.Descripcion}
              </option>
            ))}
          </select>

          <label className="block mb-1 text-left">Documento</label>
          <input 
            type="text" 
            placeholder="Documento" 
            {...register("documento", { required: true })}
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block mb-1 text-left">Email</label>
          <input 
            type="email" 
            placeholder="Email" 
            {...register("email", { required: true })}
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block mb-1 text-left">Apellido</label>
          <input 
            type="text" 
            placeholder="Apellido" 
            {...register("apellido", { required: true })}
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block mb-1 text-left">Nombre</label>
          <input 
            type="text" 
            placeholder="Nombre" 
            {...register("nombre", { required: true })}
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block mb-1 text-left">Sexo</label>
          <select 
            {...register("sexo", { required: true })}
            className="w-full border p-2 rounded mb-4"
          >
            {loadingSexs ? <option>Cargando...</option> : sexs.map(sexo => (
              <option key={sexo.SexoID} value={sexo.SexoID}>
                {sexo.Descripcion}
              </option>
            ))}
          </select>

          <label className="block mb-1 text-left">Fecha de Nacimiento</label>
          <input 
            type="date" 
            {...register("fechaNacimiento", { required: true })}
            className="w-full border p-2 rounded mb-4"
          />

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}