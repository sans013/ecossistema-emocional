import { validateLoginForm, validateRegisterForm } from '../../src/presentation/viewmodels/AuthViewModel';

describe('AuthViewModel validação de formulários', () => {
  it('rejeita login com e-mail inválido ou senha vazia', () => {
    expect(validateLoginForm({ email: 'email-invalido', senha: '123' }).valid).toBe(false);
    expect(validateLoginForm({ email: 'clara.ficticia@exemplo.com', senha: '' }).valid).toBe(false);
    expect(
      validateLoginForm({ email: 'clara.ficticia@exemplo.com', senha: 'SenhaForte123' }).valid
    ).toBe(true);
  });

  it('valida cadastro exigindo nome, e-mail, senha forte e confirmação igual', () => {
    expect(
      validateRegisterForm(
        { nomeExibicao: 'Cl', email: 'clara.ficticia@exemplo.com', senha: '123' },
        '123'
      ).valid
    ).toBe(false);

    expect(
      validateRegisterForm(
        { nomeExibicao: 'Clara Mendes', email: 'clara.ficticia@exemplo.com', senha: 'SenhaForte123' },
        'OutraSenha123'
      ).valid
    ).toBe(false);

    expect(
      validateRegisterForm(
        { nomeExibicao: 'Clara Mendes', email: 'clara.ficticia@exemplo.com', senha: 'SenhaForte123' },
        'SenhaForte123'
      ).valid
    ).toBe(true);
  });
});