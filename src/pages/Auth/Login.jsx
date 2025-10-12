import React from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const enviar = (data) => {
    console.log(data);

  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="main-title">Login</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <input
          type="text"
          placeholder="Ingresa tu usuario o email"
          {...register("email", { required: true })}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Ingresa tu contraseña"
          {...register("password", { required: true })}
        />
        <br /><br />

        <button className="enviar" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}