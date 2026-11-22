import { Response } from 'express';
import {
  createRecordSchema,
  listRecordsQuerySchema,
  recordIdParamSchema,
  reflectionQuerySchema,
  updateRecordSchema,
} from '../../application/schemas/recordSchemas';
import {
  CreateEmotionalRecordUseCase,
  DeleteEmotionalRecordUseCase,
  GetEmotionalRecordUseCase,
  GetReflectionSummaryUseCase,
  ListEmotionalRecordsUseCase,
  UpdateEmotionalRecordUseCase,
} from '../../application/use-cases/EmotionalRecordUseCases';
import {
  presentEmotionalRecord,
  presentReflectionSummary,
} from '../presenters/recordPresenter';
import { AuthenticatedRequest, getAuthenticatedUserId } from '../types/AuthenticatedRequest';

export class EmotionalRecordController {
  constructor(
    private readonly createUseCase: CreateEmotionalRecordUseCase,
    private readonly listUseCase: ListEmotionalRecordsUseCase,
    private readonly getUseCase: GetEmotionalRecordUseCase,
    private readonly updateUseCase: UpdateEmotionalRecordUseCase,
    private readonly deleteUseCase: DeleteEmotionalRecordUseCase,
    private readonly reflectionUseCase: GetReflectionSummaryUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    const input = createRecordSchema.parse(req.body);
    const created = await this.createUseCase.execute(userId, input);

    res.status(201).json({ registro: presentEmotionalRecord(created) });
  };

  list = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    const filters = listRecordsQuerySchema.parse(req.query);
    const records = await this.listUseCase.execute(userId, filters);

    res.status(200).json({
      registros: records.map(presentEmotionalRecord),
    });
  };

  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    const { id } = recordIdParamSchema.parse(req.params);
    const record = await this.getUseCase.execute(id, userId);

    res.status(200).json({ registro: presentEmotionalRecord(record) });
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    const { id } = recordIdParamSchema.parse(req.params);
    const input = updateRecordSchema.parse(req.body);
    const updated = await this.updateUseCase.execute(id, userId, input);

    res.status(200).json({ registro: presentEmotionalRecord(updated) });
  };

  remove = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    const { id } = recordIdParamSchema.parse(req.params);
    await this.deleteUseCase.execute(id, userId);

    res.status(204).send();
  };

  getReflectionSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = getAuthenticatedUserId(req);
    const { periodo } = reflectionQuerySchema.parse(req.query);
    const summary = await this.reflectionUseCase.execute(userId, periodo);

    res.status(200).json(presentReflectionSummary(summary));
  };
}