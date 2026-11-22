import { z } from 'zod';

const VALID_MOOD_KEYS = new Set(['1', '2', '3', '4', '5']);

export const consentSchema = z.object({
  aceito: z.literal(true, {
    message: 'É necessário confirmar explicitamente o consentimento LGPD.',
  }),
});

export const updatePreferencesSchema = z
  .object({
    // Personalização
    nivel_ecossistema: z.enum(['desativada', 'suave', 'completa']).optional(),
    rotulos_humor_custom: z
      .record(z.string(), z.string().trim().min(1).max(40))
      .refine((obj) => Object.keys(obj).every((k) => VALID_MOOD_KEYS.has(k)), {
        message: 'Os rótulos customizados devem usar chaves de 1 a 5.',
      })
      .optional(),
    lembretes_ativos: z.boolean().optional(),
    lembretes_turnos: z.array(z.enum(['manha', 'tarde', 'noite'])).max(3).optional(),
    // Acessibilidade (independente da personalização)
    tamanho_fonte: z.enum(['padrao', 'grande', 'extra_grande']).optional(),
    rotulos_sempre_visiveis: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Envie ao menos uma preferência para atualizar.',
  });

export type ConsentInput = z.infer<typeof consentSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;