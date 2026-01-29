import { Chip } from '@mui/material';
import { states } from '../../theme';

export type StatusVariant = 'success' | 'error';

export interface StatusChipProps {
  label: string;
  variant?: StatusVariant;
  size?: 'small' | 'medium';
}

/**
 * Chip de status padronizado (Ativo/Inativo ou sucesso/erro).
 * Cores vêm do tema (states.chip).
 *
 * @example
 * <StatusChip label="Ativo" variant="success" />
 * <StatusChip label="Inativo" variant="error" />
 */
export function StatusChip({ label, variant = 'success', size = 'small' }: StatusChipProps) {
  const isSuccess = variant === 'success';
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: isSuccess ? states.chip.successBg : states.chip.errorBg,
        color: isSuccess ? states.chip.successColor : states.chip.errorColor,
      }}
    />
  );
}
