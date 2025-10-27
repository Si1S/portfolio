// Security protections for PDF viewer
document.addEventListener('keydown', (e) => {
  const pdfContainer = document.getElementById('pdf-viewer-container');

  if (e.target.closest('#pdf-viewer-container') || document.activeElement === pdfContainer) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      e.stopPropagation();
      console.warn('⚠️ Save disabled for this document');
      return false;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      e.stopPropagation();
      console.warn('⚠️ Print disabled for this document');
      return false;
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
});

window.addEventListener('beforeprint', (e) => {
  const pdfCanvas = document.getElementById('pdf-canvas');
  if (pdfCanvas) {
    pdfCanvas.dataset.originalDisplay = pdfCanvas.style.display;
    pdfCanvas.style.display = 'none';
  }
});

window.addEventListener('afterprint', (e) => {
  const pdfCanvas = document.getElementById('pdf-canvas');
  if (pdfCanvas) {
    pdfCanvas.style.display = pdfCanvas.dataset.originalDisplay || 'block';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const checkCanvas = setInterval(() => {
    const pdfCanvas = document.getElementById('pdf-canvas');
    if (pdfCanvas) {
      pdfCanvas.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });
      clearInterval(checkCanvas);
    }
  }, 100);

  setTimeout(() => clearInterval(checkCanvas), 5000);
});
