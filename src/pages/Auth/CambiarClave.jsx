import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { cambiarClave } from '../../services/authService'; 
import '@fortawesome/fontawesome-free/css/all.min.css';
import "../../styles/login.css"; 
import centraLabLogo from '../../assets/images/cl_logo.jpg';
import { useAuth } from '../../context/AuthContext';


export default function CambiarClave() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm(); 
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const doctor = JSON.parse(localStorage.getItem('user'));

  const enviar = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await cambiarClave({
        doctorId: doctor.id,
        password: data.password,
      });
      const updatedUser = { ...doctor, must_change_password: false };
      localStorage.setItem('user', JSON.stringify({ ...doctor, must_change_password: false }));
      setUser(updatedUser);
      navigate('/prescripciones', { replace: true });
    } catch (err) {
      setError(err.message || "Error al cambiar la contraseña.");
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
      <div className="login-card single-column"> 
        <div className="card-center-content">
            
            {/* Logo y Título */}
            <div className="logo-section" style={{ position: 'relative', top: 'auto', left: 'auto', marginBottom: '10px', padding: '0', border: 'none', boxShadow: 'none', justifyContent: 'center', display: 'flex', alignItems: 'center' }}>
                <img src={centraLabLogo} alt="CentraLab Logo" className="card-logo" style={{ filter: 'none' }}/> 
                <span className="logo-text" style={{ color: '#333' }}></span> 
            </div>
            
            <h1 className="card-title" style={{ textAlign: 'center', color: '#333', fontSize: '2rem', marginBottom: '0.5rem' }}>Cambiar Contraseña</h1>
            <p className="card-subtitle" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1rem' }}>
                Es necesario que establezcas una nueva clave para continuar.
            </p>

            <form className="login-form" onSubmit={handleSubmit(enviar)} style={{ width: '100%', maxWidth: '350px', margin: '0 auto' }}>
                
                {/* Nueva Contraseña */}
                <div className="password-container" style={{ marginBottom: '30px' }}>
                    <i className="fa-solid fa-lock input-icon"></i> 
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingresa tu nueva contraseña"
                      className="password-input"
                      {...register("password", { 
                          required: "La contraseña es requerida.", 
                          minLength: { value: 6, message: "Mínimo 6 caracteres." }
                      })}
                    />
                    <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                    </button>
                    
                    {errors.password && (
                        <p style={{ 
                            color: 'red', 
                            fontSize: '0.85rem', 
                            textAlign: 'left', 
                            position: 'absolute', 
                            bottom: '-20px',
                            left: '0' 
                        }}>
                            {errors.password.message}
                        </p>
                    )}
                </div>
                
                {/* Confirmar Contraseña */}
                <div className="password-container" style={{ marginBottom: '30px' }}>
                    <i className="fa-solid fa-lock input-icon"></i> 
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar contraseña"
                      className="password-input"
                      {...register("confirmPassword", { 
                          required: "Confirma la contraseña.",
                          validate: value => 
                            value === watch('password') || "Las contraseñas no coinciden."
                      })}
                    />
                    <button type="button" className="toggle-password-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                    </button>
                    
                    {errors.confirmPassword && (
                        <p style={{ 
                            color: 'red', 
                            fontSize: '0.85rem', 
                            textAlign: 'left', 
                            position: 'absolute', 
                            bottom: '-20px',
                            left: '0' 
                        }}>
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {/* Botón de envío */}
                <div className="button-group" style={{ justifyContent: 'center' }}>
                    <button className="ingresar-btn" style={{ width: '100%' }} type="submit" disabled={isLoading}>
                      {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
                    </button>
                </div>
                
                <div className="message-placeholder">
                    {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
                    {success && <p style={{ color: 'green', marginTop: '1rem' }}>Contraseña cambiada correctamente</p>}
                </div>
                
            </form>
        </div>
      </div>
    </div>
  );
}