import React from 'react';
import '../styles/RecetaPreview.css';

export default function RecetaPreview({ data }) {
  return (
    <div className="preview-container">
      <div className="preview-header">
        <h4>Sanatorio San Pablo</h4>
        <p>Alvear 1444, San Fernando</p>
      </div>
      <hr />
      <div className="preview-patient-info">
        <p><strong>Paciente:</strong> {data.paciente?.NombreCompleto || '...'}</p>
        <p><strong>DNI:</strong> {data.paciente?.DNI || '...'}</p>
        <p><strong>Cobertura:</strong> {`${data.cobertura?.Denominacion || '...'} - ${data.plan?.Denominacion || '...'}`}</p>
      </div>
      <hr />
      <div className="preview-body">
        <p><strong>Fecha:</strong> {data.fecha || new Date().toLocaleDateString('es-AR')}</p>
        <p><strong>Diagnóstico:</strong> {data.diagnostico?.Descripcion || '...'}</p>
        <br />
        <p><strong>Rp:</strong></p>
        {data.practicas?.length > 0 ? (
          <ul>
            {data.practicas.map(p => <li key={p.PracticaID}>{p.Descripcion}</li>)}
          </ul>
        ) : (
          <p>No hay prácticas seleccionadas.</p>
        )}
        <br />
        <p><strong>Notas:</strong></p>
        <p>{data.notas || '...'}</p>
        <p><strong>Observaciones al laboratorio:</strong></p>
        <p>{data.notasReceta || '...'}</p>
      </div>
      <div className="preview-footer">
        <p><strong>Firma:</strong></p>
        {data.firmaImagen && (
          <img
            src={
              data.firmaImagen.startsWith("data:")
                ? data.firmaImagen
                : `data:image/png;base64,${data.firmaImagen}`
            }
            alt="Firma del médico"
            className="firma-img"
          />
        )}
      </div>
    </div>
  );
}