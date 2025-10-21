import React, { createContext, useState, useContext, useEffect } from "react";
import { getDoctorEstablishments } from "../services/doctorService";
// 🚨 Importar la API autenticada (asumo que 'api' es de axios con interceptor)
import api from '../services/apiAuthenticated'; // Ajusta la ruta si es necesario
import { useAuth } from './AuthContext'; // Necesitamos el estado de autenticación/logout

const DataContext = createContext();

// URLs de datos globales
const STATIC_ENDPOINTS = [
    { name: 'diagnostics', url: "/api/diagnostics" },
    { name: 'coberturas', url: "/api/private_healthcares" },
    { name: 'allPractices', url: "/api/tests/all" },
    { name: 'orderedPractices', url: "/api/RD/PrescriptionOrder" },
];

const DYNAMIC_ENDPOINTS = [
    { name: 'patients', url: "/api/patients" },
    // Aquí puedes agregar más listas dinámicas como 'prescriptions' si las usas globalmente
];

// Función auxiliar para normalizar (copiada de useApi.js)
const normalizeToArray = (respData) => {
    if (!respData && respData !== 0) return [];
    if (Array.isArray(respData)) return respData;
    if (Array.isArray(respData.List)) return respData.List;
    if (Array.isArray(respData.list)) return respData.list;
    if (Array.isArray(respData.data)) return respData.data;
    return [respData];
};

export function DataProvider({ children }) {
    // 🚨 Estados para datos globales (reemplazan llamadas useApi)
    const [globalData, setGlobalData] = useState({
        diagnostics: [],
        coberturas: [],
        allPractices: [],
        orderedPractices: [],
        patients: [],
    });
    const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);

    // Estados existentes
    const [doctor, setDoctor] = useState(null);
    const [establecimientos, setEstablecimientos] = useState([]);
    const [establecimientoActivo, setEstablecimientoActivo] = useState(null);
    
    const { isAuthenticated } = useAuth(); // Asumiendo que AuthContext provee esto

    // ----------------------------------------------------
    // 🚨 NUEVAS FUNCIONES DE CARGA Y RECARGA
    // ----------------------------------------------------

    const loadGlobalLists = async (endpoints) => {
        const results = {};
        const promises = endpoints.map(async ({ name, url }) => {
            try {
                const response = await api.get(url);
                results[name] = normalizeToArray(response.data);
            } catch (error) {
                console.error(`Error loading ${name}:`, error);
                results[name] = [];
            }
        });
        await Promise.all(promises);
        return results;
    };

    // Función principal para cargar todos los datos después del login
    const fetchInitialData = async (doctorIdFromLogin, establishmentIdFromLogin) => {
        setIsLoadingGlobal(true);
        try {
            // 1. Cargar datos estáticos y dinámicos en paralelo
            const staticResults = await loadGlobalLists(STATIC_ENDPOINTS);
            const dynamicResults = await loadGlobalLists(DYNAMIC_ENDPOINTS);
            
            setGlobalData({ 
                ...staticResults, 
                ...dynamicResults 
            });

            // 2. Cargar establecimientos (ya lo hacías, solo lo integramos)
            if (doctorIdFromLogin) {
                const ests = await getDoctorEstablishments(doctorIdFromLogin);
                setEstablecimientos(ests);
                setEstablecimientoActivo(establishmentIdFromLogin);
            }
            
            console.log("✅ Datos iniciales y globales cargados con éxito.");

        } catch (error) {
            console.error("❌ Falló la carga inicial de datos globales:", error);
        } finally {
            setIsLoadingGlobal(false);
        }
    };

    // Función para recargar solo listas dinámicas (ej: después de crear un paciente)
    const refetchDynamicLists = async () => {
        const dynamicResults = await loadGlobalLists(DYNAMIC_ENDPOINTS);
        setGlobalData(prev => ({
            ...prev,
            ...dynamicResults
        }));
        console.log("🔄 Listas dinámicas recargadas.");
    };

    // ----------------------------------------------------
    // 🚨 EFECTO DE CUIDADO (para cuando el usuario ya está logueado o refresca)
    // ----------------------------------------------------
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && !doctor) { // Si hay usuario pero el contexto está vacío
            setDoctor(storedUser);
            // Si quieres que los datos se recarguen al refrescar, llama a fetchInitialData aquí:
            // fetchInitialData(storedUser.id, storedUser.establecimientoId);
            
            // Alternativamente, para evitar recargas automáticas al refrescar, mantén solo lo esencial:
            const storedEstId = storedUser.establecimientoId; 
            if (storedEstId) setEstablecimientoActivo(storedEstId);
            getDoctorEstablishments(storedUser.id).then(setEstablecimientos).catch(e => console.error("Error ests:", e));
        }
    }, [doctor]);

    // ----------------------------------------------------

    const value = {
        doctor,
        establecimientos,
        establecimientoActivo,
        actualizarDoctor,
        cambiarEstablecimiento,
        // 🚨 Nuevos datos y funciones
        globalData, 
        isLoadingGlobal,
        fetchInitialData, // Para llamarlo después del login
        refetchDynamicLists, // Para llamar después de una mutación (Crear/Editar)
        
        // Acceso directo a las listas más comunes para comodidad
        diagnosticos: globalData.diagnostics,
        coberturas: globalData.coberturas,
        practicas: globalData.allPractices,
        practicasNormales: globalData.orderedPractices,
        pacientes: globalData.patients,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    return useContext(DataContext);
}