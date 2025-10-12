import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  const enviar = async (data) => {
    setIsLoading(true);
    setError(null);

        try {
            const userData = await login(data.email, data.password);
            console.log("Login exitoso:", userData);
            
            localStorage.setItem('token', userData.token);
            localStorage.setItem('user', JSON.stringify({
                id: userData.doctor_id,
                name: userData.doctor_name,
                email: userData.doctor_email,
                specialty: userData.doctor_specialty 
            }));


            if (userData.must_change_password) {
                navigate('/cambiar-password'); 
            } else {
                navigate('/registro');
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
      
      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <input type="text" placeholder="Ingresa tu usuario o email"{...register("email", { required: "Este campo no puede estar vacio." })}/>
        <br /><br />

        <input type="password" placeholder="Ingresa tu contraseña"{...register("password", { required: "Ingrese la contraseña." })}/>
        <br /><br />

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button className="enviar" type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
