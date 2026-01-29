import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

/**
 * Rota protegida por autenticação.
 * - loading → exibe loading
 * - não autenticado → redirect /login (state.from para redirect pós-login)
 * - autenticado → renderiza filhos (Outlet)
 * Isolado e reutilizável.
 */
export function ProtectedRoute() {
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ color: colors.neutral.textMuted }}>
          Verificando autenticação…
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
