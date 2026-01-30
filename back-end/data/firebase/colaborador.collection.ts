import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { firebaseApp } from './config';
import type {
  ColaboradorDTO,
  CriarColaboradorDTO,
  AtualizarColaboradorDTO,
  ListarColaboradoresFiltro,
  StatusColaborador,
} from '../../domain/types/ColaboradorDTO';
import type { ColaboradorRepository } from '../../domain/repositories/ColaboradorRepository';
import { RepositoryError } from '../errors/RepositoryError';

const COLLECTION_NAME = 'colaboradores';

/** Schema do documento na coleção Firestore (evita DocumentData frouxo). */
type ColaboradorFirestore = {
  nome: string;
  email: string;
  departamento: string;
  status: StatusColaborador;
};

function getFirestoreInstance() {
  if (!firebaseApp) {
    throw new RepositoryError(
      'Firebase não configurado. Configure as variáveis de ambiente (VITE_FIREBASE_*) no painel da Vercel.'
    );
  }
  return getFirestore(firebaseApp);
}

function getColaboradoresRef() {
  return collection(getFirestoreInstance(), COLLECTION_NAME);
}

function getColaboradorDocRef(id: string) {
  return doc(getColaboradoresRef(), id);
}

function docToDTO(id: string, data: ColaboradorFirestore): ColaboradorDTO {
  return {
    id,
    nome: data.nome ?? '',
    email: data.email ?? '',
    departamento: data.departamento ?? '',
    status: data.status ?? 'Ativo',
  };
}

function assertColaboradorFirestore(data: unknown): data is ColaboradorFirestore {
  if (data == null || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.nome === 'string' &&
    typeof d.email === 'string' &&
    typeof d.departamento === 'string' &&
    (d.status === 'Ativo' || d.status === 'Inativo')
  );
}

export class ColaboradorRepositoryFirestore implements ColaboradorRepository {
  async listar(filtro?: ListarColaboradoresFiltro): Promise<ColaboradorDTO[]> {
    try {
      const colaboradoresRef = getColaboradoresRef();
      const department = filtro?.department?.trim();
      const q = department
        ? query(colaboradoresRef, where('departamento', '==', department))
        : colaboradoresRef;
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        if (!assertColaboradorFirestore(data)) {
          throw new RepositoryError(
            `Documento ${doc.id} com formato inválido na coleção ${COLLECTION_NAME}`
          );
        }
        return docToDTO(doc.id, data);
      });
    } catch (e) {
      if (e instanceof RepositoryError) throw e;
      throw new RepositoryError('Erro ao listar colaboradores', e);
    }
  }

  async criar(dto: CriarColaboradorDTO): Promise<ColaboradorDTO> {
    try {
      const colaboradoresRef = getColaboradoresRef();
      const payload: ColaboradorFirestore = {
        nome: dto.nome,
        email: dto.email,
        departamento: dto.departamento,
        status: dto.status,
      };
      const docRef = await addDoc(colaboradoresRef, payload);
      return {
        id: docRef.id,
        nome: dto.nome,
        email: dto.email,
        departamento: dto.departamento,
        status: dto.status,
      };
    } catch (e) {
      throw new RepositoryError('Erro ao criar colaborador', e);
    }
  }

  async atualizar(id: string, dto: AtualizarColaboradorDTO): Promise<ColaboradorDTO> {
    try {
      const docRef = getColaboradorDocRef(id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        throw new RepositoryError(`Colaborador não encontrado: ${id}`);
      }
      const data = snap.data();
      if (!assertColaboradorFirestore(data)) {
        throw new RepositoryError(
          `Documento ${id} com formato inválido na coleção ${COLLECTION_NAME}`
        );
      }
      const updates: Partial<ColaboradorFirestore> = {};
      if (dto.nome !== undefined) updates.nome = dto.nome;
      if (dto.email !== undefined) updates.email = dto.email;
      if (dto.departamento !== undefined) updates.departamento = dto.departamento;
      if (dto.status !== undefined) updates.status = dto.status;
      if (Object.keys(updates).length > 0) {
        await updateDoc(docRef, updates);
      }
      return docToDTO(id, { ...data, ...updates });
    } catch (e) {
      if (e instanceof RepositoryError) throw e;
      throw new RepositoryError('Erro ao atualizar colaborador', e);
    }
  }

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(getColaboradorDocRef(id));
    } catch (e) {
      throw new RepositoryError('Erro ao remover colaborador', e);
    }
  }

  async removerEmMassa(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    try {
      const firestore = getFirestoreInstance();
      const batch = writeBatch(firestore);
      const colRef = getColaboradoresRef();
      for (const id of ids) {
        batch.delete(doc(colRef, id));
      }
      await batch.commit();
    } catch (e) {
      throw new RepositoryError('Erro ao remover colaboradores em massa', e);
    }
  }
}

export const colaboradorRepositoryFirestore =
  new ColaboradorRepositoryFirestore();
