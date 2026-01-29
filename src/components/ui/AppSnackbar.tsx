import { Snackbar, SnackbarProps } from '@mui/material';

const DEFAULT_ANCHOR = { vertical: 'bottom' as const, horizontal: 'right' as const };
const DEFAULT_AUTOHIDE = 6000;

/**
 * Snackbar/Toast padrão do design system.
 * Posição e duração padronizadas; estilos vêm do tema.
 *
 * @example
 * <AppSnackbar
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   message="Salvo com sucesso."
 * />
 */
export function AppSnackbar({
  anchorOrigin = DEFAULT_ANCHOR,
  autoHideDuration = DEFAULT_AUTOHIDE,
  ...rest
}: SnackbarProps) {
  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      {...rest}
    />
  );
}
