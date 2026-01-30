/**
 * Contratos do service de colaboradores para a UI.
 * O frontend depende apenas de services; o service mapeia para o domínio.
 */

export type NivelHierarquico = 'junior' | 'pleno' | 'senior' | 'gestor';

/** Colaborador no contrato da UI (lista, edição, etc.). */
export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  departamento: string;
  status: 'Ativo' | 'Inativo';
  /** Campos profissionais (opcionais para compatibilidade com registros antigos). */
  cargo?: string;
  dataAdmissao?: string;
  nivelHierarquico?: NivelHierarquico;
  gestorId?: string;
  salarioBase?: number;
}

/** Input para criação de colaborador. */
export interface CreateColaboradorInput {
  nome: string;
  email: string;
  departamento: string;
  status: 'Ativo' | 'Inativo';
  cargo?: string;
  dataAdmissao?: string;
  nivelHierarquico?: NivelHierarquico;
  gestorId?: string;
  salarioBase?: number;
}

/** Input para atualização de colaborador (edição). */
export interface UpdateColaboradorInput {
  nome: string;
  email: string;
  departamento: string;
  status: 'Ativo' | 'Inativo';
  cargo?: string;
  dataAdmissao?: string;
  nivelHierarquico?: NivelHierarquico;
  gestorId?: string;
  salarioBase?: number;
}

/** Filtros de listagem. */
export interface ColaboradoresFilter {
  name?: string;
  email?: string;
  department?: string;
}
