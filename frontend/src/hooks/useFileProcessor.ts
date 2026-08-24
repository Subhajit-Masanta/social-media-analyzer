import { useState, useCallback } from 'react';
import type { FileProcessingState, Platform } from '../types/analysis';
import { extractTextFromPDF } from '../lib/pdfService';
import { extractTextFromImage } from '../lib/ocrService';
import { analyzeContent } from '../lib/analyzeService';

const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const INITIAL: FileProcessingState = {
  stage: 'upload',
  file: null,
  text: '',
  progress: 0,
  label: '',
  loading: false,
  error: null,
  ocrConfidence: null,
  result: null,
};

export function useFileProcessor() {
  const [state, setState] = useState<FileProcessingState>(INITIAL);

  const patch = (update: Partial<FileProcessingState>) =>
    setState(prev => ({ ...prev, ...update }));

  /** Called when a file is dropped/selected    */
  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      patch({ error: 'Only PDF, PNG, JPG, and WEBP files are supported.' });
      return;
    }
    if (file.size > MAX_BYTES) {
      patch({ error: 'File too large. Maximum is 10 MB.' });
      return;
    }

    patch({ file, loading: true, error: null, progress: 0, label: 'Reading file…' });

    try {
      let text: string;
      let ocrConfidence: number | null = null;

      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file, (p, label) =>
          patch({ progress: p, label: label || `Reading PDF… ${p}%` }),
        );
      } else {
        const result = await extractTextFromImage(file, (p, label) =>
          patch({ progress: p, label }),
        );
        text = result.text;
        ocrConfidence = result.confidence;
      }

      if (text.trim().length < 5) {
        throw new Error('Could not extract enough readable text (5 characters). Please try a clearer document.');
      }
      if (text.length > 25000) {
        throw new Error('Document contains too much text (limit ~25,000 characters). Please upload a shorter document.');
      }

      patch({ text, ocrConfidence, loading: false, stage: 'review', progress: 100 });
    } catch (err: any) {
      patch({ loading: false, error: err.message ?? 'Failed to read file.' });
    }
  }, []);

  /** Called from ReviewStage when user clicks Analyse */
  const analyze = useCallback(async (text: string, platform: Platform) => {
    patch({ loading: true, error: null, label: 'Analysing with AI…' });
    try {
      const result = await analyzeContent({ text, platform });
      patch({ result, loading: false, stage: 'results' });
    } catch (err: any) {
      patch({ loading: false, error: err.message ?? 'Analysis failed.' });
    }
  }, []);

  /** Reset back to the beginning */
  const reset = useCallback(() => setState(INITIAL), []);

  /** Go back to the review stage */
  const backToReview = useCallback(() =>
    patch({ stage: 'review', result: null, error: null }), []);

  return { state, processFile, analyze, reset, backToReview };
}
