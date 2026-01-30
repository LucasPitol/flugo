import { createColaboradoresGateway } from '../../back-end/interface/ColaboradoresGateway';
import type {
  ColaboradorDTO,
  CriarColaboradorDTO,
  AtualizarColaboradorDTO,
} from '../../back-end/domain/types/ColaboradorDTO';
import type {
  Colaborador,
  CreateColaboradorInput,
  UpdateColaboradorInput,
} from './colaboradores/types';
import { RepositoryError } from '../../back-end/data/errors/RepositoryError';

function toColaborador(dto: ColaboradorDTO): Colaborador {
  return { ...dto };
}

function toCriarDTO(input: CreateColaboradorInput): CriarColaboradorDTO {
  return { ...input };
}

function toAtualizarDTO(input: UpdateColaboradorInput): AtualizarColaboradorDTO {
  return { ...input };
}

const gateway = createColaboradoresGateway();

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

export async function listarColaboradores(): Promise<Colaborador[]> {
  const timeoutMsg =
    'Tempo esgotado ao carregar os colaboradores.' + FIREBASE_ENV_HINT;
  const list = await withTimeout(gateway.listar(), LIST_TIMEOUT_MS, timeoutMsg);
  return list.map(toColaborador);
}

export async function criarColaborador(input: CreateColaboradorInput): Promise<Colaborador> {
  const timeoutMsg =
    'Tempo esgotado ao salvar.' + FIREBASE_ENV_HINT;
  const dto = toCriarDTO(input);
  const result = await withTimeout(gateway.criar(dto), CREATE_TIMEOUT_MS, timeoutMsg);
  return toColaborador(result);
}

export async function updateColaborador(
  id: string,
  input: UpdateColaboradorInput
): Promise<Colaborador> {
  const timeoutMsg =
    'Tempo esgotado ao atualizar.' + FIREBASE_ENV_HINT;
  const dto = toAtualizarDTO(input);
  const result = await withTimeout(gateway.editar(id, dto), MUTATION_TIMEOUT_MS, timeoutMsg);
  return toColaborador(result);
}

export async function deleteColaborador(id: string): Promise<void> {
  const timeoutMsg =
    'Tempo esgotado ao excluir.' + FIREBASE_ENV_HINT;
  return withTimeout(gateway.excluir(id), MUTATION_TIMEOUT_MS, timeoutMsg);
}

export async function bulkDeleteColaboradores(ids: string[]): Promise<void> {
  const timeoutMsg =
    'Tempo esgotado ao excluir em massa.' + FIREBASE_ENV_HINT;
  return withTimeout(gateway.excluirEmMassa(ids), MUTATION_TIMEOUT_MS, timeoutMsg);
}

export { toUserMessage };
