/**
 * Contrato compartilhado para UI de filtros de colaboradores.
 * O frontend depende apenas de services; o gateway mapeia para o domínio.
 */
export interface ColaboradoresFilter {
  name?: string;
  email?: string;
  department?: string;
}
