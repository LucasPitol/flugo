import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../test/test-utils';

const mockListarColaboradores = vi.fn();
const mockBulkDelete = vi.fn();
const mockUpdateColaborador = vi.fn();
const mockDeleteColaborador = vi.fn();
const mockToUserMessage = vi.fn((err) =>
  err instanceof Error ? err.message : 'Erro inesperado'
);

const mockListarDepartamentos = vi.fn();
const mockSyncUpdate = vi.fn();

vi.mock('../../services/colaboradoresService', () => ({
  listarColaboradores: (...args: unknown[]) => mockListarColaboradores(...args),
  bulkDeleteColaboradores: (...args: unknown[]) => mockBulkDelete(...args),
  updateColaborador: (...args: unknown[]) => mockUpdateColaborador(...args),
  deleteColaborador: (...args: unknown[]) => mockDeleteColaborador(...args),
  toUserMessage: (err: unknown) => mockToUserMessage(err),
}));

vi.mock('../../services/departamentosService', () => ({
  listarDepartamentos: (...args: unknown[]) => mockListarDepartamentos(...args),
}));

vi.mock('../../services/colaboradorDepartamentoSync', () => ({
  updateColaboradorESincronizarDepartamentos: (...args: unknown[]) =>
    mockSyncUpdate(...args),
}));

const { ColaboradoresPage } = await import('./ColaboradoresPage');

const colaboradores = [
  {
    id: 'c1',
    nome: 'Ana',
    email: 'ana@empresa.com',
    departamento: 'TI',
    status: 'Ativo' as const,
    cargo: 'Desenvolvedora',
    dataAdmissao: '2023-01-15',
    nivelHierarquico: 'pleno' as const,
    salarioBase: 5000,
  },
  {
    id: 'c2',
    nome: 'Bruno',
    email: 'bruno@empresa.com',
    departamento: 'Marketing',
    status: 'Inativo' as const,
  },
];

