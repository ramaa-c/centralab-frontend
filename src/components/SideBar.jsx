import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getDoctorEstablishments } from "../services/doctorService";
import '@fortawesome/fontawesome-free/css/all.min.css';
import centraLabLogo from "../assets/images/centraLab_nuevo.png";
import "../styles/login.css"; 

export default function SideBar({ children }) {
    
    const location = useLocation();
    const currentPath = location.pathname;
    const isActive = (path) => {
        return currentPath === path;
    };
    const userJson = localStorage.getItem("user");
    const userProfile = userJson ? JSON.parse(userJson) : {};

    const doctorId = userProfile.id || 0;
    const establecimientoId = userProfile.establecimientoId || 1;
    
    const name = userProfile.name || "NOMBRE DE USUARIO";
    const email = userProfile.email || "email@nodisponible.com";
    const specialty = userProfile.specialty || "Especialidad no definida";
    const [establishmentName, setEstablishmentName] = useState("Cargando establecimiento...");

    useEffect(() => {
        const fetchEstablishment = async () => {
            if (!doctorId) return;

            try {
                const establishments = await getDoctorEstablishments(doctorId);
                
                const activeEstablishment = establishments.find(
                    (est) => est.Activo === "1"
                );
                
                let nameToShow = "Establecimiento no encontrado";

                if (activeEstablishment) {
                    nameToShow = activeEstablishment.Descripcion;
                } else {
                    const userEstablishment = establishments.find(
                        (est) => est.EstablecimientoID === establecimientoId
                    );
                    if (userEstablishment) {
                        nameToShow = userEstablishment.Descripcion;
                    }
                }

                setEstablishmentName(nameToShow);

            } catch (error) {
                console.error("Error al obtener establecimientos del doctor:", error);
                setEstablishmentName("Error de carga");
            }
        };
        
        fetchEstablishment();
    }, [doctorId, establecimientoId]);

    return (
        <div className="app-layout">
            
            <div className="sidebar">
                
                {/* 1. SECCIÓN DEL LOGO */}
                <div className="sidebar-logo-container">
                    <img src={centraLabLogo} alt="CentraLab Logo" className="card-logo" /> 
                    <span className="logo-text"></span> 
                </div>

                {/* ================================== */}
                {/* 🚨 2. SECCIÓN DE PERFIL DE USUARIO 🚨 */}
                {/* ================================== */}
                <div className="user-profile-info">
                    
                    {/* Icono de Avatar */}
                    <div className="user-avatar">
                        <i className="fa-solid fa-user-circle profile-icon"></i> 
                    </div>
                    
                    {/* Nombre y Botón de Salir (a la derecha) */}
                    <div className="name-and-logout">
                        {/* 🚨 USAR DATO REAL */}
                        <span className="profile-name">{name.toUpperCase()}</span>
                        
                        <Link to="/login" className="logout-compact-icon">
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        </Link>
                    </div>
                    
                    {/* 🚨 USAR DATOS REALES */}
                    <span className="profile-email">{email}</span>
                    <span className="profile-specialty">{specialty}</span>

                    {/* Establecimiento */}
                    <div className="user-establishment">
                        <i className="fa-solid fa-hospital"></i>
                        <span className="establishment-name">{establishmentName}</span>
                    </div>
                </div>

                {/* --- SEPARADOR --- */}
                <hr className="sidebar-divider" /> 

                {/* ================================== */}
                {/* 3. MENÚ DE NAVEGACIÓN */}
                {/* ================================== */}
                <nav className="sidebar-nav">
                    
                <Link 
                        to="/prescripciones" 
                        className={`nav-link ${isActive('/prescripciones') ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-house-chimney nav-icon"></i> Prescripciones
                    </Link>
                    
                    {/* Resultados */}
                    <Link 
                        to="/resultados" 
                        className={`nav-link ${isActive('/resultados') ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-flask nav-icon"></i> Resultados
                    </Link>
                    
                    {/* Datos de Usuario */}
                    <Link 
                        to="/perfil" 
                        className={`nav-link ${isActive('/perfil') ? 'active' : ''}`}
                    >
                        <i className="fa-solid fa-user nav-icon"></i> Datos de Usuario
                    </Link>
                    
                    {/* Salir (no necesita clase activa) */}
                    <Link to="/login" className="nav-link logout-btn">
                        <i className="fa-solid fa-arrow-right-from-bracket nav-icon"></i> Salir
                    </Link>
                </nav>

            </div>

            {/* CONTENIDO PRINCIPAL */}
            <div className="content-area">
                {children}
            </div>

        </div>
    );
}