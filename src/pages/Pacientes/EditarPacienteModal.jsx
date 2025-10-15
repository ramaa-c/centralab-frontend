import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { createPortal } from 'react-dom';
import { editarPaciente } from '../../services/patientService';
import { useApi } from '../../hooks/useApi';

export default function EditarPacienteModal({ paciente, onClose, onSuccess }) {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            tipoDoc: paciente.TipoDocPacienteID,
            documento: paciente.DNI,
            email: paciente.Email,
            apellido: paciente.Apellido,
            nombre: paciente.Nombres,
            sexo: paciente.SexoID,
            // Aseguramos que la fecha esté en formato YYYY-MM-DD
            fechaNacimiento: paciente.fchNacimiento.split('T')[0],
        }
    });

    const { data: sexs, isLoading: loadingSexs } = useApi('/api/sexs');
    const { data: tiposDoc, isLoading: loadingTipos } = useApi('/api/identificationtypes');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const enviar = async (formData) => {
        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                PacienteID: paciente.PacienteID,
                DNI: formData.documento,
                Apellido: formData.apellido,
                Nombres: formData.nombre,
                SexoID: Number(formData.sexo),
                fchNacimiento: `${formData.fechaNacimiento}T00:00:00`,
                Email: formData.email,
                TipoDocPacienteID: Number(formData.tipoDoc),
                MomentoAlta: new Date().toISOString().slice(0, 19),
            };

            await editarPaciente(payload);
            
            onSuccess();
            onClose();

        } catch (err) {
            setError(err.message || 'Error al actualizar el paciente');
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        // 1. Contenedor principal del modal/fondo oscuro (modal-backdrop)
        <div className="modal-backdrop" onClick={onClose}>
            {/* 2. Contenedor del contenido del modal (modal-content) */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                {/* Botón de Cerrar: Posicionamiento absoluto y estilo de cierre */}
                <button 
                    onClick={onClose} 
                    className="close-button" 
                    style={{ position: 'absolute', top: '15px', right: '25px', fontSize: '1.5rem', fontWeight: 'bold' }}
                >&times;</button>
                
                {/* 🚨 Título: Usamos la clase main-title para el estilo turquesa */}
                <h1 className="main-title" style={{ textAlign: 'center' }}>Editar Paciente</h1>
                
                <form className="Formulario" onSubmit={handleSubmit(enviar)}>

                    {/* Nota: Las clases de Tailwind como 'block mb-1 text-left' se reemplazan por la definición en .Formulario label en el CSS */}
                    
                    <label>Tipo de Documento</label>
                    <select {...register("tipoDoc", { required: true })}>
                        {loadingTipos ? <option>Cargando...</option> : tiposDoc?.map(tipo => (
                            <option key={tipo.TipoDocPacienteID} value={tipo.TipoDocPacienteID}>
                                {tipo.Descripcion}
                            </option>
                        ))}
                    </select>

                    <label>Documento</label>
                    <input 
                        type="text" 
                        placeholder="Documento" 
                        {...register("documento", { required: true })}
                    />

                    <label>Email</label>
                    <input 
                        type="text" 
                        placeholder="Email" 
                        {...register("email", { required: true })}
                    />

                    <label>Apellido</label>
                    <input 
                        type="text" 
                        placeholder="Apellido" 
                        {...register("apellido", { required: true })}
                    />

                    <label>Nombre</label>
                    <input 
                        type="text" 
                        placeholder="Nombre" 
                        {...register("nombre", { required: true })}
                    />

                    <label>Sexo</label>
                    <select {...register("sexo", { required: true })}>
                        {loadingSexs ? <option>Cargando...</option> : sexs?.map(sexo => (
                            <option key={sexo.SexoID} value={sexo.SexoID}>
                                {sexo.Descripcion}
                            </option>
                        ))}
                    </select>

                    <label>Fecha de Nacimiento</label>
                    <input 
                        type="date" 
                        {...register("fechaNacimiento", { required: true })}
                    />

                    {error && <p className="text-red-600" style={{ color: 'red', marginTop: '15px' }}>{error}</p>}

                    {/* 🚨 Botones: Usamos las clases personalizadas para el estilo turquesa y gris */}
                    <div className="modal-footer" style={{ borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'right', marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary-vol" // Clase gris/secundaria
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="enviar" // Clase turquesa/principal
                            disabled={isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
}