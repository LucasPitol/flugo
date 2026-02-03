export interface DepartamentoDTO {
  id: string;
  nome: string;
  gestorResponsavelId: string;
  colaboradoresIds: string[];
  /** Campos opcionais para compatibilidade futura. */
  descricao?: string;
  sigla?: string;
}

export interface CriarDepartamentoDTO {
  nome: string;
  /** Opcional: departamento não é obrigado a ter gestor. */
  gestorResponsavelId?: string;
  colaboradoresIds: string[];
  descricao?: string;
  sigla?: string;
}

/** Campos opcionais para atualização parcial de departamento. */
export interface AtualizarDepartamentoDTO {
  nome?: string;
  gestorResponsavelId?: string;
  colaboradoresIds?: string[];
  descricao?: string;
  sigla?: string;
}
