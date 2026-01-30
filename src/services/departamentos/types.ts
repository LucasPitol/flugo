/**
 * Contratos do service de departamentos para a UI.
 */

/** Departamento no contrato da UI (lista, edição, etc.). */
export interface Departamento {
  id: string;
  nome: string;
  gestorResponsavelId: string;
  colaboradoresIds: string[];
  /** Campos opcionais para compatibilidade futura. */
  descricao?: string;
  sigla?: string;
}

/** Input para criação de departamento. */
export interface CreateDepartamentoInput {
  nome: string;
  gestorResponsavelId: string;
  colaboradoresIds: string[];
  descricao?: string;
  sigla?: string;
}

/** Input para atualização de departamento (edição). */
export interface UpdateDepartamentoInput {
  nome?: string;
  gestorResponsavelId?: string;
  colaboradoresIds?: string[];
  descricao?: string;
  sigla?: string;
}
