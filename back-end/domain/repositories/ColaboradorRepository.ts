import type { ColaboradorDTO, CriarColaboradorDTO } from '../types/ColaboradorDTO';

export interface ColaboradorRepository {
  listar(): Promise<ColaboradorDTO[]>;
  criar(dto: CriarColaboradorDTO): Promise<ColaboradorDTO>;
}
