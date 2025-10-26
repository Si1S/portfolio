pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let pdfDoc = null;
let currentPage = 1;
let pageRendering = false;
let pageNumPending = null;

const canvas = document.getElementById("pdf-canvas");
const ctx = canvas.getContext("2d");
const currentPageSpan = document.getElementById("current-page");
const totalPagesSpan = document.getElementById("total-pages");
const prevButton = document.getElementById("prev-page");
const nextButton = document.getElementById("next-page");

async function loadPdf() {
  try {
    // Récupérer l'URL présignée du Worker
    const response = await fetch("https://pdf-viewer-file.jrguerin.workers.dev/get-presigned-pdf");
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
    const data = await response.json();

    // Charger le PDF via PDF.js avec l'URL présignée
    pdfDoc = await pdfjsLib.getDocument(data.url).promise;
    totalPagesSpan.textContent = pdfDoc.numPages;

    renderPage(currentPage);
  } catch (error) {
    alert("Erreur lors du chargement du PDF : " + error.message);
    console.error(error);
  }
}

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.2 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    page.render({ canvasContext: ctx, viewport: viewport }).promise.then(() => {
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
