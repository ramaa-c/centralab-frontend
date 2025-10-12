import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// cuando tengas el endpoint real, importamos el servicio
// import { register as registerUser } from '../../services/authService';

export default function Registro() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);

  // Traemos las especialidades desde el endpoint real
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await axios.get("/api/specialties");
        setEspecialidades(response.data); // asumimos que response.data es un array de strings
      } catch (err) {
        console.error("Error al cargar especialidades:", err);
      }
    };

    fetchEspecialidades();
  }, []);

  const enviar = async (data) => {
    console.log("Datos del formulario:", data);

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // BOCETO: simulamos el envío al backend con un delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Si fuera real, sería:
      // await registerUser(data);

      console.log("Registro simulado exitoso");
      setSuccess(true);

      // Redirigimos al perfil después de 1.5 segundos
      setTimeout(() => navigate('/perfil'), 1500);

    } catch (err) {
      setError(err.message || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="main-title">Registro</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <input
          type="text"
          placeholder="Ingresa tu Email"
          {...register("email", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Ingresa tu DNI o Pasaporte"
          {...register("dni", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Ingresa tu Nombre y Apellido"
          {...register("nombreCompleto", { required: true })}
        />
        <br /><br />

        <label>Especialidad:</label>
        <select {...register("especialidad", { required: true })}>
          <option value="">Selecciona una especialidad</option>
          {especialidades.map((esp, i) => (
            <option key={i} value={esp}>{esp}</option>
          ))}
        </select>
        <br /><br />

        <input
          type="text"
          placeholder="Ingresa tu Matrícula"
          {...register("matricula", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Ingresa tu Firma y Aclaración"
          {...register("firmaAclaracion", { required: true })}
        />
        <br /><br />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>¡Registro exitoso! Redirigiendo...</p>}

        <button className="enviar" type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

