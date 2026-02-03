import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RepositoryError } from '../../back-end/data/errors/RepositoryError';
import type { ColaboradorDTO } from '../../back-end/domain/types/ColaboradorDTO';

const mockGateway = {
  listar: vi.fn(),
  criar: vi.fn(),
  editar: vi.fn(),
  excluir: vi.fn(),
  excluirEmMassa: vi.fn(),
};

vi.mock('../../back-end/interface/ColaboradoresGateway', () => ({
  createColaboradoresGateway: () => mockGateway,
}));

const {
  listarColaboradores,
  criarColaborador,
  updateColaborador,
  bulkDeleteColaboradores,
  toUserMessage,
} = await import('./colaboradoresService');

const dtoExemplo: ColaboradorDTO = {
  id: 'c1',
  nome: 'Maria',
  email: 'maria@empresa.com',
  departamento: 'TI',
  status: 'Ativo',
  cargo: 'Dev',
  dataAdmissao: '2024-01-01',
  nivelHierarquico: 'pleno',
  gestorId: 'g1',
  salarioBase: 6000,
};

describe('colaboradoresService (gateway mockado)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listarColaboradores', () => {
    it('mapeia DTO para Colaborador (UI) e retorna lista', async () => {
      mockGateway.listar.mockResolvedValue([dtoExemplo]);

      const result = await listarColaboradores();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'c1',
        nome: 'Maria',
        email: 'maria@empresa.com',
        departamento: 'TI',
        status: 'Ativo',
        cargo: 'Dev',
        dataAdmissao: '2024-01-01',
        nivelHierarquico: 'pleno',
        gestorId: 'g1',
        salarioBase: 6000,
      });
    });

    it('passa filtro de department quando informado', async () => {
      mockGateway.listar.mockResolvedValue([]);

      await listarColaboradores({ department: 'TI' });

      expect(mockGateway.listar).toHaveBeenCalledWith({ department: 'TI' });
    });

    it('propaga erro do gateway', async () => {
      const err = new RepositoryError('Falha no Firestore');
      mockGateway.listar.mockRejectedValue(err);

      await expect(listarColaboradores()).rejects.toThrow('Falha no Firestore');
    });
  });

  describe('criarColaborador', () => {
    it('mapeia input para DTO e retorna colaborador criado', async () => {
      mockGateway.criar.mockResolvedValue(dtoExemplo);

      const input = {
        nome: 'Maria',
        email: 'maria@empresa.com',
        departamento: 'TI',
        status: 'Ativo' as const,
        cargo: 'Dev',
        dataAdmissao: '2024-01-01',
        nivelHierarquico: 'pleno' as const,
        gestorId: 'g1',
        salarioBase: 6000,
      };

      const result = await criarColaborador(input);

      expect(mockGateway.criar).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: input.nome,
          email: input.email,
          departamento: input.departamento,
          status: input.status,
          cargo: input.cargo,
          dataAdmissao: input.dataAdmissao,
          nivelHierarquico: input.nivelHierarquico,
          gestorId: input.gestorId,
          salarioBase: input.salarioBase,
        })
      );
      expect(result.id).toBe('c1');
      expect(result.nome).toBe('Maria');
    });

    it('propaga erro do gateway', async () => {
      mockGateway.criar.mockRejectedValue(new Error('Erro ao criar'));

      await expect(
        criarColaborador({
          nome: 'X',
          email: 'x@x.com',
          departamento: 'd',
          status: 'Ativo',
          cargo: 'c',
          dataAdmissao: '2024-01-01',
          nivelHierarquico: 'pleno',
          gestorId: 'g1',
          salarioBase: 1000,
        })
      ).rejects.toThrow('Erro ao criar');
    });
  });

  describe('updateColaborador', () => {
    it('mapeia input para DTO e retorna colaborador atualizado', async () => {
      const atualizado = { ...dtoExemplo, nome: 'Maria Silva' };
      mockGateway.editar.mockResolvedValue(atualizado);

      const input = {
        nome: 'Maria Silva',
        email: 'maria@empresa.com',
        departamento: 'TI',
        status: 'Ativo' as const,
        cargo: 'Dev',
        dataAdmissao: '2024-01-01',
        nivelHierarquico: 'pleno' as const,
        gestorId: 'g1',
        salarioBase: 6000,
      };

      const result = await updateColaborador('c1', input);

      expect(mockGateway.editar).toHaveBeenCalledWith(
        'c1',
        expect.objectContaining({
          nome: input.nome,
          email: input.email,
          departamento: input.departamento,
          status: input.status,
        })
      );
      expect(result.nome).toBe('Maria Silva');
    });

    it('propaga erro do gateway', async () => {
      mockGateway.editar.mockRejectedValue(new RepositoryError('Timeout'));

      await expect(
        updateColaborador('c1', {
          nome: 'X',
          email: 'x@x.com',
          departamento: 'd',
          status: 'Ativo',
        })
      ).rejects.toThrow('Timeout');
    });
  });

  describe('bulkDeleteColaboradores', () => {
    it('chama excluirEmMassa com os ids', async () => {
      mockGateway.excluirEmMassa.mockResolvedValue(undefined);

      await bulkDeleteColaboradores(['id1', 'id2']);

      expect(mockGateway.excluirEmMassa).toHaveBeenCalledWith(['id1', 'id2']);
    });

    it('propaga erro do gateway', async () => {
      mockGateway.excluirEmMassa.mockRejectedValue(
        new Error('Falha em massa')
      );

      await expect(bulkDeleteColaboradores(['id1'])).rejects.toThrow(
        'Falha em massa'
      );
    });
  });

  describe('toUserMessage', () => {
    it('adiciona hint de Firebase para RepositoryError', () => {
      const err = new RepositoryError('Falha na rede');
      expect(toUserMessage(err)).toContain('Falha na rede');
      expect(toUserMessage(err)).toContain('VITE_FIREBASE');
    });

    it('retorna message para Error genérico', () => {
      expect(toUserMessage(new Error('Algo deu errado'))).toBe(
        'Algo deu errado'
      );
    });

    it('retorna mensagem padrão para valor não Error', () => {
      expect(toUserMessage('string')).toBe(
        'Ocorreu um erro inesperado. Tente novamente.'
      );
    });
  });
});
