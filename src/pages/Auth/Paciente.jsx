import React from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';

export default function Paciente() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const enviar = (data) => {
    console.log(data);

  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="main-title">Paciente</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        <input
          type="text"
          placeholder="Tipo de documento"
          {...register("Tipodoc", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Documento"
          {...register("Documento", { required: true })}
        />
        <br /><br />

          <input
          type="text"
          placeholder="Ingresa tu Email"
          {...register("Email", { required: true })}
        />
        <br /><br />


        <input
          type="text"
          placeholder="Apellido"
          {...register("Apellido", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Nombre"
          {...register("Nombre", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Sexo"
          {...register("Sexo", { required: true })}
        />
        <br /><br />
       
        <input
          type="text"
          placeholder="Fecha de nacimiento"
          {...register("Fecha", { required: true })}
        />
        <br /><br />


        <button className="enviar" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}