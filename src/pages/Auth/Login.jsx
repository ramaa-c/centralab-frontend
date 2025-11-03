import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "../../styles/login.css";
import centraLabLogo from '../../assets/images/centraLab_nuevo.png';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const enviar = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await login(data);

      const debeCambiarClave = !!user.must_change_password;

      console.log("Valor de must_change_password:", debeCambiarClave);
      
      if (debeCambiarClave) {
        navigate("/cambiarclave", { replace: true });
      } else {
        navigate("/prescripciones", { replace: true });
      }
    } catch (err) {
      console.error("Falló al ingresar (Detalle técnico):", err);
      let userFriendlyMessage = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.";
      if (err.response?.status === 401 || err.response?.status === 403) {
          userFriendlyMessage = "Contraseña o Usuario incorrecto";
      } else if (err.message && err.message.includes("Network Error")) {
          userFriendlyMessage = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.";
      }
      
      setError(userFriendlyMessage); 

    } finally {
      setIsLoading(false);
    }
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
            <span className="logo-text"></span>
          </div>
          <div className="decorative-image-placeholder"></div>
        </div>

        <div className="card-right-column">
          <h1 className="card-title">Recetas Digitales</h1>
          <p className="card-subtitle">Inicia sesión con tus datos personales</p>

          <form className="login-form" onSubmit={handleSubmit(enviar)}>
            {/* Campo: Email o DNI */}
            <div className="field-wrapper">
              <div className="identifier-container">
                <i className="fa-solid fa-user input-icon"></i>
                <input
                  type="text"
                  placeholder="Email o DNI"
                  
                  className={(errors.identifier || error) ? 'input-error' : ''}
                  {...register("identifier", { required: "Este campo no puede estar vacío." })}
                />
              </div>
              {errors.identifier && <p className="error-msg">{errors.identifier.message}</p>}
            </div>

            {/* Campo: Contraseña */}
            <div className="field-wrapper">
              <div className="password-container">
                <i className="fa-solid fa-lock input-icon"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  className={`password-input ${(errors.password || error) ? 'input-error' : ''}`}
                  {...register("password", { required: "Ingrese la contraseña." })}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword
                    ? <i className="fa-solid fa-eye-slash"></i>
                    : <i className="fa-solid fa-eye"></i>}
                </button>
              </div>
              {(errors.password || error) && (
                <p className="error-msg">
                  {errors.password?.message || error}
                </p>
              )}
            </div>
            <Link to="/recuperarclave" className="forgot-password-link">
              ¿Olvidó su contraseña?
            </Link>

            <div className="button-group">
              <button className="ingresar-btn" type="submit" disabled={isLoading}>
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
              <Link to="/registro" className="registro-btn">Registrarse</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}