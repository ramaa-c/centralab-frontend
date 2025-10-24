import api from "./apiAuthenticated";

const RECETAS_ENDPOINT = "/prescriptions";

export const obtenerRecetas = async ({
  page = 1,
  page_size = 15,
  doctor_id = null,
  patient_id = null,
  retries = 3,
  delay = 1000,
} = {}) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const params = {
        page,
        page_size,
        ...(doctor_id && { doctor_id }),
        ...(patient_id && { patient_id }),
      };

      console.log(
        `🧾 Obteniendo recetas (página ${page}${
          doctor_id ? `, doctor ${doctor_id}` : ""
        }${patient_id ? `, paciente ${patient_id}` : ""}) (intento ${attempt})...`
      );

      const response = await api.get(RECETAS_ENDPOINT, { params });

      const recetas = response.data?.List || [];
      const meta = response.data?.Meta || {};

      return { recetas, meta };
    } catch (error) {
      console.error(`❌ Error en obtenerRecetas (intento ${attempt}):`, error);

      if (attempt === retries) {
        const msg =
          error.response?.data?.message ||
          "Error al obtener la lista de recetas después de varios intentos";
        throw new Error(msg);
      }

      const backoff = delay * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
};

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
