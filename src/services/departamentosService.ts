import { createDepartamentosGateway } from '../../back-end/interface/DepartamentosGateway';
import type {
  DepartamentoDTO,
  CriarDepartamentoDTO,
  AtualizarDepartamentoDTO,
} from '../../back-end/domain/types/DepartamentoDTO';
import type {
  Departamento,
  CreateDepartamentoInput,
  UpdateDepartamentoInput,
} from './departamentos/types';
import type { Colaborador } from './colaboradores/types';
import { updateColaborador } from './colaboradoresService';
import { RepositoryError } from '../../back-end/data/errors/RepositoryError';

function toDepartamento(dto: DepartamentoDTO): Departamento {
  return { ...dto };
}

function toCriarDTO(input: CreateDepartamentoInput): CriarDepartamentoDTO {
  return {
    nome: input.nome,
    gestorResponsavelId: input.gestorResponsavelId,
    colaboradoresIds: input.colaboradoresIds ?? [],
    ...(input.descricao !== undefined && { descricao: input.descricao }),
    ...(input.sigla !== undefined && { sigla: input.sigla }),
  };
}

function toAtualizarDTO(input: UpdateDepartamentoInput): AtualizarDepartamentoDTO {
  return {
    ...(input.nome !== undefined && { nome: input.nome }),
    ...(input.gestorResponsavelId !== undefined && { gestorResponsavelId: input.gestorResponsavelId }),
    ...(input.colaboradoresIds !== undefined && { colaboradoresIds: input.colaboradoresIds }),
    ...(input.descricao !== undefined && { descricao: input.descricao }),
    ...(input.sigla !== undefined && { sigla: input.sigla }),
  };
}

const gateway = createDepartamentosGateway();

const LIST_TIMEOUT_MS = 15_000;
const CREATE_TIMEOUT_MS = 15_000;
const MUTATION_TIMEOUT_MS = 15_000;

const FIREBASE_ENV_HINT =
  ' Verifique se as variáveis de ambiente do Firebase (VITE_FIREBASE_*) estão configuradas no servidor (ex.: painel da Vercel).';

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

