import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/test-utils';

const mockListarDepartamentos = vi.fn();
const mockListarColaboradores = vi.fn();
const mockDeleteDepartamento = vi.fn();
const mockToUserMessage = vi.fn((_err: unknown) => 'Erro');

vi.mock('../../services/departamentosService', () => ({
  listarDepartamentos: (...args: unknown[]) => mockListarDepartamentos(...args),
  deleteDepartamento: (...args: unknown[]) => mockDeleteDepartamento(...args),
  toUserMessage: (err: unknown) => mockToUserMessage(err),
}));

vi.mock('../../services/colaboradoresService', () => ({
  listarColaboradores: (...args: unknown[]) => mockListarColaboradores(...args),
}));

const { DepartamentosPage } = await import('./DepartamentosPage');

describe('DepartamentosPage (widget)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bloqueia exclusão de departamento com colaboradores', async () => {
    mockListarDepartamentos.mockResolvedValue([
      {
        id: 'd1',
        nome: 'TI',
        gestorResponsavelId: '',
        colaboradoresIds: ['c1'],
      },
    ]);
    mockListarColaboradores.mockResolvedValue([]);

    renderWithRouter(<DepartamentosPage />, {
      route: '/departamentos',
      path: '/departamentos',
    });

    expect(await screen.findByText('TI')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(
      await screen.findByRole('dialog', { name: 'Exclusão não permitida' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /O departamento ainda possui colaboradores/i
      )
    ).toBeInTheDocument();
  });
});
