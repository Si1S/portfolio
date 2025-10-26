pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const pdfUrl = "https://pdf-viewer-file.jrguerin.workers.dev?token=qLZrstrnSUQ694S4XRKB8wkW0XjTCfZizIzdRF910P0uVzEEXfgTIHPJckIryuDguKXsHCe7oDcUjt3S8Mv3BEWkFEm9xX0r8AlnowPPytKC35qpV8ZNJ3E6";

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
    const response = await fetch(pdfUrl, {headers: {'Accept': 'application/pdf'}});
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    pdfDoc = await pdfjsLib.getDocument({data: arrayBuffer}).promise;

    totalPagesSpan.textContent = pdfDoc.numPages;

    renderPage(currentPage);
  } catch (error) {
    alert("Erreur lors du chargement du PDF : " + error.message);
  }
}

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({scale: 1.2});
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    const renderTask = page.render(renderContext);
    renderTask.promise.then(() => {
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
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
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
