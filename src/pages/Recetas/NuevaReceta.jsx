import React from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';

export default function NuevaReceta() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const enviar = (data) => {
    console.log(data);

  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 className="main-title">Nueva Receta</h1>

      <form className="Formulario" onSubmit={handleSubmit(enviar)}>
        
        <input
          type="text"
          placeholder="Documento"
          {...register("Documento", { required: true })}
        />
        <br /><br />

          <input
          type="text"
          placeholder="Paciente"
          {...register("Paciente", { required: true })}
        />
        <br /><br />


        <input
          type="text"
          placeholder="Diagnostico"
          {...register("Diagnostico", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Fecha"
          {...register("Fecha", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Cobertura"
          {...register("Cobertura", { required: true })}
        />
        <br /><br />
       
        <input
          type="text"
          placeholder="Plan"
          {...register("Plan", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="NroAfiliado"
          {...register("NroAfiliado", { required: true })}
        />
        <br /><br />

        <input
          type="text"
          placeholder="Practicas"
          {...register("Practicas", { required: true })}
        />
        <br /><br />


        <h3 className="main-title">Practicas Seleccionadas</h3>
        <input
          type="text"
          placeholder="Practicas Seleccionadas"
          {...register("Practicas Seleccionadas", { required: true })}
        />
        <br /><br />

       


        <button className="enviar" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}