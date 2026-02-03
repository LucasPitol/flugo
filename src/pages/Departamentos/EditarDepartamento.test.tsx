import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/test-utils';

const mockListarDepartamentos = vi.fn();
const mockListarColaboradores = vi.fn();
const mockUpdateDepartamento = vi.fn();

vi.mock('../../services/departamentosService', () => ({
  listarDepartamentos: (...args: unknown[]) => mockListarDepartamentos(...args),
  updateDepartamentoEAtualizarColaboradores: (...args: unknown[]) =>
    mockUpdateDepartamento(...args),
}));

vi.mock('../../services/colaboradoresService', () => ({
  listarColaboradores: (...args: unknown[]) => mockListarColaboradores(...args),
}));

const { EditarDepartamento } = await import('./EditarDepartamento');

describe('EditarDepartamento (widget)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateDepartamento.mockResolvedValue(undefined);
  });

  it('remove colaborador e exige departamento de destino', async () => {
    mockListarDepartamentos.mockResolvedValue([
      {
        id: 'd1',
        nome: 'TI',
        gestorResponsavelId: '',
        colaboradoresIds: ['c1', 'c2'],
      },
      {
        id: 'd2',
        nome: 'Marketing',
        gestorResponsavelId: '',
        colaboradoresIds: [],
      },
    ]);
    mockListarColaboradores.mockResolvedValue([
      {
        id: 'c1',
        nome: 'Carlos',
        email: 'carlos@empresa.com',
        departamento: 'TI',
        status: 'Ativo',
      },
      {
        id: 'c2',
        nome: 'Bianca',
        email: 'bianca@empresa.com',
        departamento: 'TI',
        status: 'Ativo',
      },
    ]);

    renderWithRouter(<EditarDepartamento />, {
      route: '/departamentos/d1/editar',
      path: '/departamentos/:id/editar',
    });

    expect(
      await screen.findByRole('heading', { name: 'Editar departamento' })
    ).toBeInTheDocument();
    const carlos = await screen.findAllByText('Carlos');
    const bianca = await screen.findAllByText('Bianca');
    expect(carlos.length).toBeGreaterThan(0);
    expect(bianca.length).toBeGreaterThan(0);

    const user = userEvent.setup();
    const colabInput = screen.getByRole('combobox', { name: /Colaboradores/i });
    await user.click(colabInput);
    await user.keyboard('{Backspace}');

    expect(
      await screen.findByLabelText(
        'Departamento de destino (colaboradores removidos)'
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Salvar alterações' })
    );

    await waitFor(() => {
      expect(mockUpdateDepartamento).toHaveBeenCalled();
    });

    const [, input, , , destino] = mockUpdateDepartamento.mock.calls[0];
    expect(input).toMatchObject({ nome: 'TI' });
    expect(input.colaboradoresIds).toHaveLength(1);
    expect(destino).toBe('Marketing');
  });
});
