import { Button, ButtonProps, CircularProgress } from '@mui/material';

/**
 * Botão padrão do design system.
 * Usa o tema centralizado (primary, hover, disabled).
 * Suporta estado de loading; use em submissões e ações assíncronas.
 *
 * @example
 * <AppButton variant="contained" onClick={save}>Salvar</AppButton>
 * <AppButton variant="contained" loading>Salvando...</AppButton>
 */
export function AppButton({
  loading = false,
  disabled,
  children,
  ...rest
}: ButtonProps & { loading?: boolean }) {
  return (
    <Button
      disabled={disabled ?? loading}
      {...rest}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : rest.startIcon}
    >
      {children}
    </Button>
  );
}
