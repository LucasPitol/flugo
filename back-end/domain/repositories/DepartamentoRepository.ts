import type {
  DepartamentoDTO,
  CriarDepartamentoDTO,
  AtualizarDepartamentoDTO,
} from '../types/DepartamentoDTO';

export interface DepartamentoRepository {
  listar(): Promise<DepartamentoDTO[]>;
  criar(dto: CriarDepartamentoDTO): Promise<DepartamentoDTO>;
  atualizar(id: string, dto: AtualizarDepartamentoDTO): Promise<DepartamentoDTO>;
  remover(id: string): Promise<void>;
}
