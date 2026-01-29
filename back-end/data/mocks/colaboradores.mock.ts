import type { ColaboradorDTO, CriarColaboradorDTO } from '../../domain/types/ColaboradorDTO';
import type { ColaboradorRepository } from '../../domain/repositories/ColaboradorRepository';

const MOCK_COLABORADORES: ColaboradorDTO[] = [
  {
    id: '1',
    nome: 'Fernanda Torres',
    email: 'fernandatorres@flugo.com',
    departamento: 'Design',
    status: 'Ativo',
  },
  {
    id: '2',
    nome: "Joana D'Arc",
    email: 'joanadarc@flugo.com',
    departamento: 'TI',
    status: 'Ativo',
  },
  {
    id: '3',
    nome: 'Mari Froes',
    email: 'marifroes@flugo.com',
    departamento: 'Marketing',
    status: 'Ativo',
  },
  {
    id: '4',
    nome: 'Clara Costa',
    email: 'claracosta@flugo.com',
    departamento: 'Produto',
    status: 'Inativo',
  },
];

function proximoId(itens: ColaboradorDTO[]): string {
  const ids = itens.map((c) => parseInt(c.id, 10)).filter((n) => !Number.isNaN(n));
  const max = ids.length ? Math.max(...ids) : 0;
  return String(max + 1);
}

export class ColaboradorRepositoryMock implements ColaboradorRepository {
  private dados: ColaboradorDTO[] = [...MOCK_COLABORADORES];

  async listar(): Promise<ColaboradorDTO[]> {
    return [...this.dados];
  }

  async criar(dto: CriarColaboradorDTO): Promise<ColaboradorDTO> {
    const id = proximoId(this.dados);
    const novo: ColaboradorDTO = {
      id,
      nome: dto.nome,
      email: dto.email,
      departamento: dto.departamento,
      status: dto.status,
    };
    this.dados.push(novo);
    return { ...novo };
  }
}

export const colaboradorRepositoryMock = new ColaboradorRepositoryMock();
