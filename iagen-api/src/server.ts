import { loadIAGenEnv } from './config/env';
import { loadMaterials } from './domain/FlowerMaterialLoader';
import { GeminiClient } from './infra/GeminiClient';
import { createIAGenApp } from './presentation/app';

const env = loadIAGenEnv();
const materials = loadMaterials();
const fallbackModels = env.GEMINI_FALLBACK_MODELS.split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const aiClient = new GeminiClient(env.GEMINI_API_KEY, env.GEMINI_MODEL, fallbackModels);

const app = createIAGenApp({
  corsOrigin: env.CORS_ORIGIN,
  materials,
  aiClient,
});

const server = app.listen(env.PORT, () => {
  console.info(
    JSON.stringify({
      level: 'info',
      service: 'iagen-api',
      message: `API de IAGen rodando na porta ${env.PORT}`,
      model: env.GEMINI_MODEL,
      fallbackModels,
      flowersLoaded: materials.flores.length,
    })
  );
});

const shutdown = (signal: string) => {
  console.info(JSON.stringify({ level: 'info', service: 'iagen-api', message: `Encerrando (${signal})` }));
  server.close(() => process.exit(0));
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));