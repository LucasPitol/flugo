/**
 * Schema de validação dos formulários de colaborador (criação e edição).
 * Mensagens de erro orientadas ao usuário.
 */

import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const nivelHierarquicoEnum = z.enum(['junior', 'pleno', 'senior', 'gestor'], 'Selecione o nível hierárquico.');

const baseColaboradorSchema = z.object({
  nome: z
    .string()
    .min(1, 'Informe o nome.')
    .transform((s) => s.trim())
    .pipe(z.string().min(1, 'Informe o nome.')),
  email: z
    .string()
    .min(1, 'Informe o e-mail.')
    .transform((s) => s.trim())
    .pipe(
      z.string().regex(EMAIL_REGEX, 'Informe um e-mail válido.')
    ),
  departamento: z
    .string()
    .min(1, 'Selecione o departamento.'),
  status: z.enum(['Ativo', 'Inativo'], 'Selecione o status.'),
  cargo: z
    .string()
    .min(1, 'Informe o cargo.'),
  dataAdmissao: z
    .string()
    .min(1, 'Informe a data de admissão.'),
  nivelHierarquico: nivelHierarquicoEnum,
  gestorId: z.string().optional(),
  salarioBase: z
    .number('Informe o salário base.')
    .positive('O salário base deve ser maior que zero.'),
}).superRefine((data, ctx) => {
  if (data.nivelHierarquico !== 'gestor') {
    const gestorId = (data.gestorId ?? '').trim();
    if (!gestorId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['gestorId'],
        message: 'Informe o gestor. Obrigatório para níveis que não sejam gestor.',
      });
    }
  }
});

export const createColaboradorSchema = baseColaboradorSchema;

export const updateColaboradorSchema = baseColaboradorSchema;

export type CreateColaboradorFormValues = z.infer<typeof createColaboradorSchema>;
export type UpdateColaboradorFormValues = z.infer<typeof updateColaboradorSchema>;

/** Retorna erros por campo para exibição na UI. */
export function getFieldErrors(
  result:
    | { success: true; data: unknown }
    | { success: false; error: { issues: Array<{ path: Array<string | number | symbol>; message: string }> } }
): Record<string, string> {
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.map(String).join('.');
    if (path && !errors[path]) {
      errors[path] = issue.message;
    }
  }
  return errors;
}
