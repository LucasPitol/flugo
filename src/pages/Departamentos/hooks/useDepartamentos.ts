import { useEffect, useState, useCallback } from 'react';
import {
  listarDepartamentos,
  deleteDepartamento,
  toUserMessage,
} from '../../../services/departamentosService';
import { listarColaboradores } from '../../../services/colaboradoresService';
import type { Departamento } from '../../../services/departamentos/types';

export function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [departamentoToDelete, setDepartamentoToDelete] = useState<Departamento | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [gestorNames, setGestorNames] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [deptList, colabList] = await Promise.all([
        listarDepartamentos(),
        listarColaboradores(),
      ]);
      setDepartamentos(deptList);
      const names: Record<string, string> = {};
      colabList.forEach((c) => {
        names[c.id] = c.nome;
      });
      setGestorNames(names);
    } catch (e) {
      setToastMessage(toUserMessage(e));
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openConfirmDelete = useCallback((dep: Departamento) => {
    setDepartamentoToDelete(dep);
    setConfirmDeleteOpen(true);
  }, []);

  const closeConfirmDelete = useCallback(() => {
    if (!deleting) {
      setConfirmDeleteOpen(false);
      setDepartamentoToDelete(null);
    }
  }, [deleting]);

  const handleDelete = useCallback(async () => {
    if (!departamentoToDelete) return;
    const hasColaboradores = departamentoToDelete.colaboradoresIds.length > 0;
    if (hasColaboradores) {
      setConfirmDeleteOpen(false);
      setDepartamentoToDelete(null);
      setToastMessage(
        'Não é possível excluir: o departamento ainda possui colaboradores. Transfira ou remova os colaboradores antes de excluir.'
      );
      setToastOpen(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteDepartamento(departamentoToDelete.id);
      setDepartamentos((prev) => prev.filter((d) => d.id !== departamentoToDelete.id));
      setConfirmDeleteOpen(false);
      setDepartamentoToDelete(null);
      setToastMessage('Departamento excluído com sucesso.');
      setToastOpen(true);
    } catch (e) {
      setToastMessage(toUserMessage(e));
      setToastOpen(true);
    } finally {
      setDeleting(false);
    }
  }, [departamentoToDelete]);

  const canDelete = departamentoToDelete
    ? departamentoToDelete.colaboradoresIds.length === 0
    : false;

  return {
    departamentos,
    loading,
    toastOpen,
    setToastOpen,
    toastMessage,
    gestorNames,
    confirmDeleteOpen,
    departamentoToDelete,
    deleting,
    canDelete,
    openConfirmDelete,
    closeConfirmDelete,
    handleDelete,
    load,
  };
}
