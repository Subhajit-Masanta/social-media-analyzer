import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box, Typography, LinearProgress, Alert, Chip,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface Props {
  loading: boolean;
  progress: number;
  label: string;
  error: string | null;
  onFile: (file: File) => void;
}

export function UploadStage({ loading, progress, label, error, onFile }: Props) {
  const [dropError, setDropError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    setDropError(null);
    if (accepted[0]) {
      onFile(accepted[0]);
    } else if (rejected.length > 0) {
      const dropError = rejected[0].errors[0];
      if (dropError?.code === 'file-too-large') {
        setDropError('File is too large. Maximum size is 10MB.');
      } else {
        setDropError('Format not accepted. Please upload a PDF, PNG, JPG, or WEBP file.');
      }
    }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: loading,
  });

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 4, md: 8 },
      alignItems: { xs: 'stretch', md: 'center' },
      mt: { xs: 2, md: 4 },
    }}>

      {/* Left Column: 60% */}
      <Box sx={{ flex: { md: '0 0 55%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h2" sx={{
            color: '#f8fafc',
            fontWeight: 800,
            mb: 2.5,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
            letterSpacing: '-0.03em',
            lineHeight: 1.15
          }}>
            Analyze Your Social Media Content
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '1.1rem', maxWidth: 500 }}>
            Upload a PDF or image of your post. We'll extract the text locally, send it to
            Gemini AI, and give you platform-specific engagement insights instantly.
          </Typography>
        </Box>

        {/* Feature section */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {[
            { icon: <PictureAsPdfIcon fontSize="small" />, label: 'PDF extraction' },
            { icon: <ImageIcon fontSize="small" />, label: 'Image OCR' },
            { icon: <SmartToyIcon fontSize="small" />, label: 'X · Instagram · LinkedIn' },
          ].map(({ icon, label }) => (
            <Chip
              key={label}
              icon={icon}
              label={label}
              size="medium"
              sx={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'text.secondary',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>

        {/* Error displays */}
        {error && <Alert severity="error" sx={{ maxWidth: 500 }}>{error}</Alert>}
        {dropError && <Alert severity="error" sx={{ maxWidth: 500 }}>{dropError}</Alert>}
      </Box>

      {/* Right Column: 40% Dropzone */}
      <Box sx={{ flex: { md: '0 0 45%' }, width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          {...getRootProps()}
          id="dropzone"
          sx={{
            width: '100%',
            flex: 1,
            minHeight: { xs: 280, md: 420 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isDragActive ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
            border: '1px solid',
            borderColor: isDragActive ? 'primary.main' : 'transparent',
            borderRadius: 4,
            textAlign: 'center',
            cursor: loading ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: isDragActive ? '0 0 60px rgba(139,92,246,0.15)' : 'inset 0 2px 20px rgba(255,255,255,0.02)',
            '&:hover': loading ? {} : {
              borderColor: 'rgba(139,92,246,0.4)',
              bgcolor: 'rgba(139,92,246,0.04)',
            },
          }}
        >
          <input {...getInputProps()} />

          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center', py: 2 }}>
              <Box sx={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(139,92,246,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse-glow 2s infinite',
              }}>
                <SmartToyIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              </Box>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, mb: 1.5 }}>
                  {label}
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)' }} />
                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>{progress}%</Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <PictureAsPdfIcon sx={{ color: '#ef4444', fontSize: 32 }} />
                </Box>
                <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <ImageIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
                </Box>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                  {isDragActive ? 'Drop it here!' : 'Select a document'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag and drop, or click to browse
                </Typography>
              </Box>
              <Chip
                label="PDF, PNG, JPG, WEBP (Max 10MB)"
                size="small"
                sx={{ mt: 1, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'text.disabled', fontSize: '0.7rem' }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
