import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { createPortal } from 'react-dom';
import { crearPaciente } from '../../services/authService';
import { useApi } from '../../hooks/useApi';

export default function NuevoPacienteModal({ onClose, onSuccess }) {
    const { register, handleSubmit, formState: { errors } } = useForm();
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

        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h1 className="main-title">Nuevo Paciente</h1>
                <form className="Formulario" onSubmit={handleSubmit(enviar)} style={{ textAlign: 'left' }}>                    
                    {/* Tipo de Documento */}
                    <div className="field-wrapper">
                    <label>Tipo de Documento</label>
                    <select
                        {...register("tipoDoc", { required: "Campo obligatorio" })}
                        defaultValue=""
                        className={`select-input ${errors.tipoDoc ? 'input-error' : ''}`}
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
                    {errors.tipoDoc && <p className="error-msg">{errors.tipoDoc.message}</p>}
                    </div>

                    {/* Número de Documento */}
                    <div className="field-wrapper">
                    <label>Número de Documento</label>
                    <input
                        type="text"
                        placeholder="Documento"
                        className={errors.documento ? 'input-error' : ''}
                        {...register("documento", { required: "Campo obligatorio" })}
                    />
                    {errors.documento && <p className="error-msg">{errors.documento.message}</p>}
                    </div>

                    {/* Email */}
                    <div className="field-wrapper">
                    <label>Email</label>
                    <input
                        type="text"
                        placeholder="Email"
                        className={errors.email ? 'input-error' : ''}
                        {...register("email", { required: "Campo obligatorio" })}
                    />
                    {errors.email && <p className="error-msg">{errors.email.message}</p>}
                    </div>

                    {/* Apellido */}
                    <div className="field-wrapper">
                    <label>Apellido</label>
                    <input
                        type="text"
                        placeholder="Apellido"
                        className={errors.apellido ? 'input-error' : ''}
                        {...register("apellido", { required: "Campo obligatorio" })}
                    />
                    {errors.apellido && <p className="error-msg">{errors.apellido.message}</p>}
                    </div>

                    {/* Nombre */}
                    <div className="field-wrapper">
                    <label>Nombre</label>
                    <input
                        type="text"
                        placeholder="Nombre"
                        className={errors.nombre ? 'input-error' : ''}
                        {...register("nombre", { required: "Campo obligatorio" })}
                    />
                    {errors.nombre && <p className="error-msg">{errors.nombre.message}</p>}
                    </div>

                    {/* Sexo */}
                    <div className="field-wrapper">
                    <label>Sexo</label>
                    <select
                        {...register("sexo", { required: "Campo obligatorio" })}
                        defaultValue=""
                        className={`select-input ${errors.sexo ? 'input-error' : ''}`}
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
                    {errors.sexo && <p className="error-msg">{errors.sexo.message}</p>}
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className="field-wrapper">
                    <label>Fecha de Nacimiento</label>
                    <input
                        type="text"
                        placeholder="Seleccionar fecha"
                        readOnly
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        onFocus={(e) => e.target.showPicker && e.target.showPicker()}
                        {...register("fechaNacimiento", { required: "Campo obligatorio" })}
                        className={`select-input ${errors.fechaNacimiento ? 'input-error' : ''}`}
                    />
                    {errors.fechaNacimiento && <p className="error-msg">{errors.fechaNacimiento.message}</p>}
                    </div>

                    {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
                    
                    <div className="modal-footer" style={{ borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'right', marginTop: '30px' }}>
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