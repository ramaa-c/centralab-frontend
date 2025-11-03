import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { createPortal } from 'react-dom';
import { crearPaciente } from '../../services/patientService.js';
import { useApi } from '../../hooks/useApi';
import ConfirmModal from "../../components/ConfirmModal.jsx";

export default function NuevoPacienteModal({ onClose, onSuccess }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { data: sexs, isLoading: loadingSexs, error: errorSexs } = useApi('/sexs');
    const { data: tiposDoc, isLoading: loadingTipos, error: errorTipos } = useApi('/identificationtypes');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    
    useEffect(() => {
        document.body.style.overflow = 'hidden'; 
        document.body.style.paddingRight = '10px'; 
                
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose(); 
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        
        return () => {
            document.body.style.overflow = 'unset'; 
            document.body.style.paddingRight = '0';
            document.removeEventListener('keydown', handleEscape);
       };
    }, [onClose]);

        
    const handleOpenConfirm = (formData) => {
        setShowConfirm(true); 
    };  
       
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
            setShowConfirm(false);

            const response = await crearPaciente(payload);
            console.log("Respuesta de crearPaciente:", response);
            onSuccess();
            onClose();

        } catch (err) {
        // 1. (DEBUG) Registra el error completo en la consola para el desarrollador
        console.error("Error detallado al crear paciente:", err);
        const userFriendlyMessage = 'Ha ocurrido un error inesperado al registrar el paciente. Por favor, verifica los datos e inténtalo de nuevo.';
        setError(userFriendlyMessage); 
        } finally {
        setIsLoading(false);
    }
    };
    const handleMouseDown = (e) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
    };
    
    return createPortal(

        <div className="modal-backdrop" onMouseDown={handleMouseDown}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button 
                     type="button" 
                     onClick={onClose} 
                     style={{ 
                        position: 'absolute', 
                        top: '15px', 
                        right: '15px', 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '1.5rem', 
                        color: '#666', 
                        cursor: 'pointer',
                        zIndex: 100 
                    }}>
                    &times;
                </button>
                <h1 className="main-title">Nuevo Paciente</h1>
                <form className="Formulario" onSubmit={handleSubmit(handleOpenConfirm)} style={{ textAlign: 'left' }}>                    
                    {/* Tipo de Documento */}
                    <div className="field-wrapper">
                    <label>Tipo de Documento</label>
                    <select
                        {...register("tipoDoc", { required: "Campo obligatorio" })}
                        defaultValue=""
                        className={`select-input ${errors.tipoDoc ? 'input-error-paciente' : ''}`}
                    >
                        <option value="" disabled>Seleccione tipo de documento</option>
                        {loadingTipos && <option>Cargando...</option>}
                        {errorTipos && <option>Error al cargar tipos</option>}
                        {tiposDoc?.map(tipo => (
                        <option key={tipo.TipoDocPacienteID} value={tipo.TipoDocPacienteID}>
                            {tipo.Descripcion}
                        </option>
                        ))}
                    </select>
                    {errors.tipoDoc && <p className="error-msg-paciente">{errors.tipoDoc.message}</p>}
                    </div>

                    {/* Número de Documento */}
                    <div className="field-wrapper">
                    <label>Número de Documento</label>
                    <input
                        type="text"
                        placeholder="Documento"
                        className={errors.documento ? 'input-error-paciente' : ''}
                        {...register("documento", { required: "Campo obligatorio" })}
                    />
                    {errors.documento && <p className="error-msg-paciente">{errors.documento.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="field-wrapper">
                    <label>Email</label>
                    <input
                        type="text"
                        placeholder="Email"
                        className={errors.email ? 'input-error-paciente' : ''}
                        {...register("email", { required: "Campo obligatorio" })}
                    />
                    {errors.email && <p className="error-msg-paciente">{errors.email.message}</p>}
                    </div>

                    {/* Apellido */}
                    <div className="field-wrapper">
                    <label>Apellido</label>
                    <input
                        type="text"
                        placeholder="Apellido"
                        className={errors.apellido ? 'input-error-paciente' : ''}
                        {...register("apellido", { required: "Campo obligatorio" })}
                    />
                    {errors.apellido && <p className="error-msg-paciente">{errors.apellido.message}</p>}
                    </div>

                    {/* Nombre */}
                    <div className="field-wrapper">
                    <label>Nombre</label>
                    <input
                        type="text"
                        placeholder="Nombre"
                        className={errors.nombre ? 'input-error-paciente' : ''}
                        {...register("nombre", { required: "Campo obligatorio" })}
                    />
                    {errors.nombre && <p className="error-msg-paciente">{errors.nombre.message}</p>}
                    </div>

                    {/* Sexo */}
                    <div className="field-wrapper">
                    <label>Sexo</label>
                    <select
                        {...register("sexo", { required: "Campo obligatorio" })}
                        defaultValue=""
                        className={`select-input ${errors.sexo ? 'input-error-paciente' : ''}`}
                    >
                        <option value="" disabled>Seleccione sexo</option>
                        {loadingSexs && <option>Cargando...</option>}
                        {errorSexs && <option>Error al cargar sexos</option>}
                        {sexs?.map(sexo => (
                        <option key={sexo.SexoID} value={sexo.SexoID}>
                            {sexo.Descripcion}
                        </option>
                        ))}
                    </select>
                    {errors.sexo && <p className="error-msg-paciente">{errors.sexo.message}</p>}
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className="field-wrapper">
                    <label>Fecha de Nacimiento</label>
                   <input
                        type="date"
                        placeholder="Seleccionar fecha"
                        {...register("fechaNacimiento", { required: "Campo obligatorio" })}
                        className={`select-input ${errors.fechaNacimiento ? 'input-error-paciente' : ''}`}
                    />
                    {errors.fechaNacimiento && <p className="error-msg-paciente">{errors.fechaNacimiento.message}</p>}
                    </div>

                    {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
                    
                    <div className="modal-footer" style={{ borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'right', marginTop: '30px' }}>
                        <button className="enviar" type="submit" disabled={isLoading}>
                            {isLoading ? 'Creando...' : 'Crear Paciente'}
                        </button>
                    </div>
                    </form>
                    {showConfirm && (
                <ConfirmModal 
                    isOpen={showConfirm}
                    message="¿Está seguro de querer crear este nuevo paciente?"
                    onConfirm={handleSubmit(enviar)} 
                    onCancel={() => setShowConfirm(false)}
                />
            )}

                
            </div>
        </div>,
        document.getElementById('modal-root')
    );
}