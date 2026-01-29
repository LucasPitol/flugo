import { Box, Typography, TypographyProps } from '@mui/material';

export interface PageHeaderProps {
  /** Título da página (ex: "Colaboradores") */
  title: string;
  /** Ação alinhada à direita (ex: botão "Novo Colaborador") */
  action?: React.ReactNode;
  /** Variante do título (default: h4) */
  titleVariant?: TypographyProps['variant'];
}

/**
 * Cabeçalho padrão de página: título + ação opcional.
 * Mantém alinhamento e espaçamento consistentes entre telas.
 *
 * @example
 * <PageHeader
 *   title="Colaboradores"
 *   action={<AppButton variant="contained" onClick={onNew}>Novo Colaborador</AppButton>}
 * />
 */
export function PageHeader({ title, action, titleVariant = 'h4' }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3,
      }}
    >
      <Typography variant={titleVariant}>{title}</Typography>
      {action}
    </Box>
  );
}
