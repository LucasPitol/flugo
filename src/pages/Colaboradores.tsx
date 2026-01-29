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
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import { listarColaboradores } from '../services/colaboradoresService';
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

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <PageHeader
        title="Colaboradores"
        action={
          <AppButton variant="contained" onClick={() => navigate('/colaboradores/novo')}>
            Novo Colaborador
          </AppButton>
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

      <AppCard sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
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
                  <TableCell colSpan={4} sx={{ borderBottom: 'none', p: 0, verticalAlign: 'top' }}>
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
