import { extractTextFromImage } from './ocrService';

/**
 * Extracts text from a PDF file.
 * Uses Y-coordinate deltas + hasEOL to reconstruct paragraph breaks
 * instead of producing a wall of text. Falls back to OCR for scanned pages.
 */
export async function extractTextFromPDF(
  file: File,
  onProgress: (progress: number, label?: string) => void,
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

  if (totalPages > 15) {
    throw new Error(`This PDF is too large (${totalPages} pages). To ensure fast processing and respect AI token limits, please upload a document with 15 pages or fewer.`);
  }

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let pageText = '';
    
    // --- OCR FALLBACK PATH ---
    if (textContent.items.length === 0) {
      // It's a scanned page (no text layer)
      onProgress(
        Math.round(((pageNum - 1) / totalPages) * 100), 
        `Preparing page ${pageNum} for OCR...`
      );

      const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better OCR
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: context, viewport } as any).promise;
        
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        
        if (blob) {
          const imageFile = new File([blob], `page-${pageNum}.png`, { type: 'image/png' });
          try {
            const ocrResult = await extractTextFromImage(
              imageFile, 
              (ocrProgress, _label) => {
                // Map OCR progress (0-100) to this page's fraction of the total PDF progress
                const baseProgress = ((pageNum - 1) / totalPages) * 100;
                const pageFraction = 1 / totalPages;
                const scaledProgress = baseProgress + (ocrProgress * pageFraction);
                onProgress(Math.round(scaledProgress), `OCR scanning page ${pageNum} of ${totalPages}...`);
              },
              `OCR page ${pageNum}`
            );
            pageText = ocrResult.text;
          } catch (err) {
            console.warn(`OCR failed on page ${pageNum}, skipping:`, err);
            pageText = '';
          }
        }
      }
    } else {
      // --- NATIVE PDF PARSING PATH ---
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
    }

    // Collapse 3+ consecutive newlines to 2
    fullText += pageText.replace(/\n{3,}/g, '\n\n') + '\n\n';
    onProgress(Math.round((pageNum / totalPages) * 100));
  }

  const result = fullText.trim();
  if (!result) {
    throw new Error('No text found in PDF even after OCR scan. Please try uploading a different document.');
  }
  return result;
}
