export interface DepartamentoDTO {
  id: string;
  nome: string;
  gestorResponsavelId: string;
  colaboradoresIds: string[];
  /** Campos opcionais para compatibilidade futura. */
  descricao?: string;
  sigla?: string;
}
