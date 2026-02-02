import { Snackbar, SnackbarProps, Alert, SnackbarCloseReason } from '@mui/material';
import type { ReactElement } from 'react';

const DEFAULT_ANCHOR = { vertical: 'bottom' as const, horizontal: 'right' as const };
const DEFAULT_AUTOHIDE = 6000;

export type AppSnackbarSeverity = 'success' | 'error' | 'info';

export type AppSnackbarProps = SnackbarProps & {
  /** Quando definido, exibe Alert com cor semântica (sucesso/erro). */
  severity?: AppSnackbarSeverity;
};

/**
 * Snackbar/Toast padrão do design system.
 * Posição e duração padronizadas. Use severity para feedback claro (transferências, erros de regra).
 *
 * @example
 * <AppSnackbar open={open} onClose={...} message="Salvo." severity="success" />
 * <AppSnackbar open={open} onClose={...} message="Erro de regra." severity="error" action={...} />
 */
export function AppSnackbar({
  anchorOrigin = DEFAULT_ANCHOR,
  autoHideDuration = DEFAULT_AUTOHIDE,
  severity,
  message,
  onClose,
  action,
  ...rest
}: AppSnackbarProps) {
  const handleAlertClose = () => {
    if (onClose) onClose(null as unknown as React.SyntheticEvent, 'timeout' as SnackbarCloseReason);
  };
  const content: ReactElement | undefined =
    severity && message != null ? (
      <Alert severity={severity} onClose={handleAlertClose} action={action} sx={{ width: '100%' }}>
        {message}
      </Alert>
    ) : undefined;
  return (
    <Snackbar
      anchorOrigin={anchorOrigin}
      autoHideDuration={autoHideDuration}
      message={severity ? undefined : message}
      onClose={onClose}
      action={severity ? undefined : action}
      {...rest}
    >
      {content}
    </Snackbar>
  );
}
