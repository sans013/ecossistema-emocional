import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { validateLoginForm } from '../viewmodels/AuthViewModel';
import { useSession } from '../viewmodels/SessionContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login, isConnected } = useSession();

  const [email, setEmail] = useState('clara.ficticia@exemplo.com');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    const check = validateLoginForm({ email, senha });
    if (!check.valid) {
      setErrorMessage(check.errorMessage ?? 'Verifique os campos informados.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), senha);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Não foi possível entrar agora. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ConnectionBanner isConnected={isConnected} />

      <View style={styles.header}>
        <View style={styles.brandBadge}>
          <Ionicons name="leaf" size={28} color={COLORS.textOnPrimary} />
        </View>
        <AppText variant="caption" style={styles.brandName}>
          Ecossistema Emocional
        </AppText>
        <AppText variant="title" style={styles.title}>
          Que bom ver você de volta
        </AppText>
        <AppText variant="subtitle" style={styles.subtitle}>
          Continue cuidando do seu jardim interior
        </AppText>
      </View>

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
        placeholder="Digite sua senha"
        isPassword
        autoCapitalize="none"
        value={senha}
        onChangeText={setSenha}
      />

      <View style={styles.forgotRow}>
        <AppText
          variant="caption"
          color={COLORS.primaryDark}
          style={styles.linkText}
          onPress={() =>
            setInfoMessage(
              'Para redefinir sua senha com segurança, utilize a opção de recuperação vinculada ao seu cadastro ou crie uma nova conta.'
            )
          }
        >
          Esqueci minha senha
        </AppText>
      </View>

      {infoMessage && (
        <AppCard style={styles.infoBox}>
          <AppText variant="caption" color={COLORS.primaryDark}>
            {infoMessage}
          </AppText>
        </AppCard>
      )}

      {errorMessage && (
        <AppCard style={styles.errorBox}>
          <AppText variant="caption" color={COLORS.danger}>
            {errorMessage}
          </AppText>
        </AppCard>
      )}

      <AppButton
        label="Entrar"
        loading={submitting}
        onPress={() => void handleLogin()}
        style={styles.primaryBtn}
      />

      <AppButton
        label="Criar minha conta"
        variant="outlined"
        disabled={submitting}
        onPress={() => navigation.navigate('Register')}
      />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <AppText variant="caption" style={styles.dividerLabel}>
          acesso protegido
        </AppText>
        <View style={styles.dividerLine} />
      </View>

      <AppCard style={styles.privacyNote}>
        <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
        <AppText variant="caption" style={styles.privacyText}>
          Seus registros ficam só com você. Nunca compartilhamos com terceiros.
        </AppText>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  brandBadge: {
    width: 56,
    height: 56,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  brandName: {
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -6,
    marginBottom: SPACING.md,
  },
  linkText: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  infoBox: {
    backgroundColor: COLORS.primarySoft,
    marginBottom: SPACING.md,
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
    marginBottom: SPACING.md,
  },
  primaryBtn: {
    marginBottom: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerLabel: {
    textTransform: 'lowercase',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.primarySoft,
  },
  privacyText: {
    flex: 1,
  },
});