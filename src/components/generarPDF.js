import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generarPDF = async (elemento, nombreArchivo = "receta.pdf") => {
  if (!elemento) throw new Error("No se encontró el elemento del preview");

  const esperarImagenes = (elemento) => {
    const imagenes = elemento.querySelectorAll("img");
    return Promise.all(
      Array.from(imagenes).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  };
  await esperarImagenes(elemento);

  const canvas = await html2canvas(elemento, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  const scaleFactor = 0.6;
  const scaledWidth = pdfWidth * scaleFactor;
  const scaledHeight = pdfHeight * scaleFactor;
  const x = (pdfWidth - scaledWidth) / 2;
  const y = 10;

  pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight);

  return pdf.output("datauristring").split(",")[1];
};
