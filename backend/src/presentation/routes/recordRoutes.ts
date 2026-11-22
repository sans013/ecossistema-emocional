import { RequestHandler, Router } from 'express';
import { EmotionalRecordController } from '../controllers/EmotionalRecordController';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createRecordRoutes(
  controller: EmotionalRecordController,
  authenticate: RequestHandler,
  requireLgpdConsent: RequestHandler
): Router {
  const router = Router();

  router.use(authenticate);

  router.post('/', requireLgpdConsent, asyncHandler(controller.create));
  router.get('/', asyncHandler(controller.list));
  router.get('/:id', asyncHandler(controller.getById));
  router.put('/:id', asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.remove));

  return router;
}