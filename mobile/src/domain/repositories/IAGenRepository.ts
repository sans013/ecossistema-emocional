import { ContextSlug } from '../entities/EmotionalRecord';

export interface GenerateFlowerMessageParams {
  nivelHumor: number;
  contextos: ContextSlug[];
  pensamento: string | null;
}

export interface FlowerMessageResponse {
  nivelHumor: number;
  flor: string;
  nomeCientifico: string;
  clima: string;
  simbolismo: string;
  mensagem: string;
  geradoEm: string;
}

export interface IAGenRepository {
  generateFlowerMessage(params: GenerateFlowerMessageParams): Promise<FlowerMessageResponse>;
}