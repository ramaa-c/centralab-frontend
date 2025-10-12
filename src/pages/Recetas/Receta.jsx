import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { crearReceta } from '../../services/authService';

export default function Receta() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const responseData = await crearReceta(data); // llamada simulada
      console.log("Receta creada con éxito:", responseData);

      alert("Receta registrada correctamente ✅");
      navigate('/perfil'); // ruta después del envío

    } catch (err) {
      console.error("Error al enviar la receta:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="main-title">Receta</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <input type="text" placeholder="Documento" {...register("Documento", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Paciente" {...register("Paciente", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Diagnóstico" {...register("Diagnostico", { required: true })} />
        <br /><br />

        <input type="date" placeholder="Fecha" {...register("Fecha", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Cobertura" {...register("Cobertura", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Plan" {...register("Plan", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Nro Afiliado" {...register("NroAfiliado", { required: true })} />
        <br /><br />

        <input type="text" placeholder="Prácticas" {...register("Practicas", { required: true })} />
        <br /><br />

        <h3 className="main-title">Prácticas Seleccionadas</h3>
        <input type="text" placeholder="Prácticas Seleccionadas" {...register("PracticasSeleccionadas", { required: true })} />
        <br /><br />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button className="enviar" type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}