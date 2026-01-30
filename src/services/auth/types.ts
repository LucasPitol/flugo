/**
 * Contratos do service de auth para a UI.
 * O frontend depende apenas de services; o service mapeia para o domínio.
 */

/** Usuário autenticado no contrato da UI (sessão, exibição). */
export interface AuthUser {
  uid: string;
  email: string | null;
}
