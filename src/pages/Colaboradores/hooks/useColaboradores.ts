import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  listarColaboradores,
  bulkDeleteColaboradores,
  updateColaborador,
  deleteColaborador,
  toUserMessage,
} from '../../../services/colaboradoresService';
import { updateColaboradorESincronizarDepartamentos } from '../../../services/colaboradorDepartamentoSync';
import { listarDepartamentos } from '../../../services/departamentosService';
import type { Departamento } from '../../../services/departamentos/types';
import type {
  Colaborador,
  UpdateColaboradorInput,
  ColaboradoresFilter,
} from '../../../services/colaboradores/types';
import {
  updateColaboradorSchema,
  getFieldErrors,
} from '../../../services/colaboradores/validation';
import { formatBrCurrency, parseBrCurrency } from '../../../utils/formatBr';

/**
 * Filtros híbridos (remoto + local):
 * - remoteFilters (department): enviado ao backend (Firestore where('departamento', '==', department)).
 *   Firestore indexa igualdade de forma eficiente; refetch só quando department muda.
 * - localFilters (name, email): aplicados no front sobre a lista já carregada (includes case-insensitive).
 *   Firestore não é bom para "contains" em texto (sem full-text search); filtrar localmente evita
 *   overfetch e mantém UX responsiva para MVP.
 */


export type OrderByKey = 'nome' | 'email' | 'departamento' | 'status';

function compare(a: Colaborador, b: Colaborador, orderBy: OrderByKey): number {
  const va = a[orderBy];
  const vb = b[orderBy];
  const sa = String(va ?? '').toLowerCase();
  const sb = String(vb ?? '').toLowerCase();
  return sa.localeCompare(sb, 'pt-BR');
}

/** Aplica apenas filtros locais (name, email). Department é filtrado no backend. */
function applyLocalFilters(
  list: Colaborador[],
  f: Pick<ColaboradoresFilter, 'name' | 'email'>
): Colaborador[] {
  const nameLower = (f.name?.trim() ?? '').toLowerCase();
  const emailLower = (f.email?.trim() ?? '').toLowerCase();
  if (nameLower === '' && emailLower === '') return list;
  return list.filter((c) => {
    if (nameLower && !c.nome.toLowerCase().includes(nameLower)) return false;
    if (emailLower && !c.email.toLowerCase().includes(emailLower)) return false;
    return true;
  });
}

