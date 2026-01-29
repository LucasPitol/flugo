import { Box, Typography } from '@mui/material';
import { colors, typography } from '../../theme';

export interface EmptyStateProps {
  /** Mensagem principal (ex: "Nenhum colaborador cadastrado.") */
  message: string;
  /** Descrição opcional (ex: "Clique em Novo Colaborador para adicionar.") */
  description?: string;
  /** Ação opcional (ex: botão) */
  action?: React.ReactNode;
}

/**
 * Estado vazio padronizado para listas e tabelas.
 * Garante consistência visual quando não há dados.
 *
 * @example
 * <EmptyState
 *   message="Nenhum colaborador cadastrado."
 *   description='Clique em "Novo Colaborador" para adicionar o primeiro.'
 *   action={<AppButton onClick={onAdd}>Novo Colaborador</AppButton>}
 * />
 */
export function EmptyState({ message, description, action }: EmptyStateProps) {
  return (
    <Box
      sx={{
        py: 6,
        textAlign: 'center',
        borderBottom: 'none',
      }}
    >
      <Typography
        sx={{
          color: colors.neutral.textMuted,
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.regular,
          mb: 1,
        }}
      >
        {message}
      </Typography>
      {description && (
        <Typography
          sx={{
            color: colors.neutral.textDisabled,
            fontSize: typography.fontSize.sm,
            mb: action ? 2 : 0,
          }}
        >
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
