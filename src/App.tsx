import { Component, lazy, Suspense } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography, Button } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { Colaboradores } from './pages/Colaboradores';

const NovoColaborador = lazy(() =>
  import('./pages/NovoColaborador').then((m) => ({ default: m.NovoColaborador }))
);

function PageFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <CircularProgress />
    </Box>
  );
}

class AppErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            bgcolor: '#fff',
            color: '#333',
          }}
        >
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Algo deu errado
          </Typography>
          <Typography sx={{ mb: 2, color: '#666', textAlign: 'center' }}>
            {this.state.error?.message ?? 'Erro inesperado'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()} sx={{ bgcolor: '#2ECC71' }}>
            Recarregar
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/colaboradores" replace />} />
                <Route path="colaboradores" element={<Colaboradores />} />
                <Route path="colaboradores/novo" element={<NovoColaborador />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
