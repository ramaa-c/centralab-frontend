import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApiQuery } from "../hooks/useApiQuery"; // 🚨 Nuevo Import
import { useAuth } from '../context/AuthContext'; // 🚨 Nuevo Import
import '@fortawesome/fontawesome-free/css/all.min.css';
import centraLabLogo from "../assets/images/centraLab_nuevo.png";
import "../styles/login.css"; 


export default function SideBar({ children }) {
    
    const location = useLocation();
    const { user } = useAuth(); // Usar el hook de contexto para el usuario
    
    // Extracción de datos de usuario del contexto (más limpio)
    const userProfile = user || {};
    const doctorId = userProfile.id || 0;
    const establecimientoId = userProfile.establecimientoId || 1;
    
    const name = userProfile.name || "NOMBRE DE USUARIO";
    const email = userProfile.email || "email@nodisponible.com";
    const specialty = userProfile.specialty || "Especialidad no definida";

    // 🚨 1. REEMPLAZO DE useEffect POR useApiQuery
    // La clave ['doctorEstablishments', doctorId] está precargada en AuthContext
    const { data: establishmentsData } = useApiQuery(["doctorEstablishments", doctorId]);

    // 🚨 2. Estado local para el nombre
    const [establishmentName, setEstablishmentName] = useState("Cargando establecimiento...");

    // 🚨 3. LÓGICA DE CÁLCULO DEL NOMBRE DEL ESTABLECIMIENTO ACTIVO (useEffect React Query)
    useEffect(() => {
        if (!establishmentsData) {
            setEstablishmentName("Cargando establecimiento...");
            return;
        }

        // Buscar el establecimiento activo basado en el ID de la sesión (userProfile.establecimientoId)
        const activeEstablishment = establishmentsData.find(
            (est) => String(est.EstablecimientoID) === String(establecimientoId)
        );
        
        let nameToShow = "Establecimiento no encontrado";

        if (activeEstablishment) {
            nameToShow = activeEstablishment.Descripcion;
        } else {
            // Lógica de fallback si el ID activo no está en la lista 
            const defaultEstablishment = establishmentsData[0];
            if (defaultEstablishment) {
                 nameToShow = defaultEstablishment.Descripcion;
            }
        }

        setEstablishmentName(nameToShow);

    }, [establishmentsData, establecimientoId]);

    
    const currentPath = location.pathname;
    const isActive = (path) => {
        return currentPath === path;
    };

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
                        <span className="profile-name">{name.toUpperCase()}</span>
                        
                        {/* El botón de salir DEBE llamar a useAuth().logout() si quieres cerrar la sesión */}
                        <Link to="/login" className="logout-compact-icon"> 
                            <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        </Link>
                    </div>
                    
                    <span className="profile-email">{email}</span>
                    <span className="profile-specialty">{specialty}</span>

                    {/* Establecimiento (Usando el estado derivado) */}
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
                    
                    {/* Salir (idealmente con useAuth().logout) */}
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