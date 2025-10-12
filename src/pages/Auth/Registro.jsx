import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { register as registerUser } from '../../services/authService';

export default function Registro() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await axios.get("/api/specialties");
        setEspecialidades(response.data.List);
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

    const payload = {
      MedicoID: 0,
      Email: data.Email,
      DNI: data.DNI,
      Denominacion: data.Denominacion,
      EspecialidadID: parseInt(data.EspecialidadID, 10),
      Matricula: data.Matricula,
      FirmaTexto: data.FirmaTexto,
      FirmaImagen: "",
      HashSeguridad: "",
      DebeCambiarClave: "0",
      MomentoAlta: new Date().toISOString().slice(0, 19),
    };

    try {

      await registerUser(payload);

      console.log("Registro simulado exitoso");
      setSuccess(true);

      setTimeout(() => navigate('/PerfilUsuario'), 1500);

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
          {...register("DNI", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Ingresa tu Nombre y Apellido"
          {...register("Denominacion", { required: true })}
        />
        <br /><br />

        <label>Especialidad:</label>
        <select {...register("EspecialidadID", { required: true })}>
          <option value="">Selecciona una especialidad</option>
          {especialidades.map((esp) => (
            <option key={esp.EspecialidadID} value={esp.EspecialidadID}>
              {esp.Descripcion}
            </option>
          ))}
        </select>
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
          {...register("FirmaTexto", { required: true })}
        />
        <br /><br />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>¡Registro exitoso! Redirigiendo...</p>}

        <button className="enviar" type="submit" disabled={isLoading}>
          {isLoading ? 'Registrando...' : 'Enviar'}
        </button><br /><br />
        <Link to="/login">¿Ya tiene una cuenta?</Link>
      </form>
    </div>
  );
}
