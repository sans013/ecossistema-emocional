import {
  EmotionalRecord,
  ReflectionSummary,
} from '../../domain/entities/EmotionalRecord';
import { AppError } from '../../domain/errors/AppError';
import {
  EmotionalRecordRepository,
  ListEmotionalRecordsFilter,
} from '../../domain/repositories/EmotionalRecordRepository';
import { CreateRecordInput, UpdateRecordInput } from '../schemas/recordSchemas';

export class CreateEmotionalRecordUseCase {
  constructor(private readonly recordRepository: EmotionalRecordRepository) {}

  async execute(userId: string, input: CreateRecordInput): Promise<EmotionalRecord> {
    return this.recordRepository.create({
      usuarioId: userId,
      nivelHumor: input.nivel_humor,
      contextos: input.contextos,
      pensamento: input.pensamento,
    });
  }
}

export class ListEmotionalRecordsUseCase {
  constructor(private readonly recordRepository: EmotionalRecordRepository) {}

  async execute(
    userId: string,
    filters?: ListEmotionalRecordsFilter
  ): Promise<EmotionalRecord[]> {
    return this.recordRepository.findAllByUser(userId, filters);
  }
}

export class GetEmotionalRecordUseCase {
  constructor(private readonly recordRepository: EmotionalRecordRepository) {}

  async execute(id: string, userId: string): Promise<EmotionalRecord> {
    const record = await this.recordRepository.findByIdAndUser(id, userId);
    if (!record) {
      throw new AppError('Registro emocional não encontrado.', 404, 'RECORD_NOT_FOUND');
    }
    return record;
  }
}

export class UpdateEmotionalRecordUseCase {
  constructor(private readonly recordRepository: EmotionalRecordRepository) {}

  async execute(
    id: string,
    userId: string,
    input: UpdateRecordInput
  ): Promise<EmotionalRecord> {
    const updated = await this.recordRepository.update(id, userId, {
      nivelHumor: input.nivel_humor,
      contextos: input.contextos,
      pensamento: input.pensamento,
    });

    if (!updated) {
      throw new AppError('Registro emocional não encontrado.', 404, 'RECORD_NOT_FOUND');
    }
    return updated;
  }
}

export class DeleteEmotionalRecordUseCase {
  constructor(private readonly recordRepository: EmotionalRecordRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const deleted = await this.recordRepository.delete(id, userId);
    if (!deleted) {
      throw new AppError('Registro emocional não encontrado.', 404, 'RECORD_NOT_FOUND');
    }
  }
}

export class GetReflectionSummaryUseCase {
  constructor(private readonly recordRepository: EmotionalRecordRepository) {}

  async execute(userId: string, periodoDias: 7 | 30): Promise<ReflectionSummary> {
    return this.recordRepository.getReflectionSummary(userId, periodoDias);
  }
}