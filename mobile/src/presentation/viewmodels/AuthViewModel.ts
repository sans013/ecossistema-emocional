import { LoginParams, RegisterParams } from '../../domain/repositories/AuthRepository';

export interface AuthFormValidation {
  valid: boolean;
  errorMessage?: string;
}

export function validateLoginForm(params: LoginParams): AuthFormValidation {
  const email = params.email.trim();
  if (!email || !email.includes('@')) {
    return { valid: false, errorMessage: 'Informe um e-mail válido.' };
  }
  if (!params.senha) {
    return { valid: false, errorMessage: 'Informe sua senha.' };
  }
  return { valid: true };
}

export function validateRegisterForm(
  params: RegisterParams,
  confirmPassword: string
): AuthFormValidation {
  const nome = params.nomeExibicao.trim();
  const email = params.email.trim();

  if (nome.length < 2) {
    return {
      valid: false,
      errorMessage: 'Informe como prefere ser chamado(a) (mínimo 2 caracteres).',
    };
  }
  if (!email || !email.includes('@')) {
    return { valid: false, errorMessage: 'Informe um e-mail válido.' };
  }
  if (params.senha.length < 8) {
    return {
      valid: false,
      errorMessage: 'Use pelo menos 8 caracteres, incluindo letras e números.',
    };
  }
  if (!/[A-Za-z]/.test(params.senha) || !/[0-9]/.test(params.senha)) {
    return {
      valid: false,
      errorMessage: 'A senha precisa ter pelo menos uma letra e um número.',
    };
  }
  if (params.senha !== confirmPassword) {
    return {
      valid: false,
      errorMessage: 'A confirmação de senha não confere.',
    };
  }

  return { valid: true };
}