import { FlowerMaterial } from './FlowerMaterialLoader';

export interface FlowerMessageInput {
  nivelHumor: number;
  contextos: string[];
  pensamento: string | null;
}

export function buildGroundedPrompt(
  input: FlowerMessageInput,
  flower: FlowerMaterial,
  guidelines: string
): string {
  const contextsText =
    input.contextos.length > 0 ? input.contextos.join(', ') : 'Nenhum contexto específico informado';
  const thoughtText =
    input.pensamento && input.pensamento.trim().length > 0
      ? input.pensamento.trim()
      : 'O usuário optou por um registro rápido sem texto adicional.';

  return [
    '=== DIRETRIZES DO APLICATIVO ===',
    guidelines.trim(),
    '',
    '=== MATERIAL BOTÂNICO SELECIONADO ===',
    `Humor selecionado: ${flower.rotuloPadrao} (nível ${flower.nivelHumor}/5)`,
    `Clima do dia: ${flower.clima}`,
    `Flor do dia: ${flower.flor} (${flower.nomeCientifico})`,
    `Simbolismo: ${flower.simbolismo}`,
    `Tom recomendado: ${flower.tomRecomendado}`,
    `Foco prático: ${flower.focoPratico}`,
    '',
    '=== DADOS ANONIMIZADOS DO REGISTRO ===',
    `Contextos: ${contextsText}`,
    `Relato do usuário: ${thoughtText}`,
    '',
    'Escreva agora apenas a mensagem final de acolhimento (2 a 3 frases curtas, em português do Brasil, mencionando a flor do dia com naturalidade).',
  ].join('\n');
}