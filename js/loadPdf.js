pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfDoc = null;
const pdfCanvas = document.getElementById("pdf-canvas");
const pdfCtx = pdfCanvas.getContext("2d");

async function loadPdf() {
  const container = document.getElementById("pdf-viewer-container");
  container.innerHTML = '<p style="color: #00f0ff; text-align: center;">⏳ Chargement du certificat...</p>';

  try {
    const response = await fetch("https://pdf-viewer-file.jrguerin.workers.dev/get-presigned-pdf", {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ PDF chargé - Taille:', data.size, 'octets');

    pdfDoc = await pdfjsLib.getDocument(data.url).promise;
    console.log('📄 Nombre de pages:', pdfDoc.numPages);

    // Restaurer le container original
    container.innerHTML = '<canvas id="pdf-canvas" style="border:1px solid rgba(0,0,0,0.1); border-radius:8px; width:100%;"></canvas>';

    // Réassigner les références après le innerHTML
    const canvas = document.getElementById("pdf-canvas");
    const ctx = canvas.getContext("2d");

    // Rendre la première (et unique) page
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    console.log('✅ Certificat affiché');

    // Désactiver le clic droit sur le canvas
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

  } catch (error) {
    container.innerHTML = '<p style="color: #ff6b6b; text-align: center;">❌ Erreur lors du chargement du certificat</p>';
    console.error('❌ Erreur complète:', error);
  }
}

window.addEventListener('load', loadPdf);