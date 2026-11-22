import { Pool } from 'pg';
import { LoginUserUseCase, RegisterUserUseCase } from '../../application/use-cases/AuthUseCases';
import {
  AcceptLgpdConsentUseCase,
  DeleteAccountUseCase,
  DeleteAllUserRecordsUseCase,
  ExportUserDataUseCase,
  GetProfileUseCase,
  UpdatePreferencesUseCase,
} from '../../application/use-cases/MeUseCases';
import { AuthController } from '../../presentation/controllers/AuthController';
import { MeController } from '../../presentation/controllers/MeController';
import { createAuthenticateMiddleware } from '../../presentation/middlewares/authenticate';
import { createAuthRoutes } from '../../presentation/routes/authRoutes';
import { createMeRoutes } from '../../presentation/routes/meRoutes';
import { EnvConfig } from '../config/env';
import { PgUserRepository } from '../repositories/PgUserRepository';
import { BcryptPasswordHasher } from '../security/BcryptPasswordHasher';
import { JwtTokenService } from '../security/JwtTokenService';

export function createContainer(pool: Pool, env: EnvConfig) {
  const userRepository = new PgUserRepository(pool);
  const passwordHasher = new BcryptPasswordHasher(env.BCRYPT_SALT_ROUNDS);
  const tokenService = new JwtTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenService);
  const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService);

  const getProfileUseCase = new GetProfileUseCase(userRepository);
  const acceptLgpdConsentUseCase = new AcceptLgpdConsentUseCase(userRepository);
  const updatePreferencesUseCase = new UpdatePreferencesUseCase(userRepository);
  const exportUserDataUseCase = new ExportUserDataUseCase(userRepository);
  const deleteAllUserRecordsUseCase = new DeleteAllUserRecordsUseCase(userRepository);
  const deleteAccountUseCase = new DeleteAccountUseCase(userRepository);

  const authController = new AuthController(registerUserUseCase, loginUserUseCase);
  const meController = new MeController(
    getProfileUseCase,
    acceptLgpdConsentUseCase,
    updatePreferencesUseCase,
    exportUserDataUseCase,
    deleteAllUserRecordsUseCase,
    deleteAccountUseCase
  );

  const authenticate = createAuthenticateMiddleware(tokenService);

  return {
    userRepository,
    tokenService,
    authenticate,
    authRouter: createAuthRoutes(authController),
    meRouter: createMeRoutes(meController, authenticate),
  };
}