import { describe, it, expect } from 'vitest';
import {
  createColaboradorSchema,
  updateColaboradorSchema,
  getFieldErrors,
} from './validation';

const baseValid = {
  nome: 'João Silva',
  email: 'joao@empresa.com',
  departamento: 'dept-id',
  status: 'Ativo' as const,
  cargo: 'Desenvolvedor',
  dataAdmissao: '2024-01-15',
  nivelHierarquico: 'pleno' as const,
  gestorId: 'gestor-id',
  salarioBase: 5000,
};

describe('colaborador validation (Zod)', () => {
  describe('gestorId obrigatório quando nível ≠ gestor', () => {
    it('falha quando nivelHierarquico não é gestor e gestorId está vazio', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        nivelHierarquico: 'junior',
        gestorId: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const gestorIssue = result.error.issues.find(
          (i) => Array.isArray(i.path) && i.path[0] === 'gestorId'
        );
        expect(gestorIssue?.message).toContain('gestor');
      }
    });

    it('falha quando nivelHierarquico é pleno e gestorId é omitido', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        nivelHierarquico: 'pleno',
        gestorId: undefined,
      });
      expect(result.success).toBe(false);
    });

    it('sucesso quando nivelHierarquico não é gestor e gestorId é informado', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        nivelHierarquico: 'senior',
        gestorId: 'gestor-123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('nível = gestor → gestorId ignorado', () => {
    it('aceita gestorId vazio quando nivelHierarquico é gestor', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        nivelHierarquico: 'gestor',
        gestorId: '',
      });
      expect(result.success).toBe(true);
    });

    it('aceita sem gestorId quando nivelHierarquico é gestor', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        nivelHierarquico: 'gestor',
        gestorId: undefined,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('salário > 0', () => {
    it('falha quando salarioBase é zero', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        salarioBase: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => Array.isArray(i.path) && i.path[0] === 'salarioBase'
        );
        expect(issue?.message).toMatch(/maior que zero|positive/i);
      }
    });

    it('falha quando salarioBase é negativo', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        salarioBase: -100,
      });
      expect(result.success).toBe(false);
    });

    it('sucesso quando salarioBase é positivo', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        salarioBase: 0.01,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('data obrigatória', () => {
    it('falha quando dataAdmissao está vazia', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        dataAdmissao: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => Array.isArray(i.path) && i.path[0] === 'dataAdmissao'
        );
        expect(issue?.message).toMatch(/data|admissão/i);
      }
    });
  });

  describe('cargo obrigatório', () => {
    it('falha quando cargo está vazio', () => {
      const result = createColaboradorSchema.safeParse({
        ...baseValid,
        cargo: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issue = result.error.issues.find(
          (i) => Array.isArray(i.path) && i.path[0] === 'cargo'
        );
        expect(issue?.message).toMatch(/cargo/i);
      }
    });
  });

  describe('updateColaboradorSchema', () => {
    it('aplica as mesmas regras de gestorId que create', () => {
      const result = updateColaboradorSchema.safeParse({
        ...baseValid,
        nivelHierarquico: 'junior',
        gestorId: '',
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('getFieldErrors', () => {
  it('retorna objeto vazio quando result.success é true', () => {
    expect(getFieldErrors({ success: true, data: {} })).toEqual({});
  });

  it('retorna erros por path quando result.success é false', () => {
    const result = createColaboradorSchema.safeParse({
      ...baseValid,
      nome: '',
      cargo: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = getFieldErrors({
        success: false,
        error: result.error,
      });
      expect(errors.nome).toBeDefined();
      expect(errors.cargo).toBeDefined();
    }
  });
});
