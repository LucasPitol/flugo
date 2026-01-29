import type { ColaboradorDTO, CriarColaboradorDTO } from '../../domain/types/ColaboradorDTO';
import type { ColaboradorRepository } from '../../domain/repositories/ColaboradorRepository';

const MOCK_COLABORADORES: ColaboradorDTO[] = [
  {
    id: '1',
    nome: 'Fernanda Torres',
    email: 'fernandatorres@flugo.com',
    departamento: 'Design',
    status: 'Ativo',
    iniciais: 'FT',
  },
  {
    id: '2',
    nome: "Joana D'Arc",
    email: 'joanadarc@flugo.com',
    departamento: 'TI',
    status: 'Ativo',
    iniciais: 'JD',
  },
  {
    id: '3',
    nome: 'Mari Froes',
    email: 'marifroes@flugo.com',
    departamento: 'Marketing',
    status: 'Ativo',
    iniciais: 'MF',
  },
  {
    id: '4',
    nome: 'Clara Costa',
    email: 'claracosta@flugo.com',
    departamento: 'Produto',
    status: 'Inativo',
    iniciais: 'CC',
  },
];

function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '??';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

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
    const iniciais = obterIniciais(dto.nome);
    const novo: ColaboradorDTO = {
      id,
      nome: dto.nome,
      email: dto.email,
      departamento: dto.departamento,
      status: dto.status,
      iniciais,
    };
    this.dados.push(novo);
    return { ...novo };
  }
}

export const colaboradorRepositoryMock = new ColaboradorRepositoryMock();
