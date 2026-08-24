import { z } from 'zod';

// ─── Pydantic mirror: matches backend api/models.py exactly ───
export const AnalysisResultSchema = z.object({
  score:          z.number().int().min(0).max(100),
  tone:           z.string(),
  strengths:      z.array(z.string()).min(1),
  improvements:   z.array(z.string()).min(1),
  rewritten_post: z.string(),
  hashtags:       z.array(z.string()),
  character_count: z.number().int(),
  platform_notes: z.string().nullable().optional(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export type Platform = 'X' | 'Instagram' | 'LinkedIn';

export interface AnalyzeRequest {
  text: string;
  platform: Platform;
  model?: string;
}

export type AppStage = 'upload' | 'review' | 'results';

export interface FileProcessingState {
  stage:    AppStage;
  file:     File | null;
  text:     string;
  progress: number;
  label:    string;
  loading:  boolean;
  error:    string | null;
  ocrConfidence: number | null;
  result:   AnalysisResult | null;
}
