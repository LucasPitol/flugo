import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Skeleton,
  Avatar,
  Checkbox,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AppCard, EmptyState, AppButton, StatusChip } from '../../components/ui';
import { colors, typography } from '../../theme';
import type { Colaborador } from '../../services/colaboradores/types';
import type { OrderByKey } from './hooks/useColaboradores';

const SKELETON_ROWS = 6;

export type ColaboradoresTableProps = {
  loading: boolean;
  sortedColaboradores: Colaborador[];
  selectedIds: Set<string>;
  orderBy: OrderByKey;
  order: 'asc' | 'desc';
  onRequestSort: (key: OrderByKey) => void;
  onToggleRow: (id: string) => void;
  onToggleSelectAll: () => void;
  onEditRow: (row: Colaborador) => void;
};

export function ColaboradoresTable({
  loading,
  sortedColaboradores,
  selectedIds,
  orderBy,
  order,
  onRequestSort,
  onToggleRow,
  onToggleSelectAll,
  onEditRow,
}: ColaboradoresTableProps) {
  return (
    <AppCard sx={{ overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ width: 48 }}>
                <Checkbox
                  indeterminate={
                    selectedIds.size > 0 &&
                    selectedIds.size < sortedColaboradores.length
                  }
                  checked={
                    sortedColaboradores.length > 0 &&
                    selectedIds.size === sortedColaboradores.length
                  }
                  onChange={onToggleSelectAll}
                  aria-label="selecionar todos"
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'nome'}
                  direction={orderBy === 'nome' ? order : 'asc'}
                  onClick={() => onRequestSort('nome')}
                >
                  Nome
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => onRequestSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'departamento'}
                  direction={orderBy === 'departamento' ? order : 'asc'}
                  onClick={() => onRequestSort('departamento')}
                >
                  Departamento
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => onRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ width: 120 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, index) => (
                <TableRow key={index} sx={{ '&:not(:last-child) .MuiTableCell-root': { borderBottom: 'none' } }}>
                  <TableCell padding="checkbox" sx={{ width: 48, py: 2 }} />
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Skeleton variant="circular" width={36} height={36} />
                      <Skeleton variant="text" width="60%" sx={{ fontSize: typography.fontSize.sm }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="text" width="75%" sx={{ fontSize: typography.fontSize.sm }} />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="text" width="40%" sx={{ fontSize: typography.fontSize.sm }} />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Skeleton variant="rounded" width={64} height={24} />
                  </TableCell>
                  <TableCell sx={{ py: 2 }} />
                </TableRow>
              ))
            ) : sortedColaboradores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ borderBottom: 'none', p: 0, verticalAlign: 'top' }}>
                  <EmptyState
                    message="Nenhum colaborador cadastrado."
                    description='Clique em "Novo Colaborador" para adicionar o primeiro.'
                  />
                </TableCell>
              </TableRow>
            ) : (
              sortedColaboradores.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ '&:not(:last-child) .MuiTableCell-root': { borderBottom: 'none' } }}
                >
                  <TableCell padding="checkbox" sx={{ width: 48, py: 2 }}>
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onChange={() => onToggleRow(row.id)}
                      aria-label={`selecionar ${row.nome}`}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: colors.success.light,
                          color: colors.primary.main,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Typography sx={{ color: colors.neutral.text, fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm }}>
                        {row.nome}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ py: 2, fontSize: typography.fontSize.sm }}>{row.email}</TableCell>
                  <TableCell sx={{ py: 2, fontSize: typography.fontSize.sm }}>{row.departamento}</TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <StatusChip
                      label={row.status}
                      variant={row.status === 'Ativo' ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <AppButton
                      variant="text"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => onEditRow(row)}
                    >
                      Detalhes
                    </AppButton>
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
