import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { Colaboradores } from './pages/Colaboradores';
import { NovoColaborador } from './pages/NovoColaborador';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/colaboradores" replace />} />
            <Route path="colaboradores" element={<Colaboradores />} />
            <Route path="colaboradores/novo" element={<NovoColaborador />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
