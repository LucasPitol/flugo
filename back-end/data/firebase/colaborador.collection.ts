import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { firebaseApp } from './config';
import type {
  ColaboradorDTO,
  CriarColaboradorDTO,
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

const firestore = getFirestore(firebaseApp);
const colaboradoresRef = collection(firestore, COLLECTION_NAME);

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
  async listar(): Promise<ColaboradorDTO[]> {
    try {
      const snapshot = await getDocs(colaboradoresRef);
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
}

export const colaboradorRepositoryFirestore =
  new ColaboradorRepositoryFirestore();
