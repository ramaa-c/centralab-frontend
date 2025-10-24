import { createPortal } from "react-dom";

export default function ConfirmModal({ isOpen, onConfirm, onCancel, message }) {
    if (!isOpen) return null;

    const portalRoot = document.getElementById("modal-root") || document.body;

    return createPortal(
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', padding: '30px', textAlign: 'center' }}>
                
                <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Confirmación</h2>
                
                <p style={{ marginBottom: '30px', color: '#333' }}>{message}</p>
                
                <div className="button-group" style={{ display: 'flex', justifyContent: 'center', gap: '15px', width: '100%' }}>
                    
                    <button
                        onClick={onConfirm} 
                        type="button"
                        className="ingresar-btn" 
                        style={{ width: '50%', padding: '10px 15px' }}
                    >
                        Aceptar
                    </button>
                    
                    <button
                        onClick={onCancel} 
                        type="button"
                        className="registro-btn" 
                        style={{ width: '50%', padding: '10px 15px' }}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>,
        portalRoot 
    );
}
