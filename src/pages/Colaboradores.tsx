import { useEffect, useState, useCallback, useMemo } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import {
  listarColaboradores,
  bulkDeleteColaboradores,
  toUserMessage,
} from '../services/colaboradoresService';
import type { ColaboradorDTO } from '../../back-end/domain/types/ColaboradorDTO';
import { colors, typography } from '../theme';
import {
  PageHeader,
  AppButton,
  AppCard,
  EmptyState,
  AppSnackbar,
  StatusChip,
} from '../components/ui';

const SKELETON_ROWS = 6;

type OrderByKey = 'nome' | 'email' | 'departamento' | 'status';

function compare(a: ColaboradorDTO, b: ColaboradorDTO, orderBy: OrderByKey): number {
  const va = a[orderBy];
  const vb = b[orderBy];
  if (va < vb) return -1;
  if (va > vb) return 1;
  return 0;
}

export function Colaboradores() {
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState<ColaboradorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [orderBy, setOrderBy] = useState<OrderByKey>('nome');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toastBulkOpen, setToastBulkOpen] = useState(false);
  const [toastBulkMessage, setToastBulkMessage] = useState('');

  const handleRequestSort = useCallback((key: OrderByKey) => {
    const isAsc = orderBy === key && order === 'asc';
    setOrderBy(key);
    setOrder(isAsc ? 'desc' : 'asc');
  }, [orderBy, order]);

  const sortedColaboradores = useMemo(() => {
    const arr = [...colaboradores];
    arr.sort((a, b) => {
      const cmp = compare(a, b, orderBy);
      return order === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [colaboradores, orderBy, order]);

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const allIds = sortedColaboradores.map((c) => c.id);
      const allSelected = allIds.length > 0 && allIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(allIds);
    });
  }, [sortedColaboradores]);

  const load = useCallback(() => {
    setLoading(true);
    listarColaboradores()
      .then((data) => {
        setColaboradores(data);
      })
      .catch(() => {
        setColaboradores([]);
        setToastOpen(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setDeleting(true);
    bulkDeleteColaboradores(ids)
      .then(() => {
        setSelectedIds(new Set());
        load();
        setConfirmOpen(false);
        setToastBulkMessage(
          ids.length === 1
            ? '1 colaborador excluído.'
            : `${ids.length} colaboradores excluídos.`
        );
        setToastBulkOpen(true);
      })
      .catch((err) => {
        setConfirmOpen(false);
        setToastBulkMessage(toUserMessage(err));
        setToastBulkOpen(true);
      })
      .finally(() => setDeleting(false));
  }, [selectedIds, load]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <PageHeader
        title="Colaboradores"
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedIds.size > 0 && (
              <AppButton
                variant="outlined"
                onClick={() => setConfirmOpen(true)}
              >
                Excluir selecionados
              </AppButton>
            )}
            <AppButton variant="contained" onClick={() => navigate('/colaboradores/novo')}>
              Novo Colaborador
            </AppButton>
          </Box>
        }
      />

      <AppSnackbar
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message="Não foi possível carregar os colaboradores. Tente novamente."
        action={
          <AppButton color="inherit" size="small" onClick={() => { load(); setToastOpen(false); }}>
            Tentar novamente
          </AppButton>
        }
      />

      <AppSnackbar
        open={toastBulkOpen}
        onClose={() => setToastBulkOpen(false)}
        message={toastBulkMessage}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        aria-labelledby="bulk-delete-dialog-title"
        aria-describedby="bulk-delete-dialog-description"
      >
        <DialogTitle id="bulk-delete-dialog-title">Excluir selecionados</DialogTitle>
        <DialogContent>
          <DialogContentText id="bulk-delete-dialog-description">
            {selectedIds.size === 1
              ? 'Excluir 1 colaborador? Essa ação não pode ser desfeita.'
              : `Excluir ${selectedIds.size} colaboradores? Essa ação não pode ser desfeita.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <AppButton onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancelar
          </AppButton>
          <AppButton
            variant="contained"
            color="error"
            onClick={handleBulkDelete}
            loading={deleting}
          >
            Excluir
          </AppButton>
        </DialogActions>
      </Dialog>

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
                    onChange={toggleSelectAll}
                    aria-label="selecionar todos"
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'nome'}
                    direction={orderBy === 'nome' ? order : 'asc'}
                    onClick={() => handleRequestSort('nome')}
                  >
                    Nome
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleRequestSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'departamento'}
                    direction={orderBy === 'departamento' ? order : 'asc'}
                    onClick={() => handleRequestSort('departamento')}
                  >
                    Departamento
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleRequestSort('status')}
                  >
                    Status
                  </TableSortLabel>
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
                  </TableRow>
                ))
              ) : colaboradores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ borderBottom: 'none', p: 0, verticalAlign: 'top' }}>
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
                        onChange={() => toggleRow(row.id)}
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </AppCard>
    </Box>
  );
}
