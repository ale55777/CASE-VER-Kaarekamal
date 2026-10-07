import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generatePdfFromElement(element) {
  const pages = [...element.querySelectorAll('.pdf-page')];
  if (!pages.length) throw new Error('No PDF pages found');

  const first = pages[0];
  const firstFormat = [Number(first.dataset.pdfWidth), Number(first.dataset.pdfHeight)];
  const pdf = new jsPDF({ unit: 'pt', format: firstFormat, orientation: 'portrait' });

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    const width = Number(page.dataset.pdfWidth);
    const height = Number(page.dataset.pdfHeight);
    const canvas = await html2canvas(page, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
    const image = canvas.toDataURL('image/jpeg', 0.95);
    if (index > 0) pdf.addPage([width, height], 'portrait');
    pdf.addImage(image, 'JPEG', 0, 0, width, height);
  }

  return pdf;
}
