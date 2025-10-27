import { useApi } from './useApi';

export const useMetrics = () => {
    const { 
        data: metricsData, 
        loading: loadingMetrics, 
        error: errorMetrics 
    } = useApi("/RD/Info"); 
    
    const metrics = (metricsData && Array.isArray(metricsData) && metricsData.length > 0) 
        ? metricsData[0] 
        : {};
        
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