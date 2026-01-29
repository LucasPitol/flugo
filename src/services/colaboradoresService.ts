import { createColaboradoresGateway } from '../../back-end/interface/ColaboradoresGateway';
import type { ColaboradorDTO, CriarColaboradorDTO } from '../../back-end/domain/types/ColaboradorDTO';
import { RepositoryError } from '../../back-end/data/errors/RepositoryError';

const gateway = createColaboradoresGateway();

const LIST_TIMEOUT_MS = 15_000;
const CREATE_TIMEOUT_MS = 15_000;

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

export async function listarColaboradores(): Promise<ColaboradorDTO[]> {
  const timeoutMsg =
    'Tempo esgotado ao carregar os colaboradores.' + FIREBASE_ENV_HINT;
  return withTimeout(gateway.listar(), LIST_TIMEOUT_MS, timeoutMsg);
}

export async function criarColaborador(dto: CriarColaboradorDTO): Promise<ColaboradorDTO> {
  const timeoutMsg =
    'Tempo esgotado ao salvar.' + FIREBASE_ENV_HINT;
  return withTimeout(gateway.criar(dto), CREATE_TIMEOUT_MS, timeoutMsg);
}

export { toUserMessage };
