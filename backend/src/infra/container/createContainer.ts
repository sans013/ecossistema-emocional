import { Pool } from 'pg';
import { LoginUserUseCase, RegisterUserUseCase } from '../../application/use-cases/AuthUseCases';
import {
  CreateEmotionalRecordUseCase,
  DeleteEmotionalRecordUseCase,
  GetEmotionalRecordUseCase,
  GetReflectionSummaryUseCase,
  ListEmotionalRecordsUseCase,
  UpdateEmotionalRecordUseCase,
} from '../../application/use-cases/EmotionalRecordUseCases';
import {
  AcceptLgpdConsentUseCase,
  DeleteAccountUseCase,
  DeleteAllUserRecordsUseCase,
  ExportUserDataUseCase,
  GetProfileUseCase,
  UpdatePreferencesUseCase,
} from '../../application/use-cases/MeUseCases';
import { AuthController } from '../../presentation/controllers/AuthController';
import { EmotionalRecordController } from '../../presentation/controllers/EmotionalRecordController';
import { MeController } from '../../presentation/controllers/MeController';
import { createAuthenticateMiddleware } from '../../presentation/middlewares/authenticate';
import { createRequireLgpdConsentMiddleware } from '../../presentation/middlewares/requireLgpdConsent';
import { createAuthRoutes } from '../../presentation/routes/authRoutes';
import { createMeRoutes } from '../../presentation/routes/meRoutes';
import { createRecordRoutes } from '../../presentation/routes/recordRoutes';
import { createReflectionRoutes } from '../../presentation/routes/reflectionRoutes';
import { EnvConfig } from '../config/env';
import { PgEmotionalRecordRepository } from '../repositories/PgEmotionalRecordRepository';
import { PgUserRepository } from '../repositories/PgUserRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { JwtTokenService } from '../security/JwtTokenService';

export function createContainer(pool: Pool, env: EnvConfig) {
  const userRepository = new PgUserRepository(pool);
  const recordRepository = new PgEmotionalRecordRepository(pool);
  const passwordHasher = new BcryptPasswordHasher(env.BCRYPT_SALT_ROUNDS);
  const tokenService = new JwtTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

  const authController = new AuthController(
    new RegisterUserUseCase(userRepository, passwordHasher, tokenService),
    new LoginUserUseCase(userRepository, passwordHasher, tokenService)
  );

  const meController = new MeController(
    new GetProfileUseCase(userRepository),
    new AcceptLgpdConsentUseCase(userRepository),
    new UpdatePreferencesUseCase(userRepository),
    new ExportUserDataUseCase(userRepository),
    new DeleteAllUserRecordsUseCase(userRepository),
    new DeleteAccountUseCase(userRepository)
  );

  const recordController = new EmotionalRecordController(
    new CreateEmotionalRecordUseCase(recordRepository),
    new ListEmotionalRecordsUseCase(recordRepository),
    new GetEmotionalRecordUseCase(recordRepository),
    new UpdateEmotionalRecordUseCase(recordRepository),
    new DeleteEmotionalRecordUseCase(recordRepository),
    new GetReflectionSummaryUseCase(recordRepository)
  );

  const authenticate = createAuthenticateMiddleware(tokenService);
  const requireLgpdConsent = createRequireLgpdConsentMiddleware(userRepository);

  return {
    userRepository,
    recordRepository,
    tokenService,
    authenticate,
    requireLgpdConsent,
    authRouter: createAuthRoutes(authController),
    meRouter: createMeRoutes(meController, authenticate),
    recordRouter: createRecordRoutes(recordController, authenticate, requireLgpdConsent),
    reflectionRouter: createReflectionRoutes(recordController, authenticate),
  };
}