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
  Timestamp,
  deleteField,
} from 'firebase/firestore';
import { firebaseApp } from './config';
import type {
  ColaboradorDTO,
  CriarColaboradorDTO,
  AtualizarColaboradorDTO,
  ListarColaboradoresFiltro,
  StatusColaborador,
  NivelHierarquico,
} from '../../domain/types/ColaboradorDTO';
import type { ColaboradorRepository } from '../../domain/repositories/ColaboradorRepository';
import { RepositoryError } from '../errors/RepositoryError';

const COLLECTION_NAME = 'colaboradores';

/** Schema do documento na coleção Firestore (campos profissionais opcionais para compatibilidade). */
type ColaboradorFirestore = {
  nome: string;
  email: string;
  departamento: string;
  status: StatusColaborador;
  cargo?: string;
  dataAdmissao?: string | Timestamp;
  nivelHierarquico?: NivelHierarquico;
  gestorId?: string;
  salarioBase?: number;
};

function dataAdmissaoToString(value: string | Timestamp | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  return (value as Timestamp).toDate?.()?.toISOString?.() ?? undefined;
}

/** Converte dataAdmissao (string ISO) para Timestamp ao persistir no Firestore. */
function dataAdmissaoToTimestamp(value: string | undefined): Timestamp | undefined {
  if (value == null || value.trim() === '') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : Timestamp.fromDate(date);
}

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
    ...(data.cargo !== undefined && { cargo: data.cargo }),
    ...(data.dataAdmissao !== undefined && { dataAdmissao: dataAdmissaoToString(data.dataAdmissao) }),
    ...(data.nivelHierarquico !== undefined && { nivelHierarquico: data.nivelHierarquico }),
    ...(data.gestorId !== undefined && { gestorId: data.gestorId }),
    ...(data.salarioBase !== undefined && { salarioBase: data.salarioBase }),
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
      const dataAdmissaoTimestamp = dataAdmissaoToTimestamp(dto.dataAdmissao);
      const salarioBaseNum =
        dto.salarioBase !== undefined && dto.salarioBase !== null
          ? Number(dto.salarioBase)
          : undefined;
      const payload: ColaboradorFirestore = {
        nome: dto.nome,
        email: dto.email,
        departamento: dto.departamento,
        status: dto.status,
        ...(dto.cargo !== undefined && dto.cargo.trim() !== '' && { cargo: dto.cargo.trim() }),
        ...(dataAdmissaoTimestamp !== undefined && { dataAdmissao: dataAdmissaoTimestamp }),
        ...(dto.nivelHierarquico !== undefined && { nivelHierarquico: dto.nivelHierarquico }),
        ...(dto.gestorId !== undefined && dto.gestorId.trim() !== '' && { gestorId: dto.gestorId.trim() }),
        ...(salarioBaseNum !== undefined && !Number.isNaN(salarioBaseNum) && { salarioBase: salarioBaseNum }),
      };
      const docRef = await addDoc(colaboradoresRef, payload);
      return {
        id: docRef.id,
        nome: dto.nome,
        email: dto.email,
        departamento: dto.departamento,
        status: dto.status,
        ...(dto.cargo !== undefined && { cargo: dto.cargo }),
        ...(dto.dataAdmissao !== undefined && { dataAdmissao: dto.dataAdmissao }),
        ...(dto.nivelHierarquico !== undefined && { nivelHierarquico: dto.nivelHierarquico }),
        ...(dto.gestorId !== undefined && { gestorId: dto.gestorId }),
        ...(dto.salarioBase !== undefined && { salarioBase: dto.salarioBase }),
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
      const updates: Record<string, unknown> = {};
      if (dto.nome !== undefined) updates.nome = dto.nome;
      if (dto.email !== undefined) updates.email = dto.email;
      if (dto.departamento !== undefined) updates.departamento = dto.departamento;
      if (dto.status !== undefined) updates.status = dto.status;
      if (dto.cargo !== undefined) updates.cargo = dto.cargo.trim();
      if (dto.dataAdmissao !== undefined) {
        const ts = dataAdmissaoToTimestamp(dto.dataAdmissao);
        if (ts !== undefined) updates.dataAdmissao = ts;
      }
      if (dto.nivelHierarquico !== undefined) updates.nivelHierarquico = dto.nivelHierarquico;
      if (dto.nivelHierarquico === 'gestor') {
        updates.gestorId = deleteField();
      } else if (dto.gestorId !== undefined) {
        updates.gestorId = dto.gestorId.trim() || deleteField();
      }
      if (dto.salarioBase !== undefined) {
        const num = Number(dto.salarioBase);
        if (!Number.isNaN(num)) updates.salarioBase = num;
      }
      if (Object.keys(updates).length > 0) {
        await updateDoc(docRef, updates as Record<string, string | number | Timestamp | ReturnType<typeof deleteField>>);
        const updatedSnap = await getDoc(docRef);
        const updatedData = updatedSnap.exists() ? updatedSnap.data() : data;
        if (assertColaboradorFirestore(updatedData)) {
          return docToDTO(id, updatedData);
        }
      }
      return docToDTO(id, data);
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
