import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box, Typography, LinearProgress, Alert, Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* Hero */}
      <Box sx={{ textAlign: 'center', maxWidth: 560 }}>
        <Typography variant="h3" sx={{
          fontWeight: 800, mb: 1.5, fontSize: { xs: '2rem', md: '2.6rem' },
          background: 'linear-gradient(135deg, #f1f5f9 30%, #8b5cf6)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Analyze Your Social Media Content
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Upload a PDF or image of your post. We'll extract the text, send it to
          Gemini AI, and give you platform-specific engagement insights — instantly.
        </Typography>
      </Box>

      {/* Drop zone */}
      <Box
        {...getRootProps()}
        id="dropzone"
        sx={{
          width: '100%',
          maxWidth: 600,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'rgba(255,255,255,0.1)',
          borderRadius: 4,
          p: 6,
          textAlign: 'center',
          cursor: loading ? 'default' : 'pointer',
          background: isDragActive
            ? 'rgba(139,92,246,0.08)'
            : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
          boxShadow: isDragActive ? '0 0 60px rgba(139,92,246,0.2)' : 'none',
          '&:hover': loading ? {} : {
            borderColor: 'primary.main',
            background: 'rgba(139,92,246,0.05)',
            boxShadow: '0 0 40px rgba(139,92,246,0.15)',
          },
        }}
      >
        <input {...getInputProps()} />

        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(139,92,246,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pulse-glow 2s infinite',
            }}>
              <SmartToyIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            <Box sx={{ width: '100%', maxWidth: 360 }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
            <Typography variant="caption" color="text.disabled">{progress}%</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 80, height: 80, borderRadius: 3,
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 1,
              transition: 'all 0.2s ease',
            }}>
              <CloudUploadIcon sx={{ color: 'primary.main', fontSize: 38 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {isDragActive ? 'Drop it here!' : 'Drag & drop your file'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
              PDF, PNG, JPG, WEBP · Max 10 MB
            </Typography>
          </Box>
        )}
      </Box>

      {/* Error displays */}
      {error && (
        <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
          {error}
        </Alert>
      )}
      {dropError && (
        <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
          {dropError}
        </Alert>
      )}

      {/* Feature chips */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
        {[
          { icon: <PictureAsPdfIcon fontSize="small" />, label: 'PDF text extraction' },
          { icon: <ImageIcon fontSize="small" />, label: 'OCR for images' },
          { icon: <SmartToyIcon fontSize="small" />, label: 'Twitter · Instagram · LinkedIn' },
        ].map(({ icon, label }) => (
          <Chip
            key={label}
            icon={icon}
            label={label}
            size="small"
            sx={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'text.secondary',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
