import api from "./apiAuthenticated";

export const subirPDFReceta = async (recetaId, archivoBase64) => {
      console.log("[subirPDFReceta] Iniciando subida del PDF...");
  console.log("ID de receta:", recetaId);
  console.log("Longitud del PDF base64:", archivoBase64.length);
  try {
    const response = await api.post(`/prescription/${recetaId}/pdf`, {
      RecetaID: recetaId,
      ArchivoPDF: archivoBase64,
    });
        console.log("[subirPDFReceta] Respuesta del servidor:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error al subir el PDF:", error);
    throw error;
  }
};
