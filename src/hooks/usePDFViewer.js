// En hooks/usePdfViewer.js
import { useQuery } from '@tanstack/react-query';
import api from '../services/apiAuthenticated'; // Asumo que apiAuthenticated es la instancia de Axios
import { toast } from 'react-toastify';

/**
 * Hook para obtener un PDF en Base64 bajo demanda.
 *
 * @param {number} prescriptionId - El ID de la prescripción.
 * @returns {object} Un objeto con data, isLoading, isError y la función fetchPdf.
 */
export const usePdfViewer = (prescriptionId) => {
    // La queryKey debe ser única e incluir el ID de la prescripción
    const queryKey = ['prescriptionPdf', prescriptionId];
    const endpoint = `/api/prescription/${prescriptionId}/pdf`;
    
    // Función fetcher que replica la lógica de Prescripciones.jsx
    const fetcher = async () => {
        if (!prescriptionId) return null;

        try {
            const response = await api.get(endpoint);
            const base64PDF = response.data?.ArchivoPDF;
            
            if (!base64PDF) {
                // Lanzar un error para que sea capturado por onError
                throw new Error("No se encontró el archivo PDF de esta prescripción.");
            }
            
            return base64PDF;

        } catch (error) {
            // Re-lanzar el error para que useQuery lo capture
            throw new Error(error.response?.data?.message || 'Error al obtener el PDF.');
        }
    };

    const query = useQuery({
        queryKey: queryKey,
        queryFn: fetcher,
        // 🚨 CRÍTICO: Desactivamos la consulta automática
        enabled: false,
        // Evitamos que se cachee el error por mucho tiempo
        staleTime: 0, 
        cacheTime: 1000 * 60 * 5, // 5 minutos de cache

        onError: (err) => {
            console.error(`❌ Error al cargar PDF (${prescriptionId}):`, err);
            toast.error(err.message || 'Error al cargar el PDF.');
        },
    });

    // Función para activar manualmente la consulta
    const fetchPdf = () => query.refetch();

    return {
        data: query.data,
        isLoading: query.isFetching, // Usamos isFetching porque isLoading solo es true en la primera carga
        isError: query.isError,
        fetchPdf: fetchPdf
    };
};

/**
 * Función auxiliar para manejar la acción de ver/descargar el PDF.
 * @param {string} base64PDF 
 * @param {string} accion - 'ver' o 'descargar'
 * @param {number} prescriptionId
 */
export const processPdfAction = (base64PDF, accion, prescriptionId) => {
    if (!base64PDF) return;

    // Lógica para convertir Base64 a Blob y crear URL
    const byteArray = Uint8Array.from(atob(base64PDF), (c) => c.charCodeAt(0));
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    if (accion === "ver") {
        window.open(url, "_blank");
    } else if (accion === "descargar") {
        const link = document.createElement("a");
        link.href = url;
        link.download = `prescripcion_${prescriptionId}.pdf`;
        link.click();
    }

    // Limpieza del objeto URL (importante)
    URL.revokeObjectURL(url);
};