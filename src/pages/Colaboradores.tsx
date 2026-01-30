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
  Drawer,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import {
  listarColaboradores,
  bulkDeleteColaboradores,
  updateColaborador,
  toUserMessage,
} from '../services/colaboradoresService';
import type { ColaboradorDTO, AtualizarColaboradorDTO } from '../../back-end/domain/types/ColaboradorDTO';
import { colors, typography, states } from '../theme';

const DEPARTAMENTOS = ['Design', 'TI', 'Marketing', 'Produto', 'RH', 'Financeiro'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
  const [editingColaborador, setEditingColaborador] = useState<ColaboradorDTO | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartamento, setEditDepartamento] = useState('');
  const [editStatus, setEditStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [editErrors, setEditErrors] = useState<{ nome?: string; email?: string; departamento?: string }>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editToastOpen, setEditToastOpen] = useState(false);
  const [editToastMessage, setEditToastMessage] = useState('');

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

  useEffect(() => {
    if (editingColaborador) {
      setEditNome(editingColaborador.nome);
      setEditEmail(editingColaborador.email);
      setEditDepartamento(editingColaborador.departamento);
      setEditStatus(editingColaborador.status);
      setEditErrors({});
    }
  }, [editingColaborador]);

  const openEdit = useCallback((row: ColaboradorDTO) => {
    setEditingColaborador(row);
  }, []);

  const closeEdit = useCallback(() => {
    if (!editSubmitting) setEditingColaborador(null);
  }, [editSubmitting]);

  const validateEdit = useCallback((): boolean => {
    const next: { nome?: string; email?: string; departamento?: string } = {};
    if (!editNome.trim()) next.nome = 'Nome é obrigatório';
    if (!editEmail.trim()) next.email = 'E-mail é obrigatório';
    else if (!EMAIL_REGEX.test(editEmail.trim())) next.email = 'E-mail inválido';
    if (!editDepartamento) next.departamento = 'Departamento é obrigatório';
    setEditErrors(next);
    return Object.keys(next).length === 0;
  }, [editNome, editEmail, editDepartamento]);

  const handleEditSubmit = useCallback(() => {
    if (!editingColaborador || !validateEdit()) return;
    const dto: AtualizarColaboradorDTO = {
      nome: editNome.trim(),
      email: editEmail.trim(),
      departamento: editDepartamento,
      status: editStatus,
    };
    setEditSubmitting(true);
    updateColaborador(editingColaborador.id, dto)
      .then(() => {
        load();
        setEditingColaborador(null);
        setEditToastMessage('Colaborador atualizado.');
        setEditToastOpen(true);
      })
      .catch((err) => {
        setEditToastMessage(toUserMessage(err));
        setEditToastOpen(true);
      })
      .finally(() => setEditSubmitting(false));
  }, [editingColaborador, editNome, editEmail, editDepartamento, editStatus, validateEdit, load]);

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

      <AppSnackbar
        open={editToastOpen}
        onClose={() => setEditToastOpen(false)}
        message={editToastMessage}
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

      <Drawer
        anchor="right"
        open={!!editingColaborador}
        onClose={closeEdit}
        slotProps={{
          paper: { sx: { width: { xs: '100%', sm: 420 } } },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Editar colaborador
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
            <TextField
              label="Nome"
              value={editNome}
              onChange={(e) => {
                setEditNome(e.target.value);
                if (editErrors.nome) setEditErrors((p) => ({ ...p, nome: undefined }));
              }}
              fullWidth
              variant="outlined"
              required
              error={!!editErrors.nome}
              helperText={editErrors.nome}
            />
            <TextField
              label="E-mail"
              placeholder="e.g. john@gmail.com"
              value={editEmail}
              onChange={(e) => {
                setEditEmail(e.target.value);
                if (editErrors.email) setEditErrors((p) => ({ ...p, email: undefined }));
              }}
              fullWidth
              variant="outlined"
              type="email"
              required
              error={!!editErrors.email}
              helperText={editErrors.email}
            />
            <FormControl
              fullWidth
              variant="outlined"
              required
              error={!!editErrors.departamento}
            >
              <InputLabel id="edit-departamento-label" shrink>
                Departamento
              </InputLabel>
              <Select
                labelId="edit-departamento-label"
                value={editDepartamento}
                label="Departamento"
                onChange={(e) => {
                  setEditDepartamento(e.target.value);
                  if (editErrors.departamento) setEditErrors((p) => ({ ...p, departamento: undefined }));
                }}
                displayEmpty
                renderValue={(v) => (v as string) || 'Selecione um departamento'}
                sx={{
                  bgcolor: states.input.backgroundMuted,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: states.input.borderDefault },
                }}
              >
                {DEPARTAMENTOS.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
              {editErrors.departamento && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                  {editErrors.departamento}
                </Typography>
              )}
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={editStatus === 'Ativo'}
                  onChange={(e) => setEditStatus(e.target.checked ? 'Ativo' : 'Inativo')}
                />
              }
              label="Ativo"
              sx={{ '& .MuiFormControlLabel-label': { color: colors.neutral.text } }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 3 }}>
            <AppButton variant="text" onClick={closeEdit} disabled={editSubmitting}>
              Cancelar
            </AppButton>
            <AppButton variant="contained" onClick={handleEditSubmit} loading={editSubmitting}>
              Salvar
            </AppButton>
          </Box>
        </Box>
      </Drawer>

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
              ) : colaboradores.length === 0 ? (
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
                    <TableCell align="right" sx={{ py: 2 }}>
                      <AppButton
                        variant="text"
                        size="small"
                        onClick={() => openEdit(row)}
                      >
                        Editar
                      </AppButton>
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
