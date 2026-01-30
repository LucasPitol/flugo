export type StatusColaborador = 'Ativo' | 'Inativo';

export type NivelHierarquico = 'junior' | 'pleno' | 'senior' | 'gestor';

export interface ColaboradorDTO {
  id: string;
  nome: string;
  email: string;
  departamento: string;
  status: StatusColaborador;
  /** Campos profissionais (opcionais para compatibilidade com registros antigos). */
  cargo?: string;
  dataAdmissao?: string;
  nivelHierarquico?: NivelHierarquico;
  gestorId?: string;
  salarioBase?: number;
}

export interface CriarColaboradorDTO {
  nome: string;
  email: string;
  departamento: string;
  status: StatusColaborador;
  cargo?: string;
  dataAdmissao?: string;
  nivelHierarquico?: NivelHierarquico;
  gestorId?: string;
  salarioBase?: number;
}

/** Campos opcionais para atualização parcial de colaborador. */
export interface AtualizarColaboradorDTO {
  nome?: string;
  email?: string;
  departamento?: string;
  status?: StatusColaborador;
  cargo?: string;
  dataAdmissao?: string;
  nivelHierarquico?: NivelHierarquico;
  gestorId?: string;
  salarioBase?: number;
}

/** Filtro opcional para listar colaboradores (query no backend). */
export interface ListarColaboradoresFiltro {
  department?: string;
}