function toUserMessage(err: unknown): string {
  if (err instanceof RepositoryError) {
    return err.message + FIREBASE_ENV_HINT;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

export async function listarDepartamentos(): Promise<Departamento[]> {
  const timeoutMsg =
    'Tempo esgotado ao carregar os departamentos.' + FIREBASE_ENV_HINT;
  const list = await withTimeout(
    gateway.listar(),
    LIST_TIMEOUT_MS,
    timeoutMsg
  );
  return list.map(toDepartamento);
}

export async function criarDepartamento(input: CreateDepartamentoInput): Promise<Departamento> {
  const timeoutMsg =
    'Tempo esgotado ao salvar departamento.' + FIREBASE_ENV_HINT;
  const dto = toCriarDTO(input);
  const result = await withTimeout(gateway.criar(dto), CREATE_TIMEOUT_MS, timeoutMsg);
  return toDepartamento(result);
}

/**
 * Cria o departamento e atualiza o campo departamento dos colaboradores selecionados.
 * Remove automaticamente cada colaborador do departamento anterior (transferência).
 * Transação lógica: em caso de falha, reverte colaboradores e remoções nos depts anteriores
 * e exclui o departamento criado (rollback), impedindo estado inválido (colaborador sem departamento).
 */
export async function criarDepartamentoEAtualizarColaboradores(
  input: CreateDepartamentoInput,
  colaboradoresSelecionados: Colaborador[]
): Promise<Departamento> {
  const newDept = await criarDepartamento(input);
  const idsToUpdate = new Set(input.colaboradoresIds ?? []);
  const toUpdate = colaboradoresSelecionados.filter((c) => idsToUpdate.has(c.id));
  if (toUpdate.length === 0) return newDept;

  const updated: Colaborador[] = [];
  try {
    for (const c of toUpdate) {
      await updateColaborador(c.id, {
        nome: c.nome,
        email: c.email,
        departamento: newDept.nome,
        status: c.status,
        cargo: c.cargo,
        dataAdmissao: c.dataAdmissao,
        nivelHierarquico: c.nivelHierarquico,
        gestorId: c.gestorId,
        salarioBase: c.salarioBase,
      });
      updated.push(c);
    }
    const deptList = await listarDepartamentos();
    const addedIdsSet = new Set(toUpdate.map((c) => c.id));
    const previousDeptUpdates: { deptId: string; previousIds: string[] }[] = [];
    try {
      for (const prevDept of deptList) {
        if (prevDept.id === newDept.id) continue;
        const idsToRemove = toUpdate
          .filter((c) => c.departamento === prevDept.nome)
          .map((c) => c.id);
        if (idsToRemove.length === 0) continue;
        const newIds = prevDept.colaboradoresIds.filter(
          (cid) => !addedIdsSet.has(cid)
        );
        if (newIds.length === prevDept.colaboradoresIds.length) continue;
        previousDeptUpdates.push({
          deptId: prevDept.id,
          previousIds: prevDept.colaboradoresIds,
        });
        await updateDepartamento(prevDept.id, { colaboradoresIds: newIds });
      }
    } catch (removeErr) {
      for (const { deptId, previousIds } of previousDeptUpdates) {
        await updateDepartamento(deptId, { colaboradoresIds: previousIds }).catch(
          () => {}
        );
      }
      throw removeErr;
    }
    return newDept;
  } catch (err) {
    for (const c of updated) {
      await updateColaborador(c.id, {
        nome: c.nome,
        email: c.email,
        departamento: c.departamento,
        status: c.status,
        cargo: c.cargo,
        dataAdmissao: c.dataAdmissao,
        nivelHierarquico: c.nivelHierarquico,
        gestorId: c.gestorId,
        salarioBase: c.salarioBase,
      }).catch(() => {});
    }
    await deleteDepartamento(newDept.id).catch(() => {});
    throw err;
  }
}

export async function updateDepartamento(
  id: string,
  input: UpdateDepartamentoInput
): Promise<Departamento> {
  const timeoutMsg =
    'Tempo esgotado ao atualizar departamento.' + FIREBASE_ENV_HINT;
  const dto = toAtualizarDTO(input);
  const result = await withTimeout(gateway.editar(id, dto), MUTATION_TIMEOUT_MS, timeoutMsg);
  return toDepartamento(result);
}

/**
 * Atualiza o departamento e sincroniza o campo departamento dos colaboradores:
 * - Colaboradores adicionados: departamento = nome do departamento atualizado e removidos
 *   automaticamente do departamento anterior (transferência).
 * - Colaboradores removidos: transferidos para o departamento de destino informado.
 * Impede estado inválido: colaborador não pode existir sem departamento.
 */
export async function updateDepartamentoEAtualizarColaboradores(
  id: string,
  input: UpdateDepartamentoInput,
  departamentoAtual: Departamento,
  colaboradoresPorId: Map<string, Colaborador>,
  departamentoDestinoRemovidos: string,
  todosDepartamentos: Departamento[]
): Promise<Departamento> {
  const newIds = new Set(input.colaboradoresIds ?? departamentoAtual.colaboradoresIds);
  const oldIds = new Set(departamentoAtual.colaboradoresIds);
  const addedIds = [...newIds].filter((cid) => !oldIds.has(cid));
  const removedIds = [...oldIds].filter((cid) => !newIds.has(cid));

  if (removedIds.length > 0 && !departamentoDestinoRemovidos.trim()) {
    throw new Error(
      'Selecione o departamento de destino para os colaboradores removidos. Colaborador não pode ficar sem departamento.'
    );
  }

  const updated = await updateDepartamento(id, input);

  const toAdd = addedIds
    .map((cid) => colaboradoresPorId.get(cid))
    .filter((c): c is Colaborador => c != null);
  const toRemove = removedIds
    .map((cid) => colaboradoresPorId.get(cid))
    .filter((c): c is Colaborador => c != null);

  const previousDepartamentoByColabId = new Map<string, string>();
  toAdd.forEach((c) => previousDepartamentoByColabId.set(c.id, c.departamento));
  toRemove.forEach((c) => previousDepartamentoByColabId.set(c.id, departamentoAtual.nome));

  const updatedColaboradores: Colaborador[] = [];
  const previousDeptUpdates: { deptId: string; previousIds: string[] }[] = [];

  try {
    for (const c of toAdd) {
      await updateColaborador(c.id, {
        nome: c.nome,
        email: c.email,
        departamento: updated.nome,
        status: c.status,
        cargo: c.cargo,
        dataAdmissao: c.dataAdmissao,
        nivelHierarquico: c.nivelHierarquico,
        gestorId: c.gestorId,
        salarioBase: c.salarioBase,
      });
      updatedColaboradores.push(c);
    }
    const addedIdsSet = new Set(toAdd.map((c) => c.id));
    for (const prevDept of todosDepartamentos) {
      if (prevDept.id === id) continue;
      const toRemoveFromPrev = toAdd.filter(
        (c) => c.departamento === prevDept.nome
      );
      if (toRemoveFromPrev.length === 0) continue;
      const newIdsPrev = prevDept.colaboradoresIds.filter(
        (cid) => !addedIdsSet.has(cid)
      );
      if (newIdsPrev.length === prevDept.colaboradoresIds.length) continue;
      previousDeptUpdates.push({
        deptId: prevDept.id,
        previousIds: prevDept.colaboradoresIds,
      });
      await updateDepartamento(prevDept.id, { colaboradoresIds: newIdsPrev });
    }
    for (const c of toRemove) {
      await updateColaborador(c.id, {
        nome: c.nome,
        email: c.email,
        departamento: departamentoDestinoRemovidos,
        status: c.status,
        cargo: c.cargo,
        dataAdmissao: c.dataAdmissao,
        nivelHierarquico: c.nivelHierarquico,
        gestorId: c.gestorId,
        salarioBase: c.salarioBase,
      });
      updatedColaboradores.push(c);
    }
    return updated;
  } catch (err) {
    for (const { deptId, previousIds } of previousDeptUpdates) {
      await updateDepartamento(deptId, { colaboradoresIds: previousIds }).catch(
        () => {}
      );
    }
    for (const c of updatedColaboradores) {
      const restoreDept = previousDepartamentoByColabId.get(c.id) ?? c.departamento;
      await updateColaborador(c.id, {
        nome: c.nome,
        email: c.email,
        departamento: restoreDept,
        status: c.status,
        cargo: c.cargo,
        dataAdmissao: c.dataAdmissao,
        nivelHierarquico: c.nivelHierarquico,
        gestorId: c.gestorId,
        salarioBase: c.salarioBase,
      }).catch(() => {});
    }
    await updateDepartamento(id, {
      nome: departamentoAtual.nome,
      gestorResponsavelId: departamentoAtual.gestorResponsavelId,
      colaboradoresIds: departamentoAtual.colaboradoresIds,
    }).catch(() => {});
    throw err;
  }
}

export async function deleteDepartamento(id: string): Promise<void> {
  const timeoutMsg =
    'Tempo esgotado ao excluir departamento.' + FIREBASE_ENV_HINT;
  return withTimeout(gateway.excluir(id), MUTATION_TIMEOUT_MS, timeoutMsg);
}

export { toUserMessage };
