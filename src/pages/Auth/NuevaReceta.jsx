import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
// cuando tengas el endpoint real, importamos el servicio
// import { crearReceta } from '../../services/authService';

export default function NuevaReceta() {
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

      // Si tuvieras la API real:
      // await crearReceta(data);

      console.log("Receta creada exitosamente (simulado)");
      setSuccess(true);

      // Redirigimos a perfil o donde quieras después de 1.5s
      setTimeout(() => navigate('/perfil'), 1500);

    } catch (err) {
      setError(err.message || 'Error al crear la receta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="main-title">Nueva Receta</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <input type="text" placeholder="Documento" {...register("documento", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Paciente" {...register("paciente", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Diagnóstico" {...register("diagnostico", { required: true })} />
        <br /><br />

        <input type="date" placeholder="Fecha" {...register("fecha", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Cobertura" {...register("cobertura", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Plan" {...register("plan", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Nro Afiliado" {...register("nroAfiliado", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Prácticas" {...register("practicas", { required: true })} />
        <br /><br />

        <h3 className="main-title">Prácticas Seleccionadas</h3>
        <input type="text" placeholder="Prácticas Seleccionadas" {...register("practicasSeleccionadas", { required: true })} />
        <br /><br />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>¡Receta creada exitosamente! Redirigiendo...</p>}

        <button className="enviar" type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
