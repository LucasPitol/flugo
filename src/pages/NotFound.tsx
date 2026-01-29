import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { colors, typography } from '../theme';
import { AppButton } from '../components/ui';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.neutral.backgroundAlt,
        p: 3,
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontSize: '6rem',
          fontWeight: typography.fontWeight.bold,
          color: colors.primary.main,
          lineHeight: 1,
          mb: 1,
        }}
      >
        404
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: typography.fontWeight.semibold,
          color: colors.neutral.text,
          mb: 1,
        }}
      >
        Página não encontrada
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: colors.neutral.textMuted, mb: 3, textAlign: 'center' }}
      >
        A página que você procura não existe ou foi movida.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <AppButton variant="outlined" onClick={() => navigate(-1)}>
          Voltar
        </AppButton>
        <AppButton variant="contained" onClick={() => navigate('/', { replace: true })}>
          Ir para o início
        </AppButton>
      </Box>
    </Box>
  );
}
