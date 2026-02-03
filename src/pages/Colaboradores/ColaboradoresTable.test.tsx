import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { ColaboradoresTable } from './ColaboradoresTable';
import { renderWithRouter } from '../../test/test-utils';

const baseProps = {
  loading: false,
  sortedColaboradores: [],
  selectedIds: new Set<string>(),
  orderBy: 'nome' as const,
  order: 'asc' as const,
  onRequestSort: vi.fn(),
  onToggleRow: vi.fn(),
  onToggleSelectAll: vi.fn(),
  onEditRow: vi.fn(),
};

describe('ColaboradoresTable', () => {
  it('exibe EmptyState quando lista está vazia', () => {
    renderWithRouter(<ColaboradoresTable {...baseProps} />);

    expect(screen.getByText('Nenhum colaborador cadastrado.')).toBeInTheDocument();
    expect(
      screen.getByText('Clique em "Novo Colaborador" para adicionar o primeiro.')
    ).toBeInTheDocument();
  });

  it('renderiza tabela com dados e StatusChip correto', () => {
    renderWithRouter(
      <ColaboradoresTable
        {...baseProps}
        sortedColaboradores={[
          {
            id: 'c1',
            nome: 'Ana',
            email: 'ana@empresa.com',
            departamento: 'TI',
            status: 'Ativo',
          },
        ]}
      />
    );

    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('ana@empresa.com')).toBeInTheDocument();
    expect(screen.getByText('TI')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });
});
