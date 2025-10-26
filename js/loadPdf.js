// js/loadPdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfDoc = null;

async function loadPdf() {
  const container = document.getElementById("pdf-viewer-container");
  container.innerHTML = '<p style="color: #00f0ff; text-align: center;">⏳ Chargement du certificat...</p>';

  try {
    // Retrieve the PDF via the Worker
    const response = await fetch("https://pdf-viewer-file.jrguerin.workers.dev/get-presigned-pdf", {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ PDF chargé - Taille:', data.size, 'octets');

    // Decode base64 PDF into Uint8Array for PDF.js
    const base64 = data.url.split(',')[1];
    const binary = atob(base64);
    const pdfData = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) pdfData[i] = binary.charCodeAt(i);

    // Load the PDF via PDF.js
    pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
    console.log('📄 Nombre de pages:', pdfDoc.numPages);

    // Restore the canvas
    container.innerHTML = '<canvas id="pdf-canvas" style="border:1px solid rgba(0,0,0,0.1); border-radius:8px; width:100%;"></canvas>';
    const canvas = document.getElementById("pdf-canvas");
    const ctx = canvas.getContext("2d");

    // Display the first page
    const page = await pdfDoc.getPage(1);
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: ctx, viewport }).promise;
    console.log('✅ Certificat affiché');

    // Security: prevent right click and select/drag
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.style.userSelect = 'none';
    canvas.style.webkitUserSelect = 'none';
    canvas.style.mozUserSelect = 'none';
    canvas.addEventListener('dragstart', (e) => e.preventDefault());

  } catch (error) {
    container.innerHTML = '<p style="color: #ff6b6b; text-align: center;">❌ Erreur lors du chargement du certificat</p>';
    console.error('❌ Erreur complète:', error);
  }
}

// Load the PDF when the page loads
window.addEventListener('load', loadPdf);
