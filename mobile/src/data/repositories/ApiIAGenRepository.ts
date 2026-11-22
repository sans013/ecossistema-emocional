import {
  FlowerMessageResponse,
  GenerateFlowerMessageParams,
  IAGenRepository,
} from '../../domain/repositories/IAGenRepository';

interface RawFlowerMessageResponse {
  nivel_humor: number;
  flor: string;
  nome_cientifico: string;
  clima: string;
  simbolismo: string;
  mensagem: string;
  gerado_em: string;
}

export class ApiIAGenRepository implements IAGenRepository {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    const configured =
      baseUrl ??
      process.env.EXPO_PUBLIC_IAGEN_API_URL ??
      'http://localhost:3001/api/v1';
    this.baseUrl = configured.replace(/\/+$/, '');
  }

  async generateFlowerMessage(
    params: GenerateFlowerMessageParams
  ): Promise<FlowerMessageResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 35_000);

    try {
      const response = await fetch(`${this.baseUrl}/mensagem-flor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nivel_humor: params.nivelHumor,
          contextos: params.contextos,
          pensamento: params.pensamento,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`API de IAGen indisponível (HTTP ${response.status}).`);
      }

      const data = (await response.json()) as RawFlowerMessageResponse;
      return {
        nivelHumor: data.nivel_humor,
        flor: data.flor,
        nomeCientifico: data.nome_cientifico,
        clima: data.clima,
        simbolismo: data.simbolismo,
        mensagem: data.mensagem,
        geradoEm: data.gerado_em,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}