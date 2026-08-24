/**
 * Extracts text from a PDF file.
 * Uses Y-coordinate deltas + hasEOL to reconstruct paragraph breaks
 * instead of producing a wall of text.
 */
export async function extractTextFromPDF(
  file: File,
  onProgress: (progress: number) => void,
): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = '';
  const totalPages = pdf.numPages;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let pageText = '';
    let lastY = -1;

    for (const item of textContent.items) {
      if (!('str' in item)) continue;

      // Significant Y-delta → new paragraph
      if (lastY !== -1 && Math.abs((item as any).transform[5] - lastY) > 5) {
        pageText += '\n';
      }

      pageText += (item as any).str;

      if ((item as any).hasEOL) {
        pageText += '\n';
      } else {
        pageText += ' ';
      }

      lastY = (item as any).transform[5];
    }

    // Collapse 3+ consecutive newlines to 2
    fullText += pageText.replace(/\n{3,}/g, '\n\n') + '\n\n';
    onProgress(Math.round((pageNum / totalPages) * 100));
  }

  const result = fullText.trim();
  if (!result) {
    throw new Error('No text found in PDF. Try uploading as an image instead.');
  }
  return result;
}
