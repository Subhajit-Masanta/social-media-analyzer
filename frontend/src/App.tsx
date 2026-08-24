import { useState } from 'react';
import {
  AppBar, Toolbar, Box, Typography, Chip, Container,
  Stepper, Step, StepLabel,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { UploadStage } from './components/stages/UploadStage';
import { useFileProcessor } from './hooks/useFileProcessor';
import type { Platform } from './types/analysis';
import { lazy, Suspense } from 'react';

const ReviewStage = lazy(() => import('./components/stages/ReviewStage').then(m => ({ default: m.ReviewStage })));
const ResultsStage = lazy(() => import('./components/stages/ResultsStage').then(m => ({ default: m.ResultsStage })));

const STEPS = ['Upload', 'Review', 'Results'];
const STAGE_INDEX = { upload: 0, review: 1, results: 2 };

export default function App() {
  const { state, processFile, analyze, reset, backToReview } = useFileProcessor();
  const [platform, setPlatform] = useState<Platform>('Instagram');

  const activeStep = STAGE_INDEX[state.stage];

  const handleAnalyze = (text: string, p: Platform) => {
    setPlatform(p);
    analyze(text, p);
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* ── Header ─────────────────────────────────────── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalyticsIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography variant="h6" sx={{
              fontWeight: 800, letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              PostIQ
            </Typography>
          </Box>
          <Chip
            label="Beta"
            size="small"
            sx={{
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.25)',
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.68rem',
              letterSpacing: '0.05em',
            }}
          />
        </Toolbar>
      </AppBar>

      {/* ── Main ───────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ flex: 1, pt: 12, pb: 5 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {STEPS.map(label => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': { color: 'text.secondary', fontWeight: 600 },
                  '& .MuiStepLabel-label.Mui-active': { color: 'primary.main' },
                  '& .MuiStepLabel-label.Mui-completed': { color: 'success.main' },
                  '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.1)' },
                  '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' },
                  '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Stage content */}
        {state.stage === 'upload' && (
          <UploadStage
            loading={state.loading}
            progress={state.progress}
            label={state.label}
            error={state.error}
            onFile={processFile}
          />
        )}

        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
            <Typography color="text.secondary">Loading...</Typography>
          </Box>
        }>
          {state.stage === 'review' && (
            <ReviewStage
              file={state.file}
              text={state.text}
              ocrConfidence={state.ocrConfidence}
              loading={state.loading}
              error={state.error}
              onAnalyze={handleAnalyze}
              onBack={reset}
            />
          )}

          {state.stage === 'results' && state.result && (
            <ResultsStage
              result={state.result}
              platform={platform}
              onReset={reset}
              onBack={backToReview}
            />
          )}
        </Suspense>
      </Container>

      {/* ── Footer ─────────────────────────────────────── */}
      <Box
        component="footer"
        sx={{
          py: 2, textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Typography variant="caption" color="text.disabled">
          Built by Subhajit Masanta
        </Typography>
      </Box>
    </Box>
  );
}
