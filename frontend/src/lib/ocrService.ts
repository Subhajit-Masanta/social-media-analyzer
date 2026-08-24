import type { Worker } from 'tesseract.js';

let workerInstance: Worker | null = null;
let workerReady = false;
let currentOnProgress: ((progress: number, label: string) => void) | null = null;

/**
 * Returns the cached Tesseract worker, creating it only on the first call. to load fast..
 * The logger is wired so the "recognizing text" progress (0–1) maps to 20–100%.
 */
async function getWorker(): Promise<Worker> {
  if (workerInstance && workerReady) return workerInstance;

  const { createWorker } = await import('tesseract.js');

  workerInstance = await createWorker('eng', 1, {
    logger: (m: any) => {
      if (m.status === 'recognizing text' && currentOnProgress) {
        const p = 20 + Math.floor(m.progress * 80);
        currentOnProgress(p, `${currentLabelPrefix} ${p}%`);
      }
    },
  });

  workerReady = true;
  return workerInstance;
}

let currentLabelPrefix = 'Extracting text…';

/**
 * Extracts text from an image file.
 * Compresses the image first to avoid OOM crashes on large photos.
 */
export async function extractTextFromImage(
  file: File,
  onProgress: (progress: number, label: string) => void,
  customLabelPrefix: string = 'Extracting text…',
): Promise<{ text: string; confidence: number }> {
  // Always update the active progress callback so the cached worker logs correctly
  currentOnProgress = onProgress;
  currentLabelPrefix = customLabelPrefix;

  // Step 1 — Compress (only if very large, to preserve text edges for OCR process)
  onProgress(5, 'Optimising image…');
  let processedFile: File = file;

  if (file.size > 4 * 1024 * 1024) {
    const { default: imageCompression } = await import('browser-image-compression');
    processedFile = await imageCompression(file, {
      maxSizeMB: 4,
      maxWidthOrHeight: 3500,
      useWebWorker: true,
    });
  }

  // Step 2 — Init worker (slow only on first call)
  onProgress(10, customLabelPrefix === 'Extracting text…' ? 'Initialising OCR engine…' : `${customLabelPrefix} (Init)`);
  const worker = await getWorker();
  onProgress(20, customLabelPrefix === 'Extracting text…' ? 'OCR engine ready' : `${customLabelPrefix} (Ready)`);

  // Step 3 — Recognise
  const result = await worker.recognize(processedFile);
  onProgress(100, customLabelPrefix === 'Extracting text…' ? 'Text extracted' : `${customLabelPrefix} (Done)`);

  const text = result.data.text.trim();
  if (!text) {
    throw new Error(
      'No text could be extracted. Ensure the image contains readable text.',
    );
  }

  return {
    text,
    confidence: Math.round(result.data.confidence),
  };
}

export async function terminateOCRWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
    workerReady = false;
    currentOnProgress = null;
  }
}
