import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:8081'),
  GEMINI_API_KEY: z.string().min(10, 'GEMINI_API_KEY obrigatória para chamar a IAGen.'),
  GEMINI_MODEL: z.string().min(1).default('gemini-3.5-flash-lite'),
  GEMINI_FALLBACK_MODELS: z.string().optional().default('gemini-3.8-flash'),
});

export type IAGenEnv = z.infer<typeof envSchema>;

export function loadIAGenEnv(): IAGenEnv {
  return envSchema.parse(process.env);
}