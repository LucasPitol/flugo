import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  listarColaboradores,
  bulkDeleteColaboradores,
  updateColaborador,
  deleteColaborador,
  toUserMessage,
} from '../../../services/colaboradoresService';
import type { ColaboradorDTO, AtualizarColaboradorDTO } from '../../../../back-end/domain/types/ColaboradorDTO';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type OrderByKey = 'nome' | 'email' | 'departamento' | 'status';

function compare(a: ColaboradorDTO, b: ColaboradorDTO, orderBy: OrderByKey): number {
  const va = a[orderBy];
  const vb = b[orderBy];
  if (va < vb) return -1;
  if (va > vb) return 1;
  return 0;
}

export function useColaboradores() {
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
  const [confirmSingleDeleteOpen, setConfirmSingleDeleteOpen] = useState(false);
  const [deletingSingle, setDeletingSingle] = useState(false);

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

  const openConfirmSingleDelete = useCallback(() => {
    setConfirmSingleDeleteOpen(true);
  }, []);

  const closeConfirmSingleDelete = useCallback(() => {
    if (!deletingSingle) setConfirmSingleDeleteOpen(false);
  }, [deletingSingle]);

  const handleSingleDelete = useCallback(() => {
    if (!editingColaborador) return;
    setDeletingSingle(true);
    deleteColaborador(editingColaborador.id)
      .then(() => {
        setConfirmSingleDeleteOpen(false);
        setEditingColaborador(null);
        load();
        setEditToastMessage('Colaborador excluído.');
        setEditToastOpen(true);
      })
      .catch((err) => {
        setConfirmSingleDeleteOpen(false);
        setEditToastMessage(toUserMessage(err));
        setEditToastOpen(true);
      })
      .finally(() => setDeletingSingle(false));
  }, [editingColaborador, load]);

  return {
    // Lista e carregamento
    colaboradores,
    loading,
    sortedColaboradores,
    load,
    toastOpen,
    setToastOpen,

    // Ordenação
    orderBy,
    order,
    handleRequestSort,

    // Seleção e exclusão em massa
    selectedIds,
    setSelectedIds,
    toggleRow,
    toggleSelectAll,
    confirmOpen,
    setConfirmOpen,
    deleting,
    handleBulkDelete,
    toastBulkOpen,
    setToastBulkOpen,
    toastBulkMessage,

    // Edição (drawer)
    editingColaborador,
    openEdit,
    closeEdit,
    editNome,
    setEditNome,
    editEmail,
    setEditEmail,
    editDepartamento,
    setEditDepartamento,
    editStatus,
    setEditStatus,
    editErrors,
    setEditErrors,
    editSubmitting,
    handleEditSubmit,

    // Exclusão única (no drawer)
    confirmSingleDeleteOpen,
    openConfirmSingleDelete,
    closeConfirmSingleDelete,
    deletingSingle,
    handleSingleDelete,
    editToastOpen,
    setEditToastOpen,
    editToastMessage,
  };
}
