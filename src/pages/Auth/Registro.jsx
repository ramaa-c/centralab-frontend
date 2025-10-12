import React from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';

export default function Registro() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const enviar = (data) => {
    console.log(data);

  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="main-title">Registro</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <input
          type="text"
          placeholder="Ingresa tu Email"
          {...register("Email", { required: true })}
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
          {...register("Nombre", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Ingresa tu Especialidad"
          {...register("Especialidad", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Ingresa tu Matrícula"
          {...register("Matricula", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Ingresa tu Firma y aclaracion"
          {...register("Firma y aclaracion", { required: true })}
        />
        <br /><br />

        <button className="enviar" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}
