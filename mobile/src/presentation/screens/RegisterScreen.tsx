import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../data/http/HttpClient';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { InputField } from '../components/InputField';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AuthStackParamList } from '../types/navigation';
import { validateRegisterForm } from '../viewmodels/AuthViewModel';
import { useSession } from '../viewmodels/SessionContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register, isConnected } = useSession();

  const [nomeExibicao, setNomeExibicao] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);

    const check = validateRegisterForm(
      { nomeExibicao, email, senha },
      confirmarSenha
    );
    if (!check.valid) {
      setErrorMessage(check.errorMessage ?? 'Verifique os campos preenchidos.');
      return;
    }

    setSubmitting(true);
    try {
      await register(nomeExibicao.trim(), email.trim().toLowerCase(), senha);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Não foi possível concluir o cadastro agora.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ConnectionBanner isConnected={isConnected} />

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        hitSlop={8}
      >
        <View style={styles.backCircle}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </View>
        <AppText variant="cardTitle">Voltar</AppText>
      </Pressable>

      <AppText variant="title" style={styles.title}>
        Criar sua conta
      </AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Leva menos de um minuto, sem pressa
      </AppText>

      <InputField
        label="Como prefere ser chamado(a)?"
        leftIcon="person-outline"
        placeholder="Clara Mendes"
        value={nomeExibicao}
        onChangeText={setNomeExibicao}
      />

      <InputField
        label="E-mail"
        leftIcon="mail-outline"
        placeholder="clara.ficticia@exemplo.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
      />

      <InputField
        label="Senha"
        leftIcon="lock-closed-outline"
        placeholder="Crie uma senha"
        isPassword
        autoCapitalize="none"
        helperText="Dica: use 8+ caracteres com letras e números. Guarde com carinho."
        value={senha}
        onChangeText={setSenha}
      />

      <InputField
        label="Confirmar senha"
        leftIcon="lock-closed-outline"
        placeholder="Repita sua senha"
        isPassword
        autoCapitalize="none"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      {errorMessage && (
        <AppCard style={styles.errorBox}>
          <AppText variant="caption" color={COLORS.danger}>
            {errorMessage}
          </AppText>
        </AppCard>
      )}

      <AppButton
        label="Cadastrar"
        loading={submitting}
        onPress={() => void handleRegister()}
        style={styles.submitBtn}
      />

      <AppText variant="caption" style={styles.footerNote}>
        Ao continuar, pediremos seu consentimento para guardar seus registros com segurança.
      </AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
    minHeight: 44,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: SPACING.lg,
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
    marginBottom: SPACING.md,
  },
  submitBtn: {
    marginBottom: SPACING.md,
  },
  footerNote: {
    textAlign: 'center',
  },
});