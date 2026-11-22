import jwt from 'jsonwebtoken';
import { AppError } from '../../domain/errors/AppError';
import { TokenPayload, TokenService } from '../../domain/services/SecurityServices';

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (typeof decoded !== 'object' || decoded === null || typeof decoded.sub !== 'string') {
        throw new AppError('Token de autenticação inválido.', 401, 'UNAUTHORIZED');
      }
      return { sub: decoded.sub };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError('Token de autenticação inválido ou expirado.', 401, 'UNAUTHORIZED');
    }
  }
}