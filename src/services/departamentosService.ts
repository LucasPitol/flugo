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
 * Transação lógica: em caso de falha ao atualizar algum colaborador, reverte os já
 * atualizados para o departamento original e exclui o departamento criado (rollback),
 * garantindo que nenhum colaborador fique sem departamento ou referenciando departamento inexistente.
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

export async function deleteDepartamento(id: string): Promise<void> {
  const timeoutMsg =
    'Tempo esgotado ao excluir departamento.' + FIREBASE_ENV_HINT;
  return withTimeout(gateway.excluir(id), MUTATION_TIMEOUT_MS, timeoutMsg);
}

export { toUserMessage };
