import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recuperarClave } from '../../services/authService';

const RecuperarClave = () => {
  const [identificador, setIdentificador] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRecuperarClave = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje(''); // Se limpia al inicio

    if (!identificador.trim()) {
      setError('Por favor, ingrese su email o DNI.');
      return;
    }

    // Mensaje de éxito genérico para EVITAR enumeración de usuarios.
    const successFallbackMessage = 'Si el usuario está registrado, recibirá un correo con instrucciones para restablecer la clave.';

    try {
      setLoading(true);
      await recuperarClave(identificador); // No necesitamos 'response' si el único resultado es el mensaje de éxito genérico.
      
      // Si llega aquí, fue un éxito (o éxito simulado por seguridad)
      setMensaje(successFallbackMessage); 
      
    } catch (err) {
      // 1. Registra el error completo en la consola para el desarrollador.
      console.error("Error detallado al recuperar clave:", err);
      
      // 2. Limpia cualquier mensaje de éxito que pudiera haber quedado (¡CLAVE!)
      setMensaje(''); 
      
      // 3. Define el mensaje genérico y SEGURO para el usuario.
      const userFriendlyError = 'Hubo un problema al procesar su solicitud. Por favor, verifique el Email/DNI e intente nuevamente.';
      
      // 4. Establece el mensaje genérico en el estado 'error'.
      setError(userFriendlyError);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="decorative-background">
        <div className="shape-top"></div>
        <div className="shape-bottom"></div>
      </div>

      <div className="login-card single-column">
        <div className="card-center-content">
          <h2 className="card-title">Recuperar Clave</h2>
          <p className="card-subtitle">
            Ingrese su Email o DNI asociado a su cuenta.
          </p>

          <form onSubmit={handleRecuperarClave} className="login-form">
            <div className="identifier-container">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                id="identificador"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Email o DNI"
                className={`login-form ${error ? 'input-error' : ''}`}
                disabled={loading}
              />
            </div>

            {mensaje && <p className="success-msg">{mensaje}</p>}
            {error && <p className="error-msg">{error}</p>}

            <div className="button-group">
              <button type="submit" className="ingresar-btn" disabled={loading}>
                {loading ? 'Procesando...' : 'Recuperar Clave'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="registro-btn"
                disabled={loading}
              >
                Volver al Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecuperarClave;