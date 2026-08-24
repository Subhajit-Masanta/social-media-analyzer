import { AnalysisResultSchema } from '../types/analysis';
import type { AnalysisResult, AnalyzeRequest } from '../types/analysis';
// In dev, Vite proxies /api → localhost:8000.
// In production, point this at your deployed Vercel backend URL.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

const TIMEOUT_MS = 40_000;

export async function analyzeContent(req: AnalyzeRequest): Promise<AnalysisResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Analysis is taking too long. Please try again.');
    }
    throw new Error('Network error — check your connection and try again.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 429) {
    throw new Error(
      'Gemini AI service temporarily rate-limited. Please wait a moment and try again.',
    );
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

  // Zod validates the shape so we never silently use malformed data
  const parsed = AnalysisResultSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('Received unexpected data from the server.');
  }

  return parsed.data;
}
