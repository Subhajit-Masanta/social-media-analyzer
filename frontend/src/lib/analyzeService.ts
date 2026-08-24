import { AnalysisResultSchema } from '../types/analysis';
import type { AnalysisResult, AnalyzeRequest } from '../types/analysis';
// In dev, Vite proxies '/api' → localhost:8000.
// In production, point this at your deployed Vercel backend URL.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

const TIMEOUT_MS = 120_000;

const FALLBACK_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

export async function analyzeContent(
  req: AnalyzeRequest,
  onProgress?: (label: string) => void
): Promise<AnalysisResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    for (let i = 0; i < FALLBACK_MODELS.length; i++) {
      const model = FALLBACK_MODELS[i];
      if (onProgress) {
        if (i === 0) {
          onProgress(`Analysing content…`);
        } else {
          onProgress(`High demand on AI servers, retrying… (${i + 1}/${FALLBACK_MODELS.length})`);
        }
      }

      const payload = { ...req, model };

      let response: Response;
      try {
        response = await fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new Error('Analysis is taking too long. Please try again.');
        }
        throw new Error('Network error — check your connection and try again.');
      }

      // Check if it's a rate limit or high demand (503/429/500 from backend)
      if (response.status === 429 || response.status === 503 || response.status === 500) {
        // If we have more models to try, wait 1s and try the next one
        if (i < FALLBACK_MODELS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
      }

      if (!response.ok) {
        let detail = 'AI analysis failed. Please try again.';
        try {
          const body = await response.json();
          if (body?.detail) detail = body.detail;
        } catch { /* ignore */ }
        throw new Error(detail);
      }

      const json = await response.json();
      const parsed = AnalysisResultSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error('Received unexpected data from the server.');
      }

      return parsed.data;
    }
  } finally {
    clearTimeout(timeoutId);
  }

  throw new Error('All fallback models failed due to high demand. Please try again later.');
}
