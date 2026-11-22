export interface GenerativeAIClient {
  generateText(prompt: string): Promise<string>;
}

interface GeminiResponsePayload {
  candidates?: Array<{
    finishReason?: string;
    content?: {
      parts?: Array<{ text?: string; thought?: boolean }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

const RETRYABLE_STATUS = new Set([429, 500, 503, 504]);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class GeminiClient implements GenerativeAIClient {
  private readonly models: string[];

  constructor(
    private readonly apiKey: string,
    primaryModel: string,
    fallbackModels: string[] = [],
    private readonly fetchImpl: typeof fetch = (input, init) => globalThis.fetch(input, init)
  ) {
    this.models = [primaryModel, ...fallbackModels]
      .map((m) => m.replace(/^models\//, '').trim())
      .filter((m, idx, arr) => m.length > 0 && arr.indexOf(m) === idx);
  }

  async generateText(prompt: string): Promise<string> {
    let lastError: Error = new Error('Nenhum modelo configurado para a API do Gemini.');

    for (const model of this.models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          return await this.requestModel(model, prompt);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          const isRetryable = (error as { retryable?: boolean })?.retryable === true;
          if (isRetryable && attempt < 2) {
            await wait(1500);
            continue;
          }
          break;
        }
      }
    }

    throw lastError;
  }

  private async requestModel(model: string, prompt: string): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await this.fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as GeminiResponsePayload;

      if (!response.ok) {
        const detail = payload.error?.message ?? `HTTP ${response.status}`;
        const err = new Error(`Falha na API do Gemini (${model}): ${detail}`) as Error & {
          retryable?: boolean;
        };
        err.retryable = RETRYABLE_STATUS.has(response.status);
        throw err;
      }

      const candidate = payload.candidates?.[0];
      const text = candidate?.content?.parts
        ?.filter((part) => !part.thought)
        .map((part) => part.text ?? '')
        .join('')
        .trim();

      if (!text) {
        throw new Error(
          `A API do Gemini (${model}) retornou uma resposta vazia (finishReason: ${
            candidate?.finishReason ?? 'desconhecido'
          }).`
        );
      }

      return text;
    } finally {
      clearTimeout(timer);
    }
  }
}