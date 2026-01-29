import type { AuthUser } from '../domain/types/AuthTypes';
import type { AuthRepository } from '../domain/repositories/AuthRepository';
import { authRepositoryFirebase } from '../data/firebase/auth';

export interface AuthGateway {
  signIn(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): AuthUser | null;
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}

class AuthGatewayImpl implements AuthGateway {
  constructor(private readonly repository: AuthRepository) {}

  async signIn(email: string, password: string): Promise<AuthUser> {
    return this.repository.signIn(email, password);
  }

  async signOut(): Promise<void> {
    return this.repository.signOut();
  }

  getCurrentUser(): AuthUser | null {
    return this.repository.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return this.repository.onAuthStateChanged(callback);
  }
}

export function createAuthGateway(
  repository: AuthRepository = authRepositoryFirebase
): AuthGateway {
  return new AuthGatewayImpl(repository);
}
