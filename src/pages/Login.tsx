import { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthError } from '../../back-end/data/errors/AuthError';
import { colors, typography, borderRadius, shadows } from '../theme';
import { AppButton, AppSnackbar } from '../components/ui';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toLoginErrorMessage(err: unknown): string {
  if (err instanceof AuthError && err.cause && typeof err.cause === 'object' && 'code' in err.cause) {
    const code = (err.cause as { code?: string }).code;
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'E-mail ou senha incorretos.';
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua rede.';
    }
  }
  if (err instanceof AuthError && err.message) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return 'Não foi possível entrar. Tente novamente.';
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const validate = (): boolean => {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = 'E-mail é obrigatório';
    else if (!EMAIL_REGEX.test(email.trim())) next.email = 'E-mail inválido';
    if (!password) next.password = 'Senha é obrigatória';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    login(email.trim(), password)
      .then(() => navigate('/colaboradores', { replace: true }))
      .catch((err) => {
        setToastMessage(toLoginErrorMessage(err));
        setToastOpen(true);
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.neutral.backgroundAlt,
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 4,
          bgcolor: colors.neutral.background,
          borderRadius: borderRadius.sm,
          boxShadow: shadows.lg,
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Box
            component="img"
            src="/logo2.png"
            alt="Flugo"
            sx={{ height: 40, width: 'auto', objectFit: 'contain', mb: 2 }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: typography.fontWeight.semibold,
              color: colors.neutral.text,
              fontSize: typography.fontSize['2xl'],
            }}
          >
            Entrar
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.neutral.textMuted, mt: 0.5 }}
          >
            Use seu e-mail e senha para acessar.
          </Typography>
        </Box>

        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          fullWidth
          variant="outlined"
          required
          error={!!errors.email}
          helperText={errors.email}
          autoComplete="email"
          sx={{ mb: 2 }}
        />
        <TextField
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          fullWidth
          variant="outlined"
          required
          error={!!errors.password}
          helperText={errors.password}
          autoComplete="current-password"
          sx={{ mb: 3 }}
        />

        <AppButton
          type="submit"
          variant="contained"
          fullWidth
          loading={submitting}
          sx={{ py: 1.5 }}
        >
          Entrar
        </AppButton>
      </Box>

      <AppSnackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
      />
    </Box>
  );
}
