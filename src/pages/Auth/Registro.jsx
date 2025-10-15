import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { register as registerUser } from '../../services/authService';
import "../../styles/login.css"; 
import centraLabLogo from '../../assets/images/centraLab_nuevo.png'; 


export default function Registro() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const { data: especialidades = [], error: errorEsp, loading: loadingEsp } = useApi("/api/specialties");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      console.log("Registro exitoso");
      setSuccess(true);

      setTimeout(() => navigate('/Login'), 1500);

    } catch (err) {
      console.error("Error al registrar:", err);
      setError(err.message || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      
      {/* Fondo decorativo (las formas turquesas) */}
      <div className="decorative-background">
        <div className="shape-top"></div>
        <div className="shape-bottom"></div>
      </div>

      {/* Contenedor central, la 'tarjeta' blanca. */}
      <div className="login-card"> 

        {/* 1. Columna de la izquierda (Logo y fondo blanco) */}
        <div className="card-left-column">
          <div className="logo-section">
            <img src={centraLabLogo} alt="CentraLab Logo" className="card-logo" /> 
            <span className="logo-text"></span> 
          </div>
          <div className="decorative-image-placeholder"></div> 
        </div>

        {/* 2. Columna de la derecha (Contenido del Registro) */}
        {/* 🚨 CRÍTICO: Usamos una clase auxiliar 'registration-mode' para ajustes de padding en el CSS */}
        <div className="card-right-column registration-mode">
          
          <h1 className="card-title">Registro de Médico</h1>
          <p className="card-subtitle">
            Completa tus datos para crear una nueva cuenta.
          </p>

          <form className="login-form" onSubmit={handleSubmit(enviar)}>
            
            {/* Input: Email */}
            <div className="identifier-container">
                <i className="fa-solid fa-envelope input-icon"></i> 
                <input type="text" placeholder="Ingresa tu Email" {...register("Email", { required: true })} />
            </div>

            {/* Input: DNI/Pasaporte */}
            <div className="identifier-container">
                <i className="fa-solid fa-id-card input-icon"></i> 
                <input type="text" placeholder="Ingresa tu DNI o Pasaporte" {...register("DNI", { required: true })} />
            </div>
            
            {/* Input: Nombre y Apellido */}
            <div className="identifier-container">
                <i className="fa-solid fa-user input-icon"></i> 
                <input type="text" placeholder="Ingresa tu Nombre y Apellido" {...register("Denominacion", { required: true })} />
            </div>

            {/* Select: Especialidad */}
            {/* 🚨 NOTA: Para estilizar el <select> en CSS de forma coherente, lo envolvemos. */}
            <div className="select-container identifier-container">
                <i className="fa-solid fa-stethoscope input-icon"></i>
                <label className="select-label"></label>
                
                {loadingEsp ? (
                  <select disabled className="select-input">
                    <option>Cargando especialidades...</option>
                  </select>
                ) : errorEsp ? (
                  <p style={{ color: 'red' }}>Error al cargar especialidades</p>
                ) : (
                  <select 
                      {...register("EspecialidadID", { required: true })}
                      className="select-input" 
                      defaultValue="">
                    <option value="" disabled>Selecciona una especialidad</option>
                    {/* ... (Tu lógica de mapeo de especialidades permanece igual) ... */}
                    {especialidades.List ? especialidades.List.map((esp) => (<option key={esp.EspecialidadID} value={esp.EspecialidadID}>{esp.Descripcion}</option>))
                        : especialidades.map((esp) => (<option key={esp.EspecialidadID} value={esp.EspecialidadID}>{esp.Descripcion}</option>))}
                  </select>
                )}
            </div>

            {/* Input: Matrícula */}
            <div className="identifier-container">
                <i className="fa-solid fa-clipboard-user input-icon"></i> 
                <input type="text" placeholder="Ingresa tu Matrícula" {...register("Matricula", { required: true })} />
            </div>

            {/* Input: Firma y Aclaración */}
            <div className="identifier-container">
                <i className="fa-solid fa-signature input-icon"></i> 
                <input type="text" placeholder="Ingresa tu Firma y Aclaración" {...register("FirmaTexto", { required: true })} />
            </div>
            
            {/* Mensajes de estado */}
            {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: '1rem' }}>¡Registro exitoso! Redirigiendo...</p>}

            {/* Botones de acción */}
            <div className="button-group" style={{ marginTop: '1.5rem' }}>
              {/* Usamos las clases de botones que definimos para el login, pero con nombres semánticos para el registro */}
              <button className="ingresar-btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrar Cuenta'}
              </button>
              <Link to="/login" className="registro-btn">Volver al Login</Link> 
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}