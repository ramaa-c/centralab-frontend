import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
// cuando tengas el endpoint real, importamos el servicio
// import { crearPaciente } from '../../services/authService';

export default function NuevoPaciente() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const enviar = async (data) => {
    console.log("Datos del formulario:", data);

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 📍 BOCETO: simulamos el envío al backend con un delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Si fuera real:
      // await crearPaciente(data);

      console.log("Paciente creado exitosamente (simulado)");
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
        <input type="text" placeholder="Tipo de documento" {...register("tipoDoc", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Documento" {...register("documento", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Email" {...register("email", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Apellido" {...register("apellido", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Nombre" {...register("nombre", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Sexo" {...register("sexo", { required: true })} />
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