import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import centraLabLogo from "../assets/images/centraLab_nuevo.png";
import "../styles/login.css"; 

export default function SideBar({ children }) {
    
    const location = useLocation();
    const currentPath = location.pathname;
    // Función auxiliar para determinar si un enlace está activo
    const isActive = (path) => {
        // Verifica si el path actual comienza con el path del enlace 
        // (útil para rutas anidadas, pero aquí comparamos la ruta exacta)
        return currentPath === path;
    };
    // 🚨 1. OBTENER DATOS DEL LOCALSTORAGE
    // Usamos useEffect o una función para obtener los datos solo una vez, pero la lectura directa es común en layouts.
    const userJson = localStorage.getItem("user");
    const userProfile = userJson ? JSON.parse(userJson) : {};
    
    // 🚨 2. DATOS PARA LA VISTA (Usando valores por defecto si no existen)
    const name = userProfile.name || "NOMBRE DE USUARIO";
    const email = userProfile.email || "email@nodisponible.com";
    const specialty = userProfile.specialty || "Especialidad no definida";
    // El establecimiento no está en el ejemplo de login, así que usamos un valor fijo o lo obtienes de otra parte
    const establishment = userProfile.establishment || "SANATORIO SAN PABLO (SSP)"; 


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
                        <span className="establishment-name">{establishment}</span>
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