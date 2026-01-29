/**
 * Erro de aplicação para falhas na camada de persistência.
 * Encapsula a causa original (ex.: erro do Firebase) para logging/debug.
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
    Object.setPrototypeOf(this, RepositoryError.prototype);
  }
}
