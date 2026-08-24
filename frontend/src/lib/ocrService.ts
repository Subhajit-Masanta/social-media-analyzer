import type { Worker } from 'tesseract.js';

let workerInstance: Worker | null = null;
let workerReady = false;

/**
 * Returns the cached Tesseract worker, creating it only on the first call.
 * The logger is wired so the "recognizing text" progress (0–1) maps to 20–100%.
 */
async function getWorker(
  onProgress: (progress: number, label: string) => void,
): Promise<Worker> {
  if (workerInstance && workerReady) return workerInstance;

  const { createWorker } = await import('tesseract.js');

  workerInstance = await createWorker('eng', 1, {
    logger: (m: any) => {
      if (m.status === 'recognizing text') {
        const p = 20 + Math.floor(m.progress * 80);
        onProgress(p, `Extracting text… ${p}%`);
      }
    },
  });

  workerReady = true;
  return workerInstance;
}

/**
 * Extracts text from an image file.
 * Compresses the image first to avoid OOM crashes on large photos.
 */
export async function extractTextFromImage(
  file: File,
  onProgress: (progress: number, label: string) => void,
): Promise<{ text: string; confidence: number }> {
  // Step 1 — Compress
  onProgress(5, 'Optimising image…');
  const { default: imageCompression } = await import('browser-image-compression');
  const compressed = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
  });

  // Step 2 — Init worker (slow only on first call)
  onProgress(10, 'Initialising OCR engine…');
  const worker = await getWorker(onProgress);
  onProgress(20, 'OCR engine ready');

  // Step 3 — Recognise
  const result = await worker.recognize(compressed);
  onProgress(100, 'Text extracted');

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
  }
}
