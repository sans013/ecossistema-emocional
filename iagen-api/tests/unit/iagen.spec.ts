import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { loadMaterials } from '../../src/domain/FlowerMaterialLoader';
import { buildGroundedPrompt } from '../../src/domain/PromptBuilder';
import { GenerativeAIClient } from '../../src/infra/GeminiClient';
import { createIAGenApp } from '../../src/presentation/app';

describe('API de IAGen - Materiais e Geração de Mensagem', () => {
  const materials = loadMaterials();

  it('carrega as 5 flores reais e as diretrizes éticas da pasta materiais/', () => {
    expect(materials.flores).toHaveLength(5);
    expect(materials.flores.map((f) => f.flor)).toEqual([
      'Lírio-da-paz',
      'Lavanda',
      'Camomila',
      'Margarida',
      'Girassol',
    ]);
    expect(materials.diretrizes).toContain('CVV');
  });

  it('monta prompt fundamentado nos materiais sem dados identificadores', () => {
    const flower = materials.flores[3];
    const prompt = buildGroundedPrompt(
      { nivelHumor: 4, contextos: ['estudo'], pensamento: 'Terminei a leitura com calma.' },
      flower,
      materials.diretrizes
    );

    expect(prompt).toContain('Margarida');
    expect(prompt).toContain('Sol ameno');
    expect(prompt).toContain('Terminei a leitura com calma.');
  });

  it('retorna mensagem personalizada gerada pela IAGen e expõe /health e /api/v1/materiais', async () => {
    const fakeAiClient: GenerativeAIClient = {
      generateText: vi.fn(
        async () =>
          'Como uma lavanda sob a névoa, você pode descansar sem cobrança hoje. Um respiro curto já cuida do seu ritmo.'
      ),
    };

    const app = createIAGenApp({
      corsOrigin: 'http://localhost:8081',
      materials,
      aiClient: fakeAiClient,
    });

    const health = await request(app).get('/health');
    expect(health.status).toBe(200);
    expect(health.body.materiais_carregados).toBe(5);

    const res = await request(app).post('/api/v1/mensagem-flor').send({
      nivel_humor: 2,
      contextos: ['sono', 'estudo'],
      pensamento: 'Dia cansativo depois de dormir pouco.',
    });

    expect(res.status).toBe(200);
    expect(res.body.flor).toBe('Lavanda');
    expect(res.body.clima).toBe('Névoa');
    expect(res.body.mensagem).toContain('lavanda');
    expect(fakeAiClient.generateText).toHaveBeenCalledTimes(1);
  });

  it('rejeita requisição com nivel_humor fora de 1..5', async () => {
    const fakeAiClient: GenerativeAIClient = { generateText: vi.fn() };
    const app = createIAGenApp({
      corsOrigin: 'http://localhost:8081',
      materials,
      aiClient: fakeAiClient,
    });

    const res = await request(app).post('/api/v1/mensagem-flor').send({ nivel_humor: 9 });
    expect(res.status).toBe(400);
    expect(fakeAiClient.generateText).not.toHaveBeenCalled();
  });
});