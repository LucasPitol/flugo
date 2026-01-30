import type {
  DepartamentoDTO,
  CriarDepartamentoDTO,
  AtualizarDepartamentoDTO,
} from '../domain/types/DepartamentoDTO';
import type { DepartamentoRepository } from '../domain/repositories/DepartamentoRepository';
import { departamentoRepositoryFirestore } from '../data/firebase/departamento.collection';

export interface DepartamentosGateway {
  listar(): Promise<DepartamentoDTO[]>;
  criar(dto: CriarDepartamentoDTO): Promise<DepartamentoDTO>;
  editar(id: string, dto: AtualizarDepartamentoDTO): Promise<DepartamentoDTO>;
  excluir(id: string): Promise<void>;
}

class DepartamentosGatewayImpl implements DepartamentosGateway {
  constructor(private readonly repository: DepartamentoRepository) {}

  async listar(): Promise<DepartamentoDTO[]> {
    return this.repository.listar();
  }

  async criar(dto: CriarDepartamentoDTO): Promise<DepartamentoDTO> {
    return this.repository.criar(dto);
  }

  async editar(id: string, dto: AtualizarDepartamentoDTO): Promise<DepartamentoDTO> {
    return this.repository.atualizar(id, dto);
  }

  async excluir(id: string): Promise<void> {
    return this.repository.remover(id);
  }
}

export function createDepartamentosGateway(
  repository: DepartamentoRepository = departamentoRepositoryFirestore
): DepartamentosGateway {
  return new DepartamentosGatewayImpl(repository);
}
