import { RequestHandler, Router } from 'express';
import { EmotionalRecordController } from '../controllers/EmotionalRecordController';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createReflectionRoutes(
  controller: EmotionalRecordController,
  authenticate: RequestHandler
): Router {
  const router = Router();

  router.use(authenticate);
  router.get('/resumo', asyncHandler(controller.getReflectionSummary));

  return router;
}