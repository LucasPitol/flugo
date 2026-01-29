/**
 * Erro de aplicação para falhas na camada de autenticação.
 * Encapsula a causa original (ex.: erro do Firebase Auth) para logging/debug.
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
