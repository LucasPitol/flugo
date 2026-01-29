import { Paper, PaperProps } from '@mui/material';

/**
 * Card de superfície do design system.
 * Paper com bordas arredondadas e sombra padronizada (tema).
 * Use para agrupar conteúdo (tabelas, formulários, listas).
 *
 * @example
 * <AppCard>
 *   <TableContainer>...</TableContainer>
 * </AppCard>
 */
export function AppCard(props: PaperProps) {
  return <Paper elevation={0} {...props} />;
}
