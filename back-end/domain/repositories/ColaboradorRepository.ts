import type {
  ColaboradorDTO,
  CriarColaboradorDTO,
  AtualizarColaboradorDTO,
} from '../types/ColaboradorDTO';

export interface ColaboradorRepository {
  listar(): Promise<ColaboradorDTO[]>;
  criar(dto: CriarColaboradorDTO): Promise<ColaboradorDTO>;
  atualizar(id: string, dto: AtualizarColaboradorDTO): Promise<ColaboradorDTO>;
  remover(id: string): Promise<void>;
  removerEmMassa(ids: string[]): Promise<void>;
}
