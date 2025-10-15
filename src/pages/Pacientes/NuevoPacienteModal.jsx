import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { createPortal } from 'react-dom';
import { crearPaciente } from '../../services/authService';
import { useApi } from '../../hooks/useApi';

export default function NuevoPacienteModal({ onClose, onSuccess }) {
    const { register, handleSubmit } = useForm();

    const { data: sexs, isLoading: loadingSexs, error: errorSexs } = useApi('/api/sexs');
    const { data: tiposDoc, isLoading: loadingTipos, error: errorTipos } = useApi('/api/identificationtypes');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const enviar = async (formData) => {
        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                PacienteID: 0,
                DNI: formData.documento,
                Apellido: formData.apellido,
                Nombres: formData.nombre,
                SexoID: Number(formData.sexo),
                fchNacimiento: `${formData.fechaNacimiento}T00:00:00`,
                Email: formData.email,
                TipoDocPacienteID: Number(formData.tipoDoc),
                MomentoAlta: new Date().toISOString().slice(0, 19),
            };

            await crearPaciente(payload);
            onSuccess();
            onClose();

        } catch (err) {
            setError(err.message || 'Error al crear el paciente');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        // 1. Contenedor principal del modal/fondo oscuro (modal-backdrop)
        // 💡 onClick={onClose} en el backdrop permite cerrar al hacer clic fuera del formulario
        <div className="modal-backdrop" onClick={onClose}>
            {/* 2. Contenedor del contenido del modal (modal-content) */}
            {/* 💡 e.stopPropagation() previene que el clic en el contenido cierre el modal */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                {/* Botón de Cerrar: Usamos la clase close-button y estilo absoluto */}
                <button 
                    onClick={onClose} 
                    className="close-button" 
                    style={{ position: 'absolute', top: '15px', right: '25px', fontSize: '1.5rem', fontWeight: 'bold' }}
                >&times;</button>
                
                <h1 className="main-title">Nuevo Paciente</h1>
                
                <form className="Formulario" onSubmit={handleSubmit(enviar)} style={{ textAlign: 'left' }}>

                    {/* Nota: Hemos quitado los <br /><br /> y confiamos en el margin-bottom del CSS para el espaciado */}
                    
                    <label>Tipo de Documento:</label>
                    <select {...register("tipoDoc", { required: true })} defaultValue="">
                        <option value="" disabled>Seleccione tipo de documento</option>
                        {loadingTipos && <option>Cargando...</option>}
                        {errorTipos && <option>Error al cargar tipos</option>}
                        {tiposDoc?.map(tipo => (
                            <option key={tipo.TipoDocPacienteID} value={tipo.TipoDocPacienteID}>
                                {tipo.Descripcion}
                            </option>
                        ))}
                    </select>

                    <label>Número de Documento:</label>
                    <input type="text" placeholder="Documento" {...register("documento", { required: true })} />

                    <label>Email:</label>
                    <input type="text" placeholder="Email" {...register("email", { required: true })} />

                    <label>Apellido:</label>
                    <input type="text" placeholder="Apellido" {...register("apellido", { required: true })} />

                    <label>Nombre:</label>
                    <input type="text" placeholder="Nombre" {...register("nombre", { required: true })} />

                    <label>Sexo:</label>
                    <select {...register("sexo", { required: true })} defaultValue="">
                        <option value="" disabled>Seleccione sexo</option>
                        {loadingSexs && <option>Cargando...</option>}
                        {errorSexs && <option>Error al cargar sexos</option>}
                        {sexs?.map(sexo => (
                            <option key={sexo.SexoID} value={sexo.SexoID}>
                                {sexo.Descripcion}
                            </option>
                        ))}
                    </select>

                    <label>Fecha de Nacimiento:</label>
                    <input type="date" placeholder="Fecha de nacimiento" {...register("fechaNacimiento", { required: true })} />

                    {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
                    
                    <div className="modal-footer" style={{ borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'right', marginTop: '30px' }}>
                        <button 
                          type="button" 
                          className="btn-secondary-vol" 
                          onClick={onClose} 
                          disabled={isLoading}
                          style={{ marginRight: '10px' }}
                        >
                            Cancelar
                        </button>
                        <button className="enviar" type="submit" disabled={isLoading}>
                            {isLoading ? 'Creando...' : 'Crear Paciente'}
                        </button>
                    </div>

                </form>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
}