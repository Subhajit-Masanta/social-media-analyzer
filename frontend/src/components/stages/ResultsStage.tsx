import {
  Box, Typography, Button, Card, CardContent,
  Chip, Divider, Tooltip, Stack, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { AnalysisResult } from '../../types/analysis';
import { ScoreRing } from '../ui/ScoreRing';

interface Props {
  result: AnalysisResult;
  platform: string;
  onReset: () => void;
  onBack: () => void;
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };
  return (
    <Tooltip title={done ? 'Copied!' : 'Copy to clipboard'}>
      <Button
        id="copy-btn"
        size="small"
        startIcon={<ContentCopyIcon fontSize="small" />}
        onClick={handle}
        sx={{
          color: done ? 'success.main' : 'text.secondary',
          borderColor: done ? 'success.main' : 'rgba(255,255,255,0.1)',
          border: '1px solid',
          '&:hover': { background: 'rgba(255,255,255,0.05)' },
        }}
      >
        {done ? 'Copied!' : 'Copy'}
      </Button>
    </Tooltip>
  );
}

export function ResultsStage({ result, platform, onReset, onBack }: Props) {
  useEffect(() => {
    if (result.score >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b']
      });
    }
  }, [result.score]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 800, mx: 'auto', width: '100%' }}>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button id="back-to-review-btn" startIcon={<ArrowBackIcon />} onClick={onBack}
          sx={{ color: 'text.secondary', border: '1px solid rgba(255,255,255,0.1)', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}>
          Edit Text
        </Button>
        <Button id="new-analysis-btn" variant="contained" startIcon={<AddIcon />} onClick={onReset}>
          New Analysis
        </Button>
      </Box>

      {/* Score card */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <ScoreRing score={result.score} />
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }} gutterBottom>
                Engagement Score
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Optimised for <strong style={{ color: '#f1f5f9' }}>{platform}</strong>
              </Typography>
              <Chip
                label={`Tone: ${result.tone}`}
                size="small"
                sx={{
                  background: 'rgba(139,92,246,0.12)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  color: 'primary.main', fontWeight: 600,
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Strengths + Improvements */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ fontSize: '1.1rem' }}>✅</Box>
                What's Working
              </Typography>
              <Stack spacing={1.5}>
                {result.strengths.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, mt: 0.2,
                      background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography sx={{ fontSize: '0.6rem', color: 'success.main', fontWeight: 900 }}>✓</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ fontSize: '1.1rem' }}>⚡</Box>
                Improvements
              </Typography>
              <Stack spacing={1.5}>
                {result.improvements.map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Box sx={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, mt: 0.2,
                      background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Typography sx={{ fontSize: '0.7rem', color: 'warning.main', fontWeight: 900 }}>→</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{item}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Rewritten best version */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Optimized Post</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={`${result.character_count} chars`} size="small"
                sx={{ background: 'rgba(255,255,255,0.06)', color: 'text.disabled', fontSize: '0.72rem' }} />
              <CopyBtn text={result.rewritten_post} />
            </Box>
          </Box>
          <Typography variant="body1" sx={{ lineHeight: 1.85, whiteSpace: 'pre-wrap', color: 'text.primary' }}>
            {result.rewritten_post}
          </Typography>

          {result.hashtags.length > 0 && (
            <>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.07)' }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                <Typography sx={{ color: 'text.disabled', fontSize: '0.9rem' }}>#</Typography>
                {result.hashtags.map((tag, i) => (
                  <Chip key={i}
                    label={tag.startsWith('#') ? tag : `#${tag}`}
                    size="small"
                    sx={{
                      background: 'rgba(59,130,246,0.1)',
                      border: '1px solid rgba(59,130,246,0.2)',
                      color: '#60a5fa', fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Platform tip extraaaaa */}
      {result.platform_notes && (
        <Alert severity="info"
          sx={{ borderRadius: 3, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: 'text.secondary' }}>
          💡 {result.platform_notes}
        </Alert>
      )}
    </Box>
  );
}
