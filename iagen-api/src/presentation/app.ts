import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import { z } from 'zod';
import {
  findFlowerByMood,
  LoadedMaterials,
} from '../domain/FlowerMaterialLoader';
import { buildGroundedPrompt } from '../domain/PromptBuilder';
import { GenerativeAIClient } from '../infra/GeminiClient';

const messageRequestSchema = z.object({
  nivel_humor: z.number().int().min(1).max(5),
  contextos: z
    .array(z.enum(['sono', 'estudo', 'trabalho', 'descanso', 'relacoes']))
    .max(5)
    .optional()
    .default([]),
  pensamento: z.string().trim().max(1000).nullable().optional().default(null),
});

export interface CreateIAGenAppOptions {
  corsOrigin: string;
  materials: LoadedMaterials;
  aiClient: GenerativeAIClient;
}

export function createIAGenApp(options: CreateIAGenAppOptions): Express {
  const app = express();

  const allowedOrigins = options.corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origem bloqueada por CORS'));
      },
    })
  );
  app.use(express.json({ limit: '50kb' }));

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'iagen-api',
      materiais_carregados: options.materials.flores.length,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/v1/materiais', (_req: Request, res: Response) => {
    res.status(200).json({
      flores: options.materials.flores,
      diretrizes: options.materials.diretrizes,
    });
  });

  app.post('/api/v1/mensagem-flor', async (req: Request, res: Response) => {
    const parsed = messageRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos para gerar a mensagem da flor.',
          details: parsed.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const { nivel_humor, contextos, pensamento } = parsed.data;
    const flower = findFlowerByMood(options.materials.flores, nivel_humor);
    const prompt = buildGroundedPrompt(
      { nivelHumor: nivel_humor, contextos, pensamento },
      flower,
      options.materials.diretrizes
    );

    try {
      const mensagem = await options.aiClient.generateText(prompt);

      res.status(200).json({
        nivel_humor: flower.nivelHumor,
        flor: flower.flor,
        nome_cientifico: flower.nomeCientifico,
        clima: flower.clima,
        simbolismo: flower.simbolismo,
        mensagem,
        gerado_em: new Date().toISOString(),
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(JSON.stringify({ level: 'error', service: 'iagen-api', detail }));
      res.status(502).json({
        error: {
          code: 'IAGEN_UNAVAILABLE',
          message: 'Não foi possível gerar a mensagem personalizada agora. Tente novamente.',
        },
      });
    }
  });

  return app;
}