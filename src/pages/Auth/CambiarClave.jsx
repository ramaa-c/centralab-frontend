import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';
import { cambiarClave } from '../../services/authService';

export default function CambiarClave() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const doctor = JSON.parse(localStorage.getItem('user'));

  const enviar = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await cambiarClave(doctor.id, data.password);
      setSuccess(true);

      localStorage.setItem('user', JSON.stringify({ ...doctor, must_change_password: false }));

      setTimeout(() => navigate('/perfil'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="main-title">Cambiar Contraseña</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <input
          type="password"
          placeholder="Ingresa tu nueva contraseña"
          {...register("password", { required: true })}
        />
        <br /><br />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>Contraseña cambiada correctamente</p>}

        <button className="enviar" type="submit" disabled={isLoading}>
          {isLoading ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}
