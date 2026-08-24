import { Box, Typography } from '@mui/material';

interface Props {
  score: number;
}

function getColor(score: number) {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export function ScoreRing({ score }: Props) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = getColor(score);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 120 120" style={{ display: 'block' }}>
        {/* Track */}
        <circle cx="60" cy="60" r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
        {/* Progress */}
        <circle cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 8px ${color}80)`,
          }}
        />
      </svg>
      <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
        <Typography sx={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.04em', color, lineHeight: 1 }}>
          {score}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500, mt: '2px' }}>
          / 100
        </Typography>
      </Box>
    </Box>
  );
}
