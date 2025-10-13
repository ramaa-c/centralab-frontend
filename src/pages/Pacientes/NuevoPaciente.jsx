import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { crearPaciente } from '../../services/authService';
import { useApi } from '../../hooks/useApi';

export default function NuevoPaciente() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const { data: sexs, isLoading: loadingSexs, error: errorSexs } = useApi('/api/sexs');
  const { data: tiposDoc, isLoading: loadingTipos, error: errorTipos } = useApi('/api/identificationtypes');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const enviar = async (formData) => {
    console.log("Datos del formulario:", formData);

    setIsLoading(true);
    setError(null);
    setSuccess(false);

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
        MomentoAlta: new Date().toISOString(),
      };

      console.log("Payload final a enviar:", payload);

      const response = await crearPaciente(payload);
      console.log("Respuesta del backend:", response);

      setSuccess(true);
      setTimeout(() => navigate('/perfil'), 1500);

    } catch (err) {
      setError(err.message || 'Error al crear el paciente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
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
        {success && <p style={{ color: 'green' }}>¡Paciente creado exitosamente! Redirigiendo...</p>}

        <button className="enviar" type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
