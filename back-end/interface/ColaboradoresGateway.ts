import type { ColaboradorDTO, CriarColaboradorDTO } from '../domain/types/ColaboradorDTO';
import type { ColaboradorRepository } from '../domain/repositories/ColaboradorRepository';
import { colaboradorRepositoryFirestore } from '../data/firebase/colaborador.collection';

export interface ColaboradoresGateway {
  listar(): Promise<ColaboradorDTO[]>;
  criar(dto: CriarColaboradorDTO): Promise<ColaboradorDTO>;
}

class ColaboradoresGatewayImpl implements ColaboradoresGateway {
  constructor(private readonly repository: ColaboradorRepository) {}

  async listar(): Promise<ColaboradorDTO[]> {
    return this.repository.listar();
  }

  async criar(dto: CriarColaboradorDTO): Promise<ColaboradorDTO> {
    return this.repository.criar(dto);
  }
}

export function createColaboradoresGateway(
  repository: ColaboradorRepository = colaboradorRepositoryFirestore
): ColaboradoresGateway {
  return new ColaboradoresGatewayImpl(repository);
}