describe('ColaboradoresPage (widget)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListarDepartamentos.mockResolvedValue([]);
  });

  it('aplica filtros locais (nome/email) sem refetch e restaura lista ao limpar', async () => {
    mockListarColaboradores.mockResolvedValueOnce(colaboradores);

    renderWithRouter(<ColaboradoresPage />, {
      route: '/colaboradores',
      path: '/colaboradores',
    });

    expect(await screen.findByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Bruno')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Filtros/i }));

    let drawer = await screen.findByRole('presentation');
    const nomeInput = within(drawer).getByLabelText('Nome');
    await user.type(nomeInput, 'Ana');

    await user.click(within(drawer).getByRole('button', { name: 'Aplicar filtros' }));

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.queryByText('Bruno')).not.toBeInTheDocument();
    expect(mockListarColaboradores).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Filtros/i }));
    drawer = await screen.findByRole('presentation');
    await user.click(within(drawer).getByRole('button', { name: 'Limpar filtros' }));
    await user.click(within(drawer).getByRole('button', { name: 'Aplicar filtros' }));

    expect(await screen.findByText('Bruno')).toBeInTheDocument();
    expect(mockListarColaboradores).toHaveBeenCalledTimes(1);
  });

  it('aplica filtro por departamento com refetch', async () => {
    mockListarColaboradores
      .mockResolvedValueOnce(colaboradores)
      .mockResolvedValueOnce([colaboradores[0]]);

    renderWithRouter(<ColaboradoresPage />, {
      route: '/colaboradores',
      path: '/colaboradores',
    });

    expect(await screen.findByText('Ana')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Filtros/i }));

    const drawer = await screen.findByRole('presentation');
    const deptSelect = within(drawer).getByLabelText('Departamento');
    await user.click(deptSelect);
    await user.click(await screen.findByRole('option', { name: 'TI' }));

    await user.click(within(drawer).getByRole('button', { name: 'Aplicar filtros' }));

    await waitFor(() => {
      expect(mockListarColaboradores).toHaveBeenCalledTimes(2);
    });
    expect(mockListarColaboradores).toHaveBeenLastCalledWith({ department: 'TI' });
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.queryByText('Bruno')).not.toBeInTheDocument();
  });

  it('exclui colaboradores selecionados via fluxo de confirmação', async () => {
    mockListarColaboradores
      .mockResolvedValueOnce(colaboradores)
      .mockResolvedValueOnce(colaboradores);
    mockBulkDelete.mockResolvedValue(undefined);

    renderWithRouter(<ColaboradoresPage />, {
      route: '/colaboradores',
      path: '/colaboradores',
    });

    expect(await screen.findByText('Ana')).toBeInTheDocument();

    const user = userEvent.setup();
    const [, checkboxAna, checkboxBruno] = screen.getAllByRole('checkbox');
    await user.click(checkboxAna);
    await user.click(checkboxBruno);

    await user.click(
      await screen.findByRole('button', { name: /Excluir selecionados/i })
    );

    const dialog = await screen.findByRole('dialog', {
      name: /Excluir selecionados/i,
    });
    expect(within(dialog).getByText(/Excluir 2 colaboradores/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => {
      expect(mockBulkDelete).toHaveBeenCalledWith(['c1', 'c2']);
    });

    expect(
      await screen.findByText('2 colaboradores excluídos.')
    ).toBeInTheDocument();
  });

  describe('drawer detalhes e edição', () => {
    it('abre drawer em modo detalhes (leitura)', async () => {
      mockListarColaboradores.mockResolvedValueOnce(colaboradores);

      renderWithRouter(<ColaboradoresPage />, {
        route: '/colaboradores',
        path: '/colaboradores',
      });

      expect(await screen.findByText('Ana')).toBeInTheDocument();

      const user = userEvent.setup();
      const detalhesButtons = screen.getAllByRole('button', { name: 'Detalhes' });
      await user.click(detalhesButtons[0]);

      const drawerPanel = await screen.findByRole('dialog');
      expect(within(drawerPanel).getByRole('heading', { name: 'Detalhes do colaborador' })).toBeInTheDocument();
      expect(within(drawerPanel).getByText('Dados básicos')).toBeInTheDocument();
      expect(within(drawerPanel).getByText('Infos profissionais')).toBeInTheDocument();
      expect(within(drawerPanel).getByText('Ana')).toBeInTheDocument();
      expect(within(drawerPanel).getByText('ana@empresa.com')).toBeInTheDocument();
      expect(within(drawerPanel).getByRole('button', { name: 'Editar' })).toBeInTheDocument();
      expect(within(drawerPanel).getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
      expect(within(drawerPanel).queryByRole('textbox', { name: /Nome/i })).not.toBeInTheDocument();
    });

    it('ao clicar em Editar, exibe formulário de edição', async () => {
      mockListarColaboradores.mockResolvedValueOnce(colaboradores);

      renderWithRouter(<ColaboradoresPage />, {
        route: '/colaboradores',
        path: '/colaboradores',
      });

      expect(await screen.findByText('Ana')).toBeInTheDocument();

      const user = userEvent.setup();
      const detalhesButtons = screen.getAllByRole('button', { name: 'Detalhes' });
      await user.click(detalhesButtons[0]);

      const drawerPanel = await screen.findByRole('dialog');
      await user.click(within(drawerPanel).getByRole('button', { name: 'Editar' }));

      const editPanel = screen.getByRole('dialog');
      expect(within(editPanel).getByRole('heading', { name: 'Editar colaborador' })).toBeInTheDocument();
      expect(within(editPanel).getByRole('textbox', { name: /Nome/i })).toBeInTheDocument();
      expect(within(editPanel).getByRole('textbox', { name: /E-mail/i })).toBeInTheDocument();
      expect(within(editPanel).getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
      expect(within(editPanel).getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('ao cancelar edição, volta para modo detalhes', async () => {
      mockListarColaboradores.mockResolvedValueOnce(colaboradores);

      renderWithRouter(<ColaboradoresPage />, {
        route: '/colaboradores',
        path: '/colaboradores',
      });

      expect(await screen.findByText('Ana')).toBeInTheDocument();

      const user = userEvent.setup();
      const detalhesButtons = screen.getAllByRole('button', { name: 'Detalhes' });
      await user.click(detalhesButtons[0]);

      const drawerPanel = await screen.findByRole('dialog');
      await user.click(within(drawerPanel).getByRole('button', { name: 'Editar' }));

      const editPanel = screen.getByRole('dialog');
      const nomeInput = within(editPanel).getByRole('textbox', { name: /Nome/i });
      await user.clear(nomeInput);
      await user.type(nomeInput, 'Nome alterado');

      await user.click(within(editPanel).getByRole('button', { name: 'Cancelar' }));

      const detailsPanel = screen.getByRole('dialog');
      expect(within(detailsPanel).getByRole('heading', { name: 'Detalhes do colaborador' })).toBeInTheDocument();
      expect(within(detailsPanel).getByText('Ana')).toBeInTheDocument();
      expect(within(detailsPanel).queryByRole('textbox', { name: /Nome/i })).not.toBeInTheDocument();
    });

    it('excluir colaborador funciona a partir do drawer (modo detalhes)', async () => {
      mockListarColaboradores
        .mockResolvedValueOnce(colaboradores)
        .mockResolvedValueOnce([]);
      mockDeleteColaborador.mockResolvedValue(undefined);

      renderWithRouter(<ColaboradoresPage />, {
        route: '/colaboradores',
        path: '/colaboradores',
      });

      expect(await screen.findByText('Ana')).toBeInTheDocument();

      const user = userEvent.setup();
      const detalhesButtons = screen.getAllByRole('button', { name: 'Detalhes' });
      await user.click(detalhesButtons[0]);

      const drawerPanel = await screen.findByRole('dialog');
      await user.click(within(drawerPanel).getByRole('button', { name: 'Excluir' }));

      const confirmDialog = await screen.findByRole('dialog', { name: /Excluir colaborador/i });
      expect(within(confirmDialog).getByText(/Excluir Ana\?/)).toBeInTheDocument();
      await user.click(within(confirmDialog).getByRole('button', { name: 'Excluir' }));

      await waitFor(() => {
        expect(mockDeleteColaborador).toHaveBeenCalledWith('c1');
      });
      expect(await screen.findByText('Colaborador excluído.')).toBeInTheDocument();
    });
  });
});
