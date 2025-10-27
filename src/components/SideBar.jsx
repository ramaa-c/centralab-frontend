import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDoctorEstablishments } from "../hooks/useDoctorEstablishments";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from "../context/AuthContext"; 
import ConfirmModal from "../components/ConfirmModal.jsx";
import centraLabLogo from "../assets/images/centraLab_nuevo.png";
import "../styles/prescripciones.css"; 
import { useMetrics } from "../hooks/useMetrics"; 


export default function SideBar({ children }) {
    
    const location = useLocation();
    const { metrics, loadingMetrics, errorMetrics } = useMetrics();
    const { logout } = useAuth();
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const currentPath = location.pathname;
    const isActive = (path) => {
        return currentPath === path;
    };
    const userJson = localStorage.getItem("user");
    const userProfile = userJson ? JSON.parse(userJson) : {};

    const doctorId = userProfile.id || 0;
    const establecimientoId = userProfile.establecimientoId || 1;
    const { activeEstablishment, loading } = useDoctorEstablishments(doctorId, establecimientoId);
    
    const name = userProfile.name || "NOMBRE DE USUARIO";
    const email = userProfile.email || "email@nodisponible.com";
    const specialty = userProfile.specialty || "Especialidad no definida";
    const [establishmentName, setEstablishmentName] = useState("Cargando establecimiento...");

    useEffect(() => {
    if (!loading) {
        setEstablishmentName(
        activeEstablishment?.Descripcion || "Establecimiento no encontrado"
        );
    }
    }, [activeEstablishment, loading]);

    const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
    };

    const handleConfirmLogout = () => {
    setShowConfirmModal(false);
    logout();
    };

    const handleCancelLogout = () => {
    setShowConfirmModal(false); 
    };

    return (
        <div className="app-layout">
            
            <div className="sidebar">
                
                {/*SECCIÓN DEL LOGO */}
                <div className="sidebar-logo-container">
                    <img src={centraLabLogo} alt="CentraLab Logo" className="card-logo" /> 
                    <span className="logo-text"></span> 
                </div>

                {/* SECCIÓN DE PERFIL DE USUARIO  */}

                <div className="user-profile-info">
                    
                    <div className="user-avatar">
                        <i className="fa-solid fa-user-circle profile-icon"></i> 
                    </div>
                    
                    <div className="name-and-logout">
                        <span className="profile-name">{name.toUpperCase()}</span>
                        
                    </div>
                    
                    <span className="profile-email">{email}</span>
                    <span className="profile-specialty">{specialty}</span>

                    <div className="user-establishment">
                        <i className="fa-solid fa-hospital"></i>
                        <span className="establishment-name">{establishmentName}</span>
                    </div>
                </div>                

                {/* MENÚ DE NAVEGACIÓN */}
                <nav className="sidebar-nav">
                    
                <Link 
                        to="/prescripciones" 
                        className={`nav-link ${isActive('/prescripciones') ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-house-chimney nav-icon"></i> Prescripciones
                    </Link>
                    
                    <Link 
                        to="" 
                        className={`nav-link ${isActive('') ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-flask nav-icon"></i> Resultados
                    </Link>
                    
                    <Link 
                        to="/perfil" 
                        className={`nav-link ${isActive('/perfil') ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-user nav-icon"></i> Datos de Usuario
                    </Link>
                    <hr className="nav-divider-bottom" />

                    {/* 🎯 ÁREA DE CONTADORES DE MÉTRICAS */}
                     
                    <div className="sidebar-metrics-container">
                        {errorMetrics && <p style={{ color: 'red', padding: '10px' }}>Error al cargar métricas.</p>}
                        
                        {metrics.map((metric, index) => (
                            <div 
                                key={index} 
                                className="sidebar-metric-card" 
                            >
                                {/* Icono */}
                                <i className={`fa-solid ${metric.icon} metric-icon`}></i>
                                
                                {/* Detalles: Título y Valor */}
                                <div className="metric-details">
                                    <p className="metric-title">{metric.title}</p>
                                    <p className="metric-value">
                                        {loadingMetrics ? '...' : metric.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* 🎯 FIN DEL ÁREA DE CONTADORES */}
                    
                    {/* Salir */}
                    <a href="#" onClick={handleLogoutClick} className="logout-btn">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>  Cerrar Sesión
                    </a>
                </nav>

            </div>

            <div className="content-area">
                {children}
            </div>
        {showConfirmModal && (
        <ConfirmModal
            isOpen={showConfirmModal}
            onConfirm={handleConfirmLogout}
            onCancel={handleCancelLogout}
            message="¿Estás seguro de que quieres salir?"
        />
        )}
        </div>

    );
}