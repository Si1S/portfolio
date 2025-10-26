pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfDoc = null;
let currentPage = 1;
let pageRendering = false;
let pageNumPending = null;

const pdfCanvas = document.getElementById("pdf-canvas");
const pdfCtx = pdfCanvas.getContext("2d");
const currentPageSpan = document.getElementById("current-page");
const totalPagesSpan = document.getElementById("total-pages");
const prevButton = document.getElementById("prev-page");
const nextButton = document.getElementById("next-page");

async function loadPdf() {
  try {
    const response = await fetch("https://pdf-viewer-file.jrguerin.workers.dev/get-presigned-pdf");

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur HTTP ${response.status}: ${errorData.error || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    console.log('PDF chargé - Taille:', data.size, 'octets');

    pdfDoc = await pdfjsLib.getDocument(data.url).promise;
    totalPagesSpan.textContent = pdfDoc.numPages;
    console.log('Nombre de pages:', pdfDoc.numPages);

    renderPage(currentPage);
  } catch (error) {
    console.error('Erreur complète:', error);
    alert("Erreur lors du chargement du PDF : " + error.message);
  }
}

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.2 });
    pdfCanvas.height = viewport.height;
    pdfCanvas.width = viewport.width;

    page.render({ canvasContext: pdfCtx, viewport: viewport }).promise.then(() => {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  currentPageSpan.textContent = num;
  prevButton.disabled = num <= 1;
  nextButton.disabled = num >= pdfDoc.numPages;
}

function queueRenderPage(num) {
  if (pageRendering) pageNumPending = num;
  else renderPage(num);
}

prevButton.addEventListener('click', () => {
  if (currentPage <= 1) return;
  currentPage--;
  queueRenderPage(currentPage);
});

nextButton.addEventListener('click', () => {
  if (currentPage >= pdfDoc.numPages) return;
  currentPage++;
  queueRenderPage(currentPage);
});

window.addEventListener('load', loadPdf);