import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material';
import { AppCard, EmptyState, AppButton } from '../../components/ui';
import { colors, typography } from '../../theme';
import type { Departamento } from '../../services/departamentos/types';

const SKELETON_ROWS = 6;

export type DepartamentosTableProps = {
  loading: boolean;
  departamentos: Departamento[];
  gestorNames: Record<string, string>;
  onEditRow: (row: Departamento) => void;
  onDeleteRow: (row: Departamento) => void;
};

export function DepartamentosTable({
  loading,
  departamentos,
  gestorNames,
  onEditRow,
  onDeleteRow,
}: DepartamentosTableProps) {
  return (
    <AppCard sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Gestor responsável</TableCell>
              <TableCell align="right">Nº de colaboradores</TableCell>
              <TableCell align="right" sx={{ width: 160 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow
                  key={index}
                  sx={{ '&:not(:last-child) .MuiTableCell-root': { borderBottom: 'none' } }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton
                      variant="text"
                      width="60%"
                      sx={{ fontSize: typography.fontSize.sm }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton
                      variant="text"
                      width="50%"
                      sx={{ fontSize: typography.fontSize.sm }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton
                      variant="text"
                      width={32}
                      sx={{ fontSize: typography.fontSize.sm }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }} />
                </TableRow>
              ))
            ) : departamentos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{ borderBottom: 'none', p: 0, verticalAlign: 'top' }}
                >
                  <EmptyState
                    message="Nenhum departamento cadastrado."
                    description='Adicione um departamento para começar.'
                  />
                </TableCell>
              </TableRow>
            ) : (
              departamentos.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:not(:last-child) .MuiTableCell-root': { borderBottom: 'none' } }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Typography
                      sx={{
                        color: colors.neutral.text,
                        fontWeight: typography.fontWeight.medium,
                        fontSize: typography.fontSize.sm,
                      }}
                    >
                      {row.nome}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 2, fontSize: typography.fontSize.sm }}>
                    {gestorNames[row.gestorResponsavelId] ?? '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2, fontSize: typography.fontSize.sm }}>
                    {row.colaboradoresIds.length}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <AppButton variant="text" size="small" onClick={() => onEditRow(row)}>
                        Editar
                      </AppButton>
                      <AppButton
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => onDeleteRow(row)}
                      >
                        Excluir
                      </AppButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </AppCard>
  );
}
