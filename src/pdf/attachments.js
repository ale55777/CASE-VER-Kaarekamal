function readImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = dataUrl;
  });
}

export async function appendImageAttachments(pdf, attachments = []) {
  for (const attachment of attachments) {
    if (!attachment?.data) continue;
    const dimensions = await readImageDimensions(attachment.data);
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 42;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - 115;
    const scale = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height);
    const width = dimensions.width * scale;
    const height = dimensions.height * scale;
    pdf.addPage([pageWidth, pageHeight], 'portrait');
    pdf.setTextColor(15, 95, 131);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Attached Document', margin, 34);
    pdf.setTextColor(102, 114, 125);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(attachment.name || 'Uploaded image', margin, 48);
    pdf.addImage(attachment.data, 'JPEG', (pageWidth - width) / 2, 65, width, height);
  }
  return pdf;
}
