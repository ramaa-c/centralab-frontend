import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "../../styles/login.css";
import centraLabLogo from '../../assets/images/centraLab_nuevo.png';


console.log("--- Contenido del LocalStorage 1---");

for (const key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    const value = localStorage.getItem(key);
    try {
      console.log(`${key}:`, JSON.parse(value));
    } catch (e) {
      console.log(`${key}:`, value);
    }
  }
}

console.log("---------------------------------");

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const enviar = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data);
    } catch (err) {
      setError(err.message);
      console.error("Falló al ingresar:", err);
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

        {/* 2. Columna de la derecha (Contenido principal del Login) */}
        <div className="card-right-column">
          
          <h1 className="card-title">Recetas Digitales</h1>
          <p className="card-subtitle">
            Inicia sesión con tus datos personales  
          </p>

          <form className="login-form" onSubmit={handleSubmit(enviar)}>
              
            {/* 🚨 ICONO Y INPUT DE EMAIL/DNI */}
            <div className="identifier-container">
                {/* Icono de Persona */}
                <i className="fa-solid fa-user input-icon"></i> 
                <input 
                    type="text" 
                    placeholder="Email o DNI" 
                    {...register("identifier", { required: "Este campo no puede estar vacio." })} 
                />
            </div>
            {/* Se elimina el <br /> */}

            {/* 🚨 ICONO Y INPUT DE CONTRASEÑA */}
            <div className="password-container">
                {/* Icono de Candado */}
                <i className="fa-solid fa-lock input-icon"></i> 
                
                <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Contraseña" 
                    className="password-input" 
                    {...register("password", { required: "Ingrese la contraseña." })}
                />
                <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                </button>
                <a href="/forgot-password" className="forgot-password-link">¿Olvidó su contraseña?</a>
            </div> 
            
            <div className="button-group">
              <button className="ingresar-btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
              <Link to="/registro" className="registro-btn">Registrarse</Link> 
            </div>
            {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}