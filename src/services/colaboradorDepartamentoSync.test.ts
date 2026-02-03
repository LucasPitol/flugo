import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Departamento } from './departamentos/types';

const mockListarDepartamentos = vi.fn();
const mockUpdateDepartamento = vi.fn();
const mockUpdateColaborador = vi.fn();

vi.mock('./departamentosService', () => ({
  listarDepartamentos: (...args: unknown[]) => mockListarDepartamentos(...args),
  updateDepartamento: (...args: unknown[]) => mockUpdateDepartamento(...args),
}));

vi.mock('./colaboradoresService', () => ({
  updateColaborador: (...args: unknown[]) => mockUpdateColaborador(...args),
}));

const { updateColaboradorESincronizarDepartamentos } = await import(
  './colaboradorDepartamentoSync'
);

const inputBase = {
  nome: 'João',
  email: 'joao@empresa.com',
  departamento: 'Vendas',
  status: 'Ativo' as const,
  cargo: 'Analista',
  dataAdmissao: '2024-01-01',
  nivelHierarquico: 'pleno' as const,
  gestorId: 'g1',
  salarioBase: 3000,
};

function departamento(
  id: string,
  nome: string,
  colaboradoresIds: string[] = []
): Departamento {
  return {
    id,
    nome,
    gestorResponsavelId: '',
    colaboradoresIds,
  };
}

describe('updateColaboradorESincronizarDepartamentos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('quando departamento não mudou, apenas atualiza o colaborador', async () => {
    mockUpdateColaborador.mockResolvedValue(undefined);

    await updateColaboradorESincronizarDepartamentos(
      'colab-1',
      { ...inputBase, departamento: 'TI' },
      'TI'
    );

    expect(mockListarDepartamentos).not.toHaveBeenCalled();
    expect(mockUpdateDepartamento).not.toHaveBeenCalled();
    expect(mockUpdateColaborador).toHaveBeenCalledTimes(1);
    expect(mockUpdateColaborador).toHaveBeenCalledWith('colab-1', {
      ...inputBase,
      departamento: 'TI',
    });
  });

  it('troca de departamento: remove id do antigo e adiciona no novo', async () => {
    const oldDept = departamento('dept-ti', 'TI', ['colab-1', 'colab-2']);
    const newDept = departamento('dept-vendas', 'Vendas', []);
    mockListarDepartamentos.mockResolvedValue([oldDept, newDept]);
    mockUpdateDepartamento.mockResolvedValue(undefined);
    mockUpdateColaborador.mockResolvedValue(undefined);

    await updateColaboradorESincronizarDepartamentos(
      'colab-1',
      { ...inputBase, departamento: 'Vendas' },
      'TI'
    );

    expect(mockListarDepartamentos).toHaveBeenCalledTimes(1);
    expect(mockUpdateDepartamento).toHaveBeenCalledTimes(2);
    expect(mockUpdateDepartamento).toHaveBeenNthCalledWith(1, 'dept-ti', {
      colaboradoresIds: ['colab-2'],
    });
    expect(mockUpdateDepartamento).toHaveBeenNthCalledWith(2, 'dept-vendas', {
      colaboradoresIds: ['colab-1'],
    });
    expect(mockUpdateColaborador).toHaveBeenCalledWith('colab-1', {
      ...inputBase,
      departamento: 'Vendas',
    });
  });

  it('lança erro quando novo departamento não existe na lista', async () => {
    mockListarDepartamentos.mockResolvedValue([
      departamento('dept-ti', 'TI', ['colab-1']),
    ]);

    await expect(
      updateColaboradorESincronizarDepartamentos(
        'colab-1',
        { ...inputBase, departamento: 'Vendas' },
        'TI'
      )
    ).rejects.toThrow('Departamento "Vendas" não encontrado');

    expect(mockUpdateDepartamento).not.toHaveBeenCalled();
    expect(mockUpdateColaborador).not.toHaveBeenCalled();
  });

  it('em falha após atualizar departamentos, faz rollback (restaura antigo e novo)', async () => {
    const oldDept = departamento('dept-ti', 'TI', ['colab-1']);
    const newDept = departamento('dept-vendas', 'Vendas', []);
    mockListarDepartamentos.mockResolvedValue([oldDept, newDept]);
    mockUpdateDepartamento.mockResolvedValue(undefined);
    mockUpdateColaborador.mockRejectedValue(new Error('Falha ao salvar colaborador'));

    await expect(
      updateColaboradorESincronizarDepartamentos(
        'colab-1',
        { ...inputBase, departamento: 'Vendas' },
        'TI'
      )
    ).rejects.toThrow('Falha ao salvar colaborador');

    expect(mockUpdateDepartamento).toHaveBeenCalledTimes(4);
    expect(mockUpdateDepartamento).toHaveBeenNthCalledWith(1, 'dept-ti', {
      colaboradoresIds: [],
    });
    expect(mockUpdateDepartamento).toHaveBeenNthCalledWith(2, 'dept-vendas', {
      colaboradoresIds: ['colab-1'],
    });
    expect(mockUpdateDepartamento).toHaveBeenNthCalledWith(3, 'dept-ti', {
      colaboradoresIds: ['colab-1'],
    });
    expect(mockUpdateDepartamento).toHaveBeenNthCalledWith(4, 'dept-vendas', {
      colaboradoresIds: [],
    });
  });

  it('não adiciona id duplicado no novo departamento se já estiver na lista', async () => {
    const oldDept = departamento('dept-ti', 'TI', ['colab-1']);
    const newDept = departamento('dept-vendas', 'Vendas', ['colab-1']);
    mockListarDepartamentos.mockResolvedValue([oldDept, newDept]);
    mockUpdateDepartamento.mockResolvedValue(undefined);
    mockUpdateColaborador.mockResolvedValue(undefined);

    await updateColaboradorESincronizarDepartamentos(
      'colab-1',
      { ...inputBase, departamento: 'Vendas' },
      'TI'
    );

    expect(mockUpdateDepartamento).toHaveBeenNthCalledWith(2, 'dept-vendas', {
      colaboradoresIds: ['colab-1'],
    });
  });
});
