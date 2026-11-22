import { RequestHandler, Router } from 'express';
import { MeController } from '../controllers/MeController';
import { asyncHandler } from '../middlewares/asyncHandler';

export function createMeRoutes(controller: MeController, authenticate: RequestHandler): Router {
  const router = Router();

  router.use(authenticate);

  router.get('/', asyncHandler(controller.getProfile));
  router.post('/consent', asyncHandler(controller.acceptConsent));
  router.patch('/preferences', asyncHandler(controller.updatePreferences));
  router.get('/export', asyncHandler(controller.exportData));
  router.delete('/registros', asyncHandler(controller.deleteAllRecords));
  router.delete('/', asyncHandler(controller.deleteAccount));

  return router;
}