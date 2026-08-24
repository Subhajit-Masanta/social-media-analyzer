import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Alert,
  ToggleButtonGroup, ToggleButton, CircularProgress,
  Card, CardContent, Divider, Dialog, DialogTitle, DialogContent, IconButton, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import type { Platform } from '../../types/analysis';

const PLATFORMS: { value: Platform; icon: React.ReactNode; limitNum: number }[] = [
  { value: 'X', icon: <XIcon sx={{ fontSize: 32, color: '#ffffff' }} />, limitNum: 280 },
  { value: 'Instagram', icon: <InstagramIcon sx={{ fontSize: 32, color: '#E1306C' }} />, limitNum: 2200 },
  { value: 'LinkedIn', icon: <LinkedInIcon sx={{ fontSize: 32, color: '#0A66C2' }} />, limitNum: 3000 },
];

interface Props {
  file?: File | null;
  text: string;
  ocrConfidence: number | null;
  loading: boolean;
  error: string | null;
  label?: string;
  onAnalyze: (text: string, platform: Platform) => void;
  onBack: () => void;
}

export function ReviewStage({ file, text, ocrConfidence, loading, error, label, onAnalyze, onBack }: Props) {
  const [editedText, setEditedText] = useState(text);
  const [platform, setPlatform] = useState<Platform>('X');
  const [modalOpen, setModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const canAnalyze = editedText.trim().length >= 10 && !loading;
  const lowConfidence = ocrConfidence !== null && ocrConfidence < 60;
  const isRetrying = label?.includes('retrying');

  const handleBackClick = () => {
    const msg = loading 
      ? 'Analysis is currently in progress. Are you sure you want to cancel and go back?'
      : 'Are you sure you want to go back? Your extracted text and any edits will be lost.';
      
    if (window.confirm(msg)) {
      onBack();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 }, maxWidth: 800, mx: 'auto', width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Button
          id="back-btn"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          size="small"
          sx={{
            mt: 0.5, flexShrink: 0, color: 'text.secondary',
            border: '1px solid rgba(255,255,255,0.1)',
            '&:hover': { background: 'rgba(255,255,255,0.05)' },
          }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Review Extracted Text
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and edit the text below, then select your platform to analyze it.
          </Typography>
        </Box>
      </Box>

      {lowConfidence && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          OCR confidence is <strong>{ocrConfidence}%</strong> — please review carefully for typos before analysing.
        </Alert>
      )}

      <Card sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: { xs: 3, md: 4 }, pb: { xs: 4, md: 5 } }}>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon fontSize="small" sx={{ color: 'text.secondary' }} /> Edit Text
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={copied ? "Copied!" : "Copy text"}>
                  <Button
                    size="small"
                    startIcon={copied ? <CheckIcon color="success" /> : <ContentCopyIcon />}
                    onClick={handleCopy}
                    sx={{ color: copied ? 'success.main' : 'text.secondary', textTransform: 'none', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </Tooltip>
                {file && (
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setModalOpen(true)}
                    sx={{ color: 'text.secondary', textTransform: 'none', '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
                  >
                    View Original
                  </Button>
                )}
              </Box>
            </Box>

            <TextField
              id="review-textarea"
              multiline
              minRows={8}
              maxRows={20}
              fullWidth
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              placeholder="Click here to edit the extracted text..."
              disabled={loading}
              variant="outlined"
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  cursor: 'text',
                  p: 2.5,
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                Don't worry about length — we'll optimize this for your selected platform.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8rem' }}>
                {editedText.length.toLocaleString()} characters extracted
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

          <Box>
            <Typography variant="overline" color="text.disabled" sx={{ mb: 2, display: 'block', letterSpacing: '0.1em' }}>
              Target Platform
            </Typography>
            <ToggleButtonGroup
              value={platform}
              exclusive
              onChange={(_, val) => val && setPlatform(val)}
              disabled={loading}
              fullWidth
              sx={{
                gap: { xs: 1, md: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                opacity: loading ? 0.4 : 1,
                pointerEvents: loading ? 'none' : 'auto',
                transition: 'opacity 0.2s ease'
              }}
            >
              {PLATFORMS.map(({ value, icon, limitNum }) => (
                <ToggleButton
                  key={value}
                  id={`platform-${value.toLowerCase()}`}
                  value={value}
                  sx={{
                    flex: 1,
                    flexDirection: { xs: 'row', sm: 'column' },
                    gap: { xs: 1.5, sm: 1 },
                    py: { xs: 2, sm: 3 },
                    border: '1px solid rgba(255,255,255,0.1) !important',
                    borderRadius: '16px !important',
                    background: 'rgba(255,255,255,0.02)',
                    color: 'text.secondary',
                    transition: 'all 0.15s ease',
                    textTransform: 'none',
                    '&.Mui-selected': {
                      background: 'rgba(139,92,246,0.08)',
                      borderColor: 'primary.main !important',
                      color: 'primary.main',
                      boxShadow: '0 4px 20px rgba(139,92,246,0.15)',
                    },
                    '&:hover': { background: 'rgba(255,255,255,0.06)' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>{icon}</Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{value}</Typography>
                  <Typography variant="caption" color="inherit" sx={{ opacity: 0.6 }}>{limitNum.toLocaleString()} chars</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            id="analyze-btn"
            variant="contained"
            color={isRetrying ? "warning" : "primary"}
            size="large"
            fullWidth
            disabled={!canAnalyze && !loading}
            onClick={loading ? undefined : () => onAnalyze(editedText.trim(), platform)}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ 
              py: 2, 
              fontSize: '1.05rem', 
              fontWeight: 600, 
              borderRadius: 3, 
              mt: 1,
              pointerEvents: loading ? 'none' : 'auto',
              opacity: (loading && !isRetrying) ? 0.9 : 1
            }}
          >
            {loading ? (label || 'Analysing content…') : `Analyse for ${platform}`}
          </Button>
        </CardContent>
      </Card>

      {/* Document Preview section */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': { height: '85vh', background: '#111827', backgroundImage: 'none', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', p: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Original Document Reference</Typography>
          <IconButton onClick={() => setModalOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'rgba(0,0,0,0.5)', overflow: 'hidden' }}>
          {previewUrl && (
            file?.type.startsWith('image/') ? (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                <img src={previewUrl} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Original Document" />
              </Box>
            ) : (
              <iframe src={previewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Document Preview" />
            )
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
