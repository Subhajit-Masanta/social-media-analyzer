import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';
import './styles/globals.css';

// ─── MUI Dark Theme ──────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: '#8b5cf6' },
    secondary: { main: '#3b82f6' },
    success:   { main: '#10b981' },
    warning:   { main: '#f59e0b' },
    error:     { main: '#ef4444' },
    background: {
      default: '#0a0a0f',
      paper:   '#16161f',
    },
    text: {
      primary:   '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          borderRadius: 10,
          padding: '10px 22px',
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
              boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)',
              transform: 'translateY(-1px)',
            },
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, height: 6, background: 'rgba(255,255,255,0.08)' },
        bar: { borderRadius: 99, background: 'linear-gradient(90deg,#7c3aed,#8b5cf6)' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
          '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.4) !important' },
          '&.Mui-focused fieldset': { borderColor: '#8b5cf6 !important' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#16161f',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
