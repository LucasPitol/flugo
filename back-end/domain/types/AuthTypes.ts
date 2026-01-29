/**
 * Usuário autenticado exposto pela camada de auth.
 * Sem dados sensíveis; suficiente para identificar sessão e exibir na UI.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
}
