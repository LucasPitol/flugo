import { useState } from 'react';
import { Box, TextField, Typography, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthServiceError } from '../services/auth/errors';
import { colors, typography, borderRadius, shadows } from '../theme';
import { AppButton, AppSnackbar } from '../components/ui';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function toCadastroErrorMessage(err: unknown): string {
  if (err instanceof AuthServiceError) {
    switch (err.code) {
      case 'email-already-in-use':
        return 'E-mail já cadastrado. Use outro e-mail ou faça login.';
      case 'invalid-email':
        return 'E-mail inválido.';
      case 'weak-password':
        return 'Senha deve ter no mínimo 8 caracteres.';
      case 'too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 'network-request-failed':
        return 'Erro de conexão. Verifique sua rede.';
      case 'operation-not-allowed':
        return 'Cadastro por e-mail/senha não está habilitado.';
      default:
        return err.message || 'Não foi possível criar a conta. Tente novamente.';
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return 'Não foi possível criar a conta. Tente novamente.';
}

export function Cadastro() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const validate = (): boolean => {
    const next: { email?: string; password?: string; confirmPassword?: string } = {};
    if (!email.trim()) next.email = 'E-mail é obrigatório';
    else if (!EMAIL_REGEX.test(email.trim())) next.email = 'E-mail inválido';
    if (!password) next.password = 'Senha é obrigatória';
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `Senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`;
    if (!confirmPassword) next.confirmPassword = 'Confirme a senha.';
    else if (password !== confirmPassword) next.confirmPassword = 'As senhas devem ser iguais.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    register(email.trim(), password)
      .then(() => navigate('/colaboradores', { replace: true }))
      .catch((err) => {
        setToastMessage(toCadastroErrorMessage(err));
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
            Cadastro
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.neutral.textMuted, mt: 0.5 }}
          >
            Crie sua conta com e-mail e senha.
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
          disabled={submitting}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => {
            const v = e.target.value;
            setPassword(v);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            setErrors((prev) => ({
              ...prev,
              confirmPassword:
                confirmPassword && v !== confirmPassword ? 'As senhas devem ser iguais.' : undefined,
            }));
          }}
          fullWidth
          variant="outlined"
          required
          error={!!errors.password}
          helperText={errors.password}
          autoComplete="new-password"
          disabled={submitting}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Confirme a senha"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            const v = e.target.value;
            setConfirmPassword(v);
            setErrors((prev) => ({
              ...prev,
              confirmPassword: v && v !== password ? 'As senhas devem ser iguais.' : undefined,
            }));
          }}
          fullWidth
          variant="outlined"
          required
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          autoComplete="new-password"
          disabled={submitting}
          sx={{ mb: 3 }}
        />

        <AppButton
          type="submit"
          variant="contained"
          fullWidth
          loading={submitting}
          sx={{ py: 1.5, mb: 2 }}
        >
          Criar conta
        </AppButton>

        <Typography
          variant="body2"
          sx={{
            textAlign: 'center',
            color: colors.neutral.textMuted,
            opacity: submitting ? 0.6 : 1,
            pointerEvents: submitting ? 'none' : 'auto',
          }}
        >
          Já tem conta?{' '}
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: colors.primary.main,
              fontWeight: typography.fontWeight.medium,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Entrar
          </Link>
        </Typography>
      </Box>

      <AppSnackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        action={
          <AppButton color="inherit" size="small" onClick={() => setToastOpen(false)}>
            Fechar
          </AppButton>
        }
      />
    </Box>
  );
}
