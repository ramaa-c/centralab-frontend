import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { crearPaciente } from '../../services/authService';

export default function Paciente() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const responseData = await crearPaciente(data);
      console.log("Paciente creado con éxito:", responseData);

      alert("Paciente registrado correctamente ✅");
      navigate('/perfil'); // o la ruta que quieras después del envío

    } catch (err) {
      console.error("Error al enviar el paciente:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="main-title">Paciente</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <input type="text" placeholder="Tipo de documento" {...register("Tipodoc", { required: true })} />
        <br /><br />
        <input type="text" placeholder="Documento" {...register("Documento", { required: true })} />
        <br /><br />
        <input type="text" placeholder="Ingresa tu Email" {...register("Email", { required: true })} />
        <br /><br />
        <input type="text" placeholder="Apellido" {...register("Apellido", { required: true })} />
        <br /><br />
        <input type="text" placeholder="Nombre" {...register("Nombre", { required: true })} />
        <br /><br />
        <input type="text" placeholder="Sexo" {...register("Sexo", { required: true })} />
        <br /><br />
        <input type="text" placeholder="Fecha de nacimiento" {...register("Fecha", { required: true })} />
        <br /><br />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button className="enviar" type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
