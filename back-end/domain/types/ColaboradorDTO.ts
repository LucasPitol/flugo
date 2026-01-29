export type StatusColaborador = 'Ativo' | 'Inativo';

export interface ColaboradorDTO {
  id: string;
  nome: string;
  email: string;
  departamento: string;
  status: StatusColaborador;
}

export interface CriarColaboradorDTO {
  nome: string;
  email: string;
  departamento: string;
  status: StatusColaborador;
}

/** Campos opcionais para atualização parcial de colaborador. */
export interface AtualizarColaboradorDTO {
  nome?: string;
  email?: string;
  departamento?: string;
  status?: StatusColaborador;
}
