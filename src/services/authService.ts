import { createAuthGateway } from '../../back-end/interface/AuthGateway';
import type { AuthUser as DomainAuthUser } from '../../back-end/domain/types/AuthTypes';
import { AuthError } from '../../back-end/data/errors/AuthError';
import type { AuthUser } from './auth/types';
import { AuthServiceError, type AuthServiceErrorCode } from './auth/errors';

const authGateway = createAuthGateway();

function toAuthUser(d: DomainAuthUser): AuthUser {
  return { uid: d.uid, email: d.email };
}

function firebaseCodeToServiceCode(firebaseCode: string | undefined): AuthServiceErrorCode {
  switch (firebaseCode) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'invalid-credentials';
    case 'auth/email-already-in-use':
      return 'email-already-in-use';
    case 'auth/invalid-email':
      return 'invalid-email';
    case 'auth/weak-password':
      return 'weak-password';
    case 'auth/too-many-requests':
      return 'too-many-requests';
    case 'auth/network-request-failed':
      return 'network-request-failed';
    case 'auth/user-disabled':
      return 'user-disabled';
    case 'auth/operation-not-allowed':
      return 'operation-not-allowed';
    default:
      return 'unknown';
  }
}

function wrapAuthError(err: unknown, defaultMessage: string): never {
  if (err instanceof AuthError) {
    const cause = err.cause as { code?: string } | undefined;
    const code = firebaseCodeToServiceCode(cause?.code);
    throw new AuthServiceError(err.message || defaultMessage, code);
  }
  if (err instanceof AuthServiceError) throw err;
  throw new AuthServiceError(
    err instanceof Error ? err.message : defaultMessage,
    'unknown'
  );
}

export function onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
  return authGateway.onAuthStateChanged((user) => {
    callback(user ? toAuthUser(user) : null);
  });
}

export async function login(email: string, password: string): Promise<AuthUser> {
  try {
    const user = await authGateway.signIn(email, password);
    return toAuthUser(user);
  } catch (err) {
    wrapAuthError(err, 'Não foi possível entrar.');
  }
}

export async function register(email: string, password: string): Promise<AuthUser> {
  try {
    const user = await authGateway.signUp(email, password);
    return toAuthUser(user);
  } catch (err) {
    wrapAuthError(err, 'Não foi possível criar a conta.');
  }
}

export async function logout(): Promise<void> {
  await authGateway.signOut();
}
