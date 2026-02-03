import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/test-utils';

const mockListarColaboradores = vi.fn();
const mockListarDepartamentos = vi.fn();
const mockCriarColaborador = vi.fn();

vi.mock('../services/colaboradoresService', () => ({
  listarColaboradores: (...args: unknown[]) => mockListarColaboradores(...args),
  criarColaborador: (...args: unknown[]) => mockCriarColaborador(...args),
}));

vi.mock('../services/departamentosService', () => ({
  listarDepartamentos: (...args: unknown[]) => mockListarDepartamentos(...args),
}));

const { NovoColaborador } = await import('./NovoColaborador');

describe('NovoColaborador (widget)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListarColaboradores.mockResolvedValue([]);
  });

  it('bloqueia criação quando não há departamentos', async () => {
    mockListarDepartamentos.mockResolvedValue([]);

    renderWithRouter(<NovoColaborador />, {
      route: '/colaboradores/novo',
      path: '/colaboradores/novo',
    });

    expect(
      await screen.findByText('Nenhum departamento cadastrado.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Criar departamento' })
    ).toBeInTheDocument();

    const nextButton = screen.getByRole('button', { name: 'Próximo' });
    expect(nextButton).toBeDisabled();
  });

  it('com departamento permite avançar para o próximo passo', async () => {
    mockListarDepartamentos.mockResolvedValue([{ id: 'd1', nome: 'TI' }]);

    renderWithRouter(<NovoColaborador />, {
      route: '/colaboradores/novo',
      path: '/colaboradores/novo',
    });

    const user = userEvent.setup();

    await user.type(await screen.findByRole('textbox', { name: /Nome/i }), 'João');
    await user.type(screen.getByRole('textbox', { name: /E-mail/i }), 'joao@empresa.com');

    const deptSelect = screen.getByRole('combobox', { name: /Departamento/i });
    await user.click(deptSelect);
    await user.click(await screen.findByRole('option', { name: 'TI' }));

    await user.click(screen.getByRole('button', { name: 'Próximo' }));

    expect(
      await screen.findByText('Informações Profissionais')
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Cargo/i })).toBeInTheDocument();
  });

  it('campo de gestor responde ao nível hierárquico', async () => {
    mockListarDepartamentos.mockResolvedValue([{ id: 'd1', nome: 'TI' }]);
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

    renderWithRouter(<NovoColaborador />, {
      route: '/colaboradores/novo',
      path: '/colaboradores/novo',
    });

    const user = userEvent.setup();
    await user.type(await screen.findByRole('textbox', { name: /Nome/i }), 'João');
    await user.type(screen.getByRole('textbox', { name: /E-mail/i }), 'joao@empresa.com');
    await user.click(screen.getByRole('combobox', { name: /Departamento/i }));
    await user.click(await screen.findByRole('option', { name: 'TI' }));
    await user.click(screen.getByRole('button', { name: 'Próximo' }));

    const nivelSelect = await screen.findByRole('combobox', { name: /Nível hierárquico/i });
    await user.click(nivelSelect);
    await user.click(await screen.findByRole('option', { name: 'Gestor' }));
    expect(
      screen.queryByRole('combobox', { name: /Gestor responsável/i })
    ).not.toBeInTheDocument();

    await user.click(nivelSelect);
    await user.click(await screen.findByRole('option', { name: 'Pleno' }));
    expect(
      screen.getByRole('combobox', { name: /Gestor responsável/i })
    ).toBeInTheDocument();
  });
});
