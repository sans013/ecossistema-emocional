import { Request, Response } from 'express';
import { loginSchema, registerSchema } from '../../application/schemas/authSchemas';
import { LoginUserUseCase, RegisterUserUseCase } from '../../application/use-cases/AuthUseCases';
import { presentPreferences, presentUser } from '../presenters/userPresenter';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const input = registerSchema.parse(req.body);
    const result = await this.registerUserUseCase.execute(input);

    res.status(201).json({
      token: result.token,
      usuario: presentUser(result.usuario),
      ...(result.preferencias ? { preferencias: presentPreferences(result.preferencias) } : {}),
    });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const input = loginSchema.parse(req.body);
    const result = await this.loginUserUseCase.execute(input);

    res.status(200).json({
      token: result.token,
      usuario: presentUser(result.usuario),
    });
  };
}