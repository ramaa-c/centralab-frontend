import api from "./apiAuthenticated";

const RECETAS_ENDPOINT = "/api/prescriptions";

export const crearReceta = async (recetaData) => {
  const { data } = await api.post(RECETAS_ENDPOINT, recetaData);
  return data;
};

export const subirPDFReceta = async (recetaId, archivoBase64) => {
    const response = await api.post(`/api/prescription/${recetaId}/pdf`, {
        RecetaID: recetaId,
        ArchivoPDF: archivoBase64,
    });
    
    console.log("✅ [subirPDFReceta] Subida de PDF exitosa para ID:", recetaId);
    return response.data;
};
