import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/test-utils';

const mockListarColaboradores = vi.fn();
const mockCriarDepartamento = vi.fn();

vi.mock('../../services/colaboradoresService', () => ({
  listarColaboradores: (...args: unknown[]) => mockListarColaboradores(...args),
}));

vi.mock('../../services/departamentosService', () => ({
  criarDepartamentoEAtualizarColaboradores: (...args: unknown[]) =>
    mockCriarDepartamento(...args),
}));

const { NovoDepartamento } = await import('./NovoDepartamento');

describe('NovoDepartamento (widget)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListarColaboradores.mockResolvedValue([
      {
        id: 'g1',
        nome: 'Gestor 1',
        email: 'g1@empresa.com',
        departamento: 'TI',
        status: 'Ativo',
        nivelHierarquico: 'gestor',
      },
    ]);
    mockCriarDepartamento.mockResolvedValue(undefined);
  });

  it('cria departamento sem gestor responsável', async () => {
    renderWithRouter(<NovoDepartamento />, {
      route: '/departamentos/novo',
      path: '/departamentos/novo',
    });

    const user = userEvent.setup();
    await user.type(await screen.findByRole('textbox', { name: /Nome/i }), 'Financeiro');
    await user.click(screen.getByRole('button', { name: 'Criar departamento' }));

    await waitFor(() => {
      expect(mockCriarDepartamento).toHaveBeenCalled();
    });

    const [input] = mockCriarDepartamento.mock.calls[0];
    expect(input).toMatchObject({
      nome: 'Financeiro',
      colaboradoresIds: [],
    });
    expect(input.gestorResponsavelId).toBeUndefined();
  });
});
