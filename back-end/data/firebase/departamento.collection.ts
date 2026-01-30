import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { firebaseApp } from './config';
import type {
  DepartamentoDTO,
  CriarDepartamentoDTO,
  AtualizarDepartamentoDTO,
} from '../../domain/types/DepartamentoDTO';
import type { DepartamentoRepository } from '../../domain/repositories/DepartamentoRepository';
import { RepositoryError } from '../errors/RepositoryError';

const COLLECTION_NAME = 'departamentos';

type DepartamentoFirestore = {
  nome: string;
  gestorResponsavelId: string;
  colaboradoresIds: string[];
  descricao?: string;
  sigla?: string;
};

function getFirestoreInstance() {
  if (!firebaseApp) {
    throw new RepositoryError(
      'Firebase não configurado. Configure as variáveis de ambiente (VITE_FIREBASE_*) no painel da Vercel.'
    );
  }
  return getFirestore(firebaseApp);
}

function getDepartamentosRef() {
  return collection(getFirestoreInstance(), COLLECTION_NAME);
}

function getDepartamentoDocRef(id: string) {
  return doc(getDepartamentosRef(), id);
}

function docToDTO(id: string, data: DepartamentoFirestore): DepartamentoDTO {
  return {
    id,
    nome: data.nome ?? '',
    gestorResponsavelId: data.gestorResponsavelId ?? '',
    colaboradoresIds: Array.isArray(data.colaboradoresIds) ? data.colaboradoresIds : [],
    ...(data.descricao !== undefined && { descricao: data.descricao }),
    ...(data.sigla !== undefined && { sigla: data.sigla }),
  };
}

function assertDepartamentoFirestore(data: unknown): data is DepartamentoFirestore {
  if (data == null || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.nome === 'string' &&
    typeof d.gestorResponsavelId === 'string' &&
    Array.isArray(d.colaboradoresIds)
  );
}

export class DepartamentoRepositoryFirestore implements DepartamentoRepository {
  async listar(): Promise<DepartamentoDTO[]> {
    try {
      const departamentosRef = getDepartamentosRef();
      const snapshot = await getDocs(departamentosRef);
      return snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        if (!assertDepartamentoFirestore(data)) {
          throw new RepositoryError(
            `Documento ${docSnap.id} com formato inválido na coleção ${COLLECTION_NAME}`
          );
        }
        return docToDTO(docSnap.id, data);
      });
    } catch (e) {
      if (e instanceof RepositoryError) throw e;
      throw new RepositoryError('Erro ao listar departamentos', e);
    }
  }

  async criar(dto: CriarDepartamentoDTO): Promise<DepartamentoDTO> {
    try {
      const departamentosRef = getDepartamentosRef();
      const payload: DepartamentoFirestore = {
        nome: dto.nome,
        gestorResponsavelId: dto.gestorResponsavelId,
        colaboradoresIds: dto.colaboradoresIds ?? [],
        ...(dto.descricao !== undefined && dto.descricao.trim() !== '' && { descricao: dto.descricao.trim() }),
        ...(dto.sigla !== undefined && dto.sigla.trim() !== '' && { sigla: dto.sigla.trim() }),
      };
      const docRef = await addDoc(departamentosRef, payload);
      return {
        id: docRef.id,
        nome: dto.nome,
        gestorResponsavelId: dto.gestorResponsavelId,
        colaboradoresIds: dto.colaboradoresIds ?? [],
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.sigla !== undefined && { sigla: dto.sigla }),
      };
    } catch (e) {
      throw new RepositoryError('Erro ao criar departamento', e);
    }
  }

  async atualizar(id: string, dto: AtualizarDepartamentoDTO): Promise<DepartamentoDTO> {
    try {
      const docRef = getDepartamentoDocRef(id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        throw new RepositoryError(`Departamento não encontrado: ${id}`);
      }
      const data = snap.data();
      if (!assertDepartamentoFirestore(data)) {
        throw new RepositoryError(
          `Documento ${id} com formato inválido na coleção ${COLLECTION_NAME}`
        );
      }
      const updates: Record<string, unknown> = {};
      if (dto.nome !== undefined) updates.nome = dto.nome;
      if (dto.gestorResponsavelId !== undefined) updates.gestorResponsavelId = dto.gestorResponsavelId;
      if (dto.colaboradoresIds !== undefined) updates.colaboradoresIds = dto.colaboradoresIds;
      if (dto.descricao !== undefined) updates.descricao = dto.descricao.trim();
      if (dto.sigla !== undefined) updates.sigla = dto.sigla.trim();
      if (Object.keys(updates).length > 0) {
        await updateDoc(docRef, updates as Record<string, string | string[]>);
        const updatedSnap = await getDoc(docRef);
        const updatedData = updatedSnap.exists() ? updatedSnap.data() : data;
        if (assertDepartamentoFirestore(updatedData)) {
          return docToDTO(id, updatedData);
        }
      }
      return docToDTO(id, data);
    } catch (e) {
      if (e instanceof RepositoryError) throw e;
      throw new RepositoryError('Erro ao atualizar departamento', e);
    }
  }

  async remover(id: string): Promise<void> {
    try {
      await deleteDoc(getDepartamentoDocRef(id));
    } catch (e) {
      throw new RepositoryError('Erro ao remover departamento', e);
    }
  }
}

export const departamentoRepositoryFirestore =
  new DepartamentoRepositoryFirestore();
