import { Component, lazy, Suspense } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography, Button } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Colaboradores } from './pages/Colaboradores';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';

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
            bgcolor: 'background.default',
            color: 'text.primary',
          }}
        >
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Algo deu errado
          </Typography>
          <Typography sx={{ mb: 2, color: 'text.secondary', textAlign: 'center' }}>
            {this.state.error?.message ?? 'Erro inesperado'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.reload()}>
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
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />

                {/* Rotas privadas — envolvidas por ProtectedRoute */}
                <Route path="/" element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route index element={<Navigate to="/colaboradores" replace />} />
                    <Route path="colaboradores" element={<Colaboradores />} />
                    <Route path="colaboradores/novo" element={<NovoColaborador />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
