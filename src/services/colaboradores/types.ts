/**
 * Contratos do service de colaboradores para a UI.
 * O frontend depende apenas de services; o service mapeia para o domínio.
 */

/** Colaborador no contrato da UI (lista, edição, etc.). */
export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  departamento: string;
  status: 'Ativo' | 'Inativo';
}

/** Input para criação de colaborador. */
export interface CreateColaboradorInput {
  nome: string;
  email: string;
  departamento: string;
  status: 'Ativo' | 'Inativo';
}

/** Input para atualização de colaborador (edição). */
export interface UpdateColaboradorInput {
  nome: string;
  email: string;
  departamento: string;
  status: 'Ativo' | 'Inativo';
}

/** Filtros de listagem. */
export interface ColaboradoresFilter {
  name?: string;
  email?: string;
  department?: string;
}
