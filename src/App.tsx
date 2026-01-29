import { lazy, Suspense } from 'react';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { Layout } from './components/Layout';

const Colaboradores = lazy(() =>
  import('./pages/Colaboradores').then((m) => ({ default: m.Colaboradores }))
);
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

function App() {
  return (
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
  );
}

export default App;