export function useColaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [orderBy, setOrderBy] = useState<OrderByKey>('nome');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toastBulkOpen, setToastBulkOpen] = useState(false);
  const [toastBulkMessage, setToastBulkMessage] = useState('');
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartamento, setEditDepartamento] = useState('');
  const [editStatus, setEditStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [editCargo, setEditCargo] = useState('');
  const [editDataAdmissao, setEditDataAdmissao] = useState('');
  const [editNivelHierarquico, setEditNivelHierarquico] = useState<string>('');
  const [editGestorId, setEditGestorId] = useState('');
  const [editSalarioBase, setEditSalarioBase] = useState<string>('');
  const [editErrors, setEditErrors] = useState<{
    nome?: string;
    email?: string;
    departamento?: string;
    cargo?: string;
    dataAdmissao?: string;
    nivelHierarquico?: string;
    gestorId?: string;
    salarioBase?: string;
  }>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editToastOpen, setEditToastOpen] = useState(false);
  const [editToastMessage, setEditToastMessage] = useState('');
  const [confirmSingleDeleteOpen, setConfirmSingleDeleteOpen] = useState(false);
  const [deletingSingle, setDeletingSingle] = useState(false);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [filters, setFilters] = useState<ColaboradoresFilter>({});
  const [appliedFilters, setAppliedFilters] = useState<ColaboradoresFilter>({});

  const onFilterChange = useCallback((next: Partial<ColaboradoresFilter>) => {
    setFilters((prev: ColaboradoresFilter) => ({ ...prev, ...next }));
  }, []);

  const onApplyFilters = useCallback(() => {
    setAppliedFilters(filters);
  }, [filters]);

  const onClearFilters = useCallback(() => {
    setFilters({});
    setAppliedFilters({});
  }, []);

  /** Sincroniza o rascunho do formulário com os filtros atualmente aplicados (ex.: ao abrir o drawer). */
  const syncFiltersFromApplied = useCallback(() => {
    setFilters(appliedFilters);
  }, [appliedFilters]);

  const handleRequestSort = useCallback((key: OrderByKey) => {
    const isAsc = orderBy === key && order === 'asc';
    setOrderBy(key);
    setOrder(isAsc ? 'desc' : 'asc');
  }, [orderBy, order]);

  const remoteFilters = useMemo(
    () => ({ department: appliedFilters.department }),
    [appliedFilters.department]
  );

  const localFilters = useMemo(
    () => ({ name: appliedFilters.name, email: appliedFilters.email }),
    [appliedFilters.name, appliedFilters.email]
  );

  const filteredColaboradores = useMemo(
    () => applyLocalFilters(colaboradores, localFilters),
    [colaboradores, localFilters]
  );

  const sortedColaboradores = useMemo(() => {
    const arr = [...filteredColaboradores];
    arr.sort((a, b) => {
      const cmp = compare(a, b, orderBy);
      return order === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredColaboradores, orderBy, order]);

  const gestores = useMemo(
    () => colaboradores.filter((c) => c.nivelHierarquico === 'gestor'),
    [colaboradores]
  );

  const gestoresForSelect = useMemo(() => {
    if (!editingColaborador) return gestores;
    return gestores.filter((g) => g.id !== editingColaborador.id);
  }, [gestores, editingColaborador]);

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
    listarColaboradores(remoteFilters)
      .then((data) => {
        setColaboradores(data);
      })
      .catch(() => {
        setColaboradores([]);
        setToastOpen(true);
      })
      .finally(() => setLoading(false));
  }, [remoteFilters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    listarDepartamentos()
      .then(setDepartamentos)
      .catch(() => setDepartamentos([]));
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
    if (editingColaborador) {
      setEditNome(editingColaborador.nome);
      setEditEmail(editingColaborador.email);
      setEditDepartamento(editingColaborador.departamento);
      setEditStatus(editingColaborador.status);
      setEditCargo(editingColaborador.cargo ?? '');
      setEditDataAdmissao(editingColaborador.dataAdmissao ?? '');
      setEditNivelHierarquico(editingColaborador.nivelHierarquico ?? '');
      setEditGestorId(editingColaborador.gestorId ?? '');
      setEditSalarioBase(
        editingColaborador.salarioBase != null ? formatBrCurrency(editingColaborador.salarioBase) : ''
      );
      setEditErrors({});
    }
  }, [editingColaborador]);

  /** Reseta o formulário de edição para os dados persistidos do colaborador (ex.: ao cancelar edição). */
  const resetEditFormToColaborador = useCallback(() => {
    if (!editingColaborador) return;
    setEditNome(editingColaborador.nome);
    setEditEmail(editingColaborador.email);
    setEditDepartamento(editingColaborador.departamento);
    setEditStatus(editingColaborador.status);
    setEditCargo(editingColaborador.cargo ?? '');
    setEditDataAdmissao(editingColaborador.dataAdmissao ?? '');
    setEditNivelHierarquico(editingColaborador.nivelHierarquico ?? '');
    setEditGestorId(editingColaborador.gestorId ?? '');
    setEditSalarioBase(
      editingColaborador.salarioBase != null ? formatBrCurrency(editingColaborador.salarioBase) : ''
    );
    setEditErrors({});
  }, [editingColaborador]);

  const openEdit = useCallback((row: Colaborador) => {
    setEditingColaborador(row);
  }, []);

  const closeEdit = useCallback(() => {
    if (!editSubmitting) setEditingColaborador(null);
  }, [editSubmitting]);

  const validateEdit = useCallback((): UpdateColaboradorInput | null => {
    const salarioNum = parseBrCurrency(editSalarioBase);
    const payload = {
      nome: editNome.trim(),
      email: editEmail.trim(),
      departamento: editDepartamento,
      status: editStatus,
      cargo: editCargo.trim(),
      dataAdmissao: editDataAdmissao.trim(),
      nivelHierarquico: editNivelHierarquico || undefined,
      gestorId: editGestorId.trim() || undefined,
      salarioBase: Number.isNaN(salarioNum) ? undefined : salarioNum,
    };
    const result = updateColaboradorSchema.safeParse(payload);
    if (!result.success) {
      setEditErrors(getFieldErrors(result));
      return null;
    }
    setEditErrors({});
    return result.data;
  }, [
    editNome,
    editEmail,
    editDepartamento,
    editStatus,
    editCargo,
    editDataAdmissao,
    editNivelHierarquico,
    editGestorId,
    editSalarioBase,
  ]);

  const handleEditSubmit = useCallback(() => {
    if (!editingColaborador) return;
    const input = validateEdit();
    if (!input) return;
    setEditSubmitting(true);
    const departamentoMudou =
      input.departamento.trim() !== (editingColaborador.departamento ?? '').trim();
    const save = departamentoMudou
      ? updateColaboradorESincronizarDepartamentos(
          editingColaborador.id,
          input,
          editingColaborador.departamento
        )
      : updateColaborador(editingColaborador.id, input);
    save
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
  }, [editingColaborador, validateEdit, load]);

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

    // Filtros
    filters,
    appliedFilters,
    onFilterChange,
    onApplyFilters,
    onClearFilters,
    syncFiltersFromApplied,

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
    departamentos,
    gestoresForSelect,
    gestoresLoading: loading,
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
    editCargo,
    setEditCargo,
    editDataAdmissao,
    setEditDataAdmissao,
    editNivelHierarquico,
    setEditNivelHierarquico,
    editGestorId,
    setEditGestorId,
    editSalarioBase,
    setEditSalarioBase,
    editErrors,
    setEditErrors,
    editSubmitting,
    handleEditSubmit,
    resetEditFormToColaborador,

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
