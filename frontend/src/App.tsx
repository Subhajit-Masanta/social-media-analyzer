import { useState } from 'react';
import {
  AppBar, Toolbar, Box, Typography, Chip, Container,
} from '@mui/material';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={reset}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', 
              borderRadius: 1.5, p: 0.5, display: 'flex' 
            }}>
              <DriveFileRenameOutlineIcon sx={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              Draftline
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Main ───────────────────────────────────────── */}
      <Container maxWidth="xl" sx={{ flex: 1, pt: { xs: 3, md: 5 }, pb: 6, display: 'flex', flexDirection: 'column' }}>
        {/* Custom Pill Stepper */}
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mb: { xs: 3, md: 4 }, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          {STEPS.map((label, i) => {
            const isActive = activeStep === i;
            const isCompleted = activeStep > i;
            return (
              <Chip
                key={label}
                label={`${i + 1}. ${label}`}
                sx={{
                  bgcolor: isActive ? 'primary.main' : isCompleted ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#fff' : isCompleted ? 'primary.light' : 'text.disabled',
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: '999px',
                  px: 1.5,
                  py: 2.5,
                  fontSize: '0.85rem',
                  border: '1px solid',
                  borderColor: isActive ? 'primary.main' : isCompleted ? 'rgba(139,92,246,0.25)' : 'transparent',
                }}
              />
            );
          })}
        </Box>

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
          py: 3, textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          mt: 'auto'
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, letterSpacing: '0.02em' }}>
          Built by Subhajit Masanta
        </Typography>
      </Box>
    </Box>
  );
}
