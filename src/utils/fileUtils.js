// En utils/fileUtils.js

/**
 * Convierte un objeto File (o Blob) a una cadena Base64.
 * La porción del prefijo (ej: 'data:image/png;base64,') es eliminada
 * para obtener solo los datos Base64 puros.
 * * @param {File} file - El objeto File (ej: e.target.files[0]).
 * @returns {Promise<string>} La cadena Base64 pura.
 */
export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });