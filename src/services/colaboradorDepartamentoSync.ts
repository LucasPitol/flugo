/**
 * Sincronização bidirecional colaborador ↔ departamentos.
 * Ao trocar o departamento de um colaborador na edição:
 * - Remove o vínculo no departamento antigo (colaboradoresIds).
 * - Adiciona o vínculo no novo departamento (colaboradoresIds).
 * - Atualiza o colaborador (campo departamento).
 * Evita dependência circular entre colaboradoresService e departamentosService.
 */

import { listarDepartamentos, updateDepartamento } from './departamentosService';
import { updateColaborador } from './colaboradoresService';
import type { UpdateColaboradorInput } from './colaboradores/types';

/**
 * Atualiza o colaborador e mantém consistência bidirecional com departamentos:
 * - Se o departamento não mudou, apenas atualiza o colaborador.
 * - Se mudou: atualiza vínculo no dept antigo (remove id), no novo (adiciona id) e o colaborador.
 */
export async function updateColaboradorESincronizarDepartamentos(
  id: string,
  input: UpdateColaboradorInput,
  departamentoAnterior: string
): Promise<void> {
  const novoDepartamento = input.departamento.trim();
  if (novoDepartamento === (departamentoAnterior ?? '').trim()) {
    await updateColaborador(id, input);
    return;
  }

  const deptList = await listarDepartamentos();
  const oldDept = deptList.find((d) => d.nome === departamentoAnterior);
  const newDept = deptList.find((d) => d.nome === novoDepartamento);
  if (!newDept) {
    throw new Error(
      `Departamento "${novoDepartamento}" não encontrado. Selecione um departamento cadastrado.`
    );
  }

  const previousOldDept =
    oldDept != null
      ? { deptId: oldDept.id, previousIds: oldDept.colaboradoresIds }
      : null;
  const previousNewDept = {
    deptId: newDept.id,
    previousIds: newDept.colaboradoresIds,
  };

  try {
    if (oldDept) {
      const newIdsOld = oldDept.colaboradoresIds.filter((cid) => cid !== id);
      await updateDepartamento(oldDept.id, { colaboradoresIds: newIdsOld });
    }
    const newIdsNew = previousNewDept.previousIds.includes(id)
      ? previousNewDept.previousIds
      : [...previousNewDept.previousIds, id];
    await updateDepartamento(newDept.id, { colaboradoresIds: newIdsNew });
    await updateColaborador(id, input);
  } catch (err) {
    if (oldDept && previousOldDept) {
      await updateDepartamento(previousOldDept.deptId, {
        colaboradoresIds: previousOldDept.previousIds,
      }).catch(() => {});
    }
    await updateDepartamento(previousNewDept.deptId, {
      colaboradoresIds: previousNewDept.previousIds,
    }).catch(() => {});
    throw err;
  }
}
