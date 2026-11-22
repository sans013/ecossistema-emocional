import { z } from 'zod';
import { ContextSlug, VALID_CONTEXT_SLUGS } from '../../domain/entities/EmotionalRecord';

const contextSlugSchema = z.enum(VALID_CONTEXT_SLUGS);

const recordBodySchema = z.object({
  nivel_humor: z
    .number()
    .int('O nível de humor deve ser um número inteiro.')
    .min(1, 'O nível de humor deve estar entre 1 e 5.')
    .max(5, 'O nível de humor deve estar entre 1 e 5.'),
  contextos: z
    .array(contextSlugSchema)
    .max(VALID_CONTEXT_SLUGS.length)
    .optional()
    .default([])
    .transform((items): ContextSlug[] => Array.from(new Set(items))),
  pensamento: z
    .string()
    .trim()
    .max(1000, 'O pensamento pode ter no máximo 1000 caracteres.')
    .nullable()
    .optional()
    .transform((val) => (!val || val.length === 0 ? null : val)),
});

export const createRecordSchema = recordBodySchema;
export const updateRecordSchema = recordBodySchema;

export const recordIdParamSchema = z.object({
  id: z.string().uuid('Identificador de registro inválido.'),
});

export const listRecordsQuerySchema = z.object({
  contexto: contextSlugSchema.optional(),
  dias: z.coerce.number().int().min(1).max(365).optional(),
});

export const reflectionQuerySchema = z.object({
  periodo: z
    .enum(['7', '30'])
    .optional()
    .default('7')
    .transform((val): 7 | 30 => (val === '30' ? 30 : 7)),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type ListRecordsQuery = z.infer<typeof listRecordsQuerySchema>;