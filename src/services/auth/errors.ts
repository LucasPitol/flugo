/**
 * Erro da camada de aplicação (auth service).
 * A UI usa apenas este tipo; não conhece erros de infraestrutura (back-end/data).
 */
export type AuthServiceErrorCode =
  | 'invalid-credentials'
  | 'email-already-in-use'
  | 'invalid-email'
  | 'weak-password'
  | 'too-many-requests'
  | 'network-request-failed'
  | 'user-disabled'
  | 'operation-not-allowed'
  | 'unknown';

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: AuthServiceErrorCode
  ) {
    super(message);
    this.name = 'AuthServiceError';
    Object.setPrototypeOf(this, AuthServiceError.prototype);
  }
}
