import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { firebaseAuth } from './config';
import type { AuthUser } from '../../domain/types/AuthTypes';
import type { AuthRepository } from '../../domain/repositories/AuthRepository';
import { AuthError } from '../errors/AuthError';

function userToAuthUser(user: { uid: string; email: string | null }): AuthUser {
  return { uid: user.uid, email: user.email ?? null };
}

export class AuthRepositoryFirebase implements AuthRepository {
  constructor(private readonly auth = firebaseAuth) {}

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      return userToAuthUser(cred.user);
    } catch (e) {
      if (e instanceof AuthError) throw e;
      throw new AuthError('Erro ao autenticar', e);
    }
  }

  async signUp(email: string, password: string): Promise<AuthUser> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      return userToAuthUser(cred.user);
    } catch (e) {
      if (e instanceof AuthError) throw e;
      throw new AuthError('Erro ao criar conta', e);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (e) {
      if (e instanceof AuthError) throw e;
      throw new AuthError('Erro ao encerrar sessão', e);
    }
  }

  getCurrentUser(): AuthUser | null {
    const user = this.auth.currentUser;
    if (!user) return null;
    return userToAuthUser(user);
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return firebaseOnAuthStateChanged(this.auth, (user) => {
      callback(user ? userToAuthUser(user) : null);
    });
  }
}

export const authRepositoryFirebase = new AuthRepositoryFirebase();
