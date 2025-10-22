import api from "./apiAuthenticated";

const RECETAS_ENDPOINT = "/prescriptions";

export const crearReceta = async (recetaData) => {
  try {
    console.log("Enviando receta:", recetaData);
    const response = await api.post(RECETAS_ENDPOINT, recetaData);
    return response.data;
  } catch (error) {
    console.error("Error en crearReceta:", error);
    const msg = error.response?.data?.message || "Error al crear la receta";
    throw new Error(msg);
  }
};

export const subirPDFReceta = async (recetaId, archivoBase64) => {
      console.log("[subirPDFReceta] Iniciando subida del PDF...");
  console.log("ID de receta:", recetaId);
  console.log("Longitud del PDF base64:", archivoBase64.length);
  try {
    const response = await api.post(`${RECETAS_ENDPOINT}/${recetaId}/pdf`, {
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
