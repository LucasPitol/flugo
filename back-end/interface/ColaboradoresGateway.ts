import type {
  ColaboradorDTO,
  CriarColaboradorDTO,
  AtualizarColaboradorDTO,
} from '../domain/types/ColaboradorDTO';
import type { ColaboradorRepository } from '../domain/repositories/ColaboradorRepository';
import { colaboradorRepositoryFirestore } from '../data/firebase/colaborador.collection';

export interface ColaboradoresGateway {
  listar(): Promise<ColaboradorDTO[]>;
  criar(dto: CriarColaboradorDTO): Promise<ColaboradorDTO>;
  editar(id: string, dto: AtualizarColaboradorDTO): Promise<ColaboradorDTO>;
  excluir(id: string): Promise<void>;
  excluirEmMassa(ids: string[]): Promise<void>;
}

class ColaboradoresGatewayImpl implements ColaboradoresGateway {
  constructor(private readonly repository: ColaboradorRepository) {}

  async listar(): Promise<ColaboradorDTO[]> {
    return this.repository.listar();
  }

  async criar(dto: CriarColaboradorDTO): Promise<ColaboradorDTO> {
    return this.repository.criar(dto);
  }

  async editar(id: string, dto: AtualizarColaboradorDTO): Promise<ColaboradorDTO> {
    return this.repository.atualizar(id, dto);
  }

  async excluir(id: string): Promise<void> {
    return this.repository.remover(id);
  }

  async excluirEmMassa(ids: string[]): Promise<void> {
    return this.repository.removerEmMassa(ids);
  }
}

export function createColaboradoresGateway(
  repository: ColaboradorRepository = colaboradorRepositoryFirestore
): ColaboradoresGateway {
  return new ColaboradoresGatewayImpl(repository);
}
