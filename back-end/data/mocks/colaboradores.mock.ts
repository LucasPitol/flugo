import type {
  ColaboradorDTO,
  CriarColaboradorDTO,
  AtualizarColaboradorDTO,
} from '../../domain/types/ColaboradorDTO';
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

  async atualizar(id: string, dto: AtualizarColaboradorDTO): Promise<ColaboradorDTO> {
    const idx = this.dados.findIndex((c) => c.id === id);
    if (idx === -1) {
      throw new Error(`Colaborador não encontrado: ${id}`);
    }
    const atual = this.dados[idx];
    const atualizado: ColaboradorDTO = {
      ...atual,
      ...(dto.nome !== undefined && { nome: dto.nome }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.departamento !== undefined && { departamento: dto.departamento }),
      ...(dto.status !== undefined && { status: dto.status }),
    };
    this.dados[idx] = atualizado;
    return { ...atualizado };
  }

  async remover(id: string): Promise<void> {
    this.dados = this.dados.filter((c) => c.id !== id);
  }

  async removerEmMassa(ids: string[]): Promise<void> {
    const set = new Set(ids);
    this.dados = this.dados.filter((c) => !set.has(c.id));
  }
}

export const colaboradorRepositoryMock = new ColaboradorRepositoryMock();
