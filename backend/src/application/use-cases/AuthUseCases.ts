import { PublicUser, toPublicUser, UserPreferences } from '../../domain/entities/User';
import { AppError } from '../../domain/errors/AppError';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { PasswordHasher, TokenService } from '../../domain/services/SecurityServices';
import { LoginInput, RegisterInput } from '../schemas/authSchemas';

export interface AuthResult {
  token: string;
  usuario: PublicUser;
  preferencias?: UserPreferences;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('Já existe uma conta cadastrada com este e-mail.', 409, 'EMAIL_IN_USE');
    }

    const senhaHash = await this.passwordHasher.hash(input.senha);

    const profile = await this.userRepository.createWithDefaultPreferences({
      nomeExibicao: input.nome_exibicao,
      email: input.email,
      senhaHash,
    });

    const token = this.tokenService.sign({ sub: profile.usuario.id });

    return {
      token,
      usuario: profile.usuario,
      preferencias: profile.preferencias,
    };
  }
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError('E-mail ou senha inválidos.', 401, 'INVALID_CREDENTIALS');
    }

    const passwordMatches = await this.passwordHasher.compare(input.senha, user.senhaHash);
    if (!passwordMatches) {
      throw new AppError('E-mail ou senha inválidos.', 401, 'INVALID_CREDENTIALS');
    }

    const token = this.tokenService.sign({ sub: user.id });

    return {
      token,
      usuario: toPublicUser(user),
    };
  }
}