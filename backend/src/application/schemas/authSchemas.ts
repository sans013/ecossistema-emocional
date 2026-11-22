import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres.')
  .max(72, 'A senha deve ter no máximo 72 caracteres.')
  .regex(/[A-Za-z]/, 'A senha deve conter pelo menos uma letra.')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número.');

export const registerSchema = z.object({
  nome_exibicao: z
    .string()
    .trim()
    .min(2, 'Informe como prefere ser chamado(a) (mínimo 2 caracteres).')
    .max(80, 'O nome pode ter no máximo 80 caracteres.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Informe um e-mail válido.')
    .max(255),
  senha: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.'),
  senha: z.string().min(1, 'Informe sua senha.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;