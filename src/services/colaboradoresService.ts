import { createColaboradoresGateway } from '../../back-end/interface/ColaboradoresGateway';
import type { ColaboradorDTO, CriarColaboradorDTO } from '../../back-end/domain/types/ColaboradorDTO';

const gateway = createColaboradoresGateway();

export async function listarColaboradores(): Promise<ColaboradorDTO[]> {
  return gateway.listar();
}

export async function criarColaborador(dto: CriarColaboradorDTO): Promise<ColaboradorDTO> {
  return gateway.criar(dto);
}
