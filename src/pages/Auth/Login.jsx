import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { login } from '../../services/authService';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);


  const enviar = async (data) => {
    setIsLoading(true);
    setError(null);

        try {
            const userData = await login(data);
            console.log("Login exitoso:", userData);

            if (userData.must_change_password) {
                navigate('/CambiarClave'); 
            } else {
                navigate('/prescripciones');
            }

            } catch (err) {
            setError(err.message);
            console.error("Falló al ingresar:", err);
            } finally {
            setIsLoading(false);
            }
  };

    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1 className="main-title">Login</h1>
            
            <form className="formulario-login" onSubmit={handleSubmit(enviar)}>
                <input type="text" placeholder="Ingresa tu email o DNI" {...register("identifier", { required: "Este campo no puede estar vacio." })} />
                <br /><br />

                <div className="password-container">
                    <input type={showPassword ? "text" : "password"} placeholder="Ingresa tu contraseña" className="password-input" {...register("password", { required: "Ingrese la contraseña." })}/>
                    <button type="button" className="toggle-password-btn" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                    </button>
                </div>                
                <br /><br />

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button className="enviar" type="submit" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Entrar'}
                </button>
                <Link to="/registro">¿No tiene una cuenta?</Link>      
            </form>
        </div>
    );
}
