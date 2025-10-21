import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate, Link } from 'react-router-dom';
import { useApiQuery } from "../../hooks/useApiQuery";
import { useRegistroDoctor } from "../../hooks/useRegistroDoctor";
import { register as registerUser } from '../../services/authService';
import "../../styles/registro.css"; 
import centraLabLogo from '../../assets/images/centraLab_nuevo.png'; 

export default function Registro() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();
  const navigate = useNavigate();

const { 
    data: especialidades = [], 
    isLoading: loadingEsp, 
    error: errorEsp 
} = useApiQuery("/specialties"); // Nota: Usamos el endpoint '/specialties' de AuthContext

  // 2. MUTATION: Hook para registrar al doctor
 const { 
    mutate: registrarMutate, 
    isPending: isLoading, // isPending es nuestro nuevo isLoading
    isSuccess, // Estado de éxito de la mutación
    error: registroError, // Objeto de error de la mutación
    isError
 } = useRegistroDoctor({
    onSuccess: () => {
      console.log("Registro exitoso");
      // El toast de éxito se maneja en useRegistroDoctor
      setTimeout(() => navigate('/login'), 1500);
    }
 });

  const listaEspecialidades = especialidades.List || especialidades;

  const enviar = async (data) => {
    const payload = {
      MedicoID: 0,
      Email: data.Email.trim(),
      DNI: data.DNI.trim(),
      Denominacion: data.Denominacion.trim(),
      EspecialidadID: parseInt(data.EspecialidadID, 10),
      Matricula: data.Matricula.trim(),
      FirmaTexto: data.FirmaTexto.trim(),
      FirmaImagen: "",
      HashSeguridad: "",
      DebeCambiarClave: "0",
      MomentoAlta: new Date().toISOString().slice(0, 19),
    };

    registrarMutate(payload);

  };

  return (
    <div className="login-page">
      <div className="decorative-background">
        <div className="shape-top"></div>
        <div className="shape-bottom"></div>
      </div>

      <div className="login-card">
        <div className="card-left-column">
          <div className="logo-section">
            <img src={centraLabLogo} alt="CentraLab Logo" className="card-logo" />
            <span className="logo-text"></span> {/* Aseguramos el texto del logo */}
          </div>
          <div className="decorative-image-placeholder"></div>
        </div>

        <div className="card-right-column registration-mode">
          <h1 className="card-title">Registro de Médico</h1>
          <p className="card-subtitle">
            Completa tus datos para crear una nueva cuenta.
          </p>

          <form className="login-form" onSubmit={handleSubmit(enviar)} noValidate>

            {/* Email */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-envelope input-icon"></i>
                <input
                  type="email"
                  placeholder="Ingresa tu Email"
                  className={`reg-input ${errors.Email ? 'input-error' : ''}`}
                  {...register("Email", {
                    // 🚨 MENSAJE DE ERROR
                    required: "Este campo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Formato de email inválido"
                    }
                  })}
                />
              </div>
              {/* 🚨 RENDERIZADO DEL ERROR */}
              {errors.Email && <p className="error-msg">{errors.Email.message}</p>}
            </div>

            {/* DNI */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-id-card input-icon"></i>
                <input
                  type="text"
                  placeholder="Ingresa tu DNI o Pasaporte"
                  className={`reg-input ${errors.DNI ? 'input-error' : ''}`}
                  {...register("DNI", {
                    // 🚨 MENSAJE DE ERROR
                    required: "Este campo es obligatorio",
                    pattern: {
                      value: /^[0-9]{7,9}$/,
                      message: "El DNI debe tener entre 7 y 9 números"
                    }
                  })}
                />
              </div>
              {/* 🚨 RENDERIZADO DEL ERROR */}
              {errors.DNI && <p className="error-msg">{errors.DNI.message}</p>}
            </div>

            {/* Nombre y apellido */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-user input-icon"></i>
                <input
                  type="text"
                  placeholder="Ingresa tu Nombre y Apellido"
                  className={`reg-input ${errors.Denominacion ? 'input-error' : ''}`}
                  {...register("Denominacion", {
                    // 🚨 MENSAJE DE ERROR
                    required: "Este campo es obligatorio",
                    pattern: {
                      value: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s']+$/,
                      message: "El nombre solo puede contener letras y espacios"
                    }
                  })}
                />
              </div>
              {/* 🚨 RENDERIZADO DEL ERROR */}
              {errors.Denominacion && <p className="error-msg">{errors.Denominacion.message}</p>}
            </div>

            {/* Especialidad */}
            <div className="field-wrapper">
              <div className="select-container identifier-container">
                <i className="fa-solid fa-stethoscope input-icon"></i>
                {loadingEsp ? (
                  <select disabled className="reg-input">
                    <option>Cargando especialidades...</option>
                  </select>
                ) : errorEsp ? (
                  <p style={{ color: 'red' }}>Error al cargar especialidades</p>
                ) : (
                  <select
                    {...register("EspecialidadID", { required: "Este campo es obligatorio" })}
                    className={`reg-input ${errors.EspecialidadID ? 'input-error' : ''}`}
                    defaultValue=""
                  >
                    <option value="" disabled>Selecciona una especialidad</option>
                    {listaEspecialidades.map((esp) => (
                      <option key={esp.EspecialidadID} value={esp.EspecialidadID}>
                        {esp.Descripcion}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {/* 🚨 RENDERIZADO DEL ERROR */}
              {errors.EspecialidadID && <p className="error-msg">{errors.EspecialidadID.message}</p>}
            </div>

            {/* Matrícula */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-clipboard-user input-icon"></i>
                <input
                  type="text"
                  placeholder="Ingresa tu Matrícula"
                  className={`reg-input ${errors.Matricula ? 'input-error' : ''}`}
                  {...register("Matricula", {
                    // 🚨 MENSAJE DE ERROR
                    required: "Este campo es obligatorio",
                    minLength: { value: 4, message: "Debe tener al menos 4 caracteres" }
                  })}
                />
              </div>
              {/* 🚨 RENDERIZADO DEL ERROR */}
              {errors.Matricula && <p className="error-msg">{errors.Matricula.message}</p>}
            </div>

            {/* Firma */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-signature input-icon"></i>
                <input
                  type="text"
                  placeholder="Ingresa tu Firma y Aclaración"
                  className={`reg-input ${errors.FirmaTexto ? 'input-error' : ''}`}
                  {...register("FirmaTexto", {
                    // 🚨 MENSAJE DE ERROR
                    required: "Este campo es obligatorio",
                    minLength: { value: 3, message: "Debe tener al menos 3 caracteres" }
                  })}
                />
              </div>
              {/* 🚨 RENDERIZADO DEL ERROR */}
              {errors.FirmaTexto && <p className="error-msg">{errors.FirmaTexto.message}</p>}
            </div>

            {isSuccess && <p style={{ color: 'green', marginTop: '1rem' }}>¡Registro exitoso! Redirigiendo...</p>}
            {isError && (
                <p style={{ color: 'red', marginTop: '1rem' }}>
                    {registroError?.message || 'Error desconocido al registrar.'}
                </p>
            )}
            
            <div className="button-group" style={{ marginTop: '1.5rem' }}>
              <button className="ingresar-btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Registrando...' : 'Registrar Cuenta'}
              </button>
              <Link to="/login" className="registro-btn">Volver al Login</Link>
            </div>
          </form>
        </div>
        <div className="decorative-image-placeholder"></div>
      </div>
    </div>
  );
}