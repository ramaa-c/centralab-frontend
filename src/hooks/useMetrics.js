// src/hooks/useMetrics.js
import { useApi } from './useApi'; // Asegúrate de que la ruta sea correcta

/**
 * Hook personalizado para obtener las métricas de la barra lateral.
 * @returns {object} Un objeto con data, loading y error.
 */
export const useMetrics = () => {
    // Reutiliza tu hook useApi para /RD/Info
    const { 
        data: metricsData, 
        loading: loadingMetrics, 
        error: errorMetrics 
    } = useApi("/RD/Info"); 
    
    // Procesa los datos para obtener el objeto de métricas
    const metrics = (metricsData && Array.isArray(metricsData) && metricsData.length > 0) 
        ? metricsData[0] 
        : {};
        
    // Normaliza el objeto al formato final que quieres
    const formattedMetrics = [
        { 
            title: "Nuevos Pacientes", 
            value: metrics.NewPacients || 0, 
            icon: "fa-user-plus" 
        },
        { 
            title: "Nuevas Recetas", 
            value: metrics.NewPrescriptions || 0, 
            icon: "fa-file-medical" 
        },
        
    ];

    return { 
        metrics: formattedMetrics, 
        loadingMetrics, 
        errorMetrics 
    };
};