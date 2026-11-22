import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../data/http/HttpClient';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppStackParamList } from '../types/navigation';
import { useSession } from '../viewmodels/SessionContext';

export function LgpdConsentScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { acceptLgpdConsent, logout, isConnected } = useSession();

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!accepted) {
      setErrorMessage('Marque a caixa de concordância para continuar.');
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);
    try {
      await acceptLgpdConsent();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Não foi possível salvar seu consentimento agora.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ConnectionBanner isConnected={isConnected} />

      <View style={styles.topBar}>
        <AppText
          variant="caption"
          color={COLORS.textSecondary}
          style={styles.logoutLink}
          onPress={() => void logout()}
        >
          Sair da conta
        </AppText>
      </View>

      <View style={styles.header}>
        <View style={styles.shieldCircle}>
          <Ionicons name="shield-checkmark-outline" size={28} color={COLORS.primary} />
        </View>
        <AppText variant="title" style={styles.title}>
          Seus dados são seus
        </AppText>
        <AppText variant="subtitle" style={styles.subtitle}>
          Aviso sobre dados pessoais sensíveis (LGPD — Lei nº 13.709/2018)
        </AppText>
      </View>

      <AppCard style={styles.card}>
        <View style={styles.cardIntro}>
          <Ionicons name="leaf-outline" size={22} color={COLORS.primary} />
          <AppText variant="body" style={styles.cardIntroText}>
            Este aplicativo pode armazenar informações sensíveis sobre o seu bem-estar emocional, exclusivamente para apoiar o seu autoconhecimento e reflexão pessoal.
          </AppText>
        </View>

        <View style={styles.bulletRow}>
          <Ionicons name="checkmark" size={18} color={COLORS.primary} />
          <AppText variant="body" style={styles.bulletText}>
            Senhas criptografadas e acesso restrito por token apenas à sua conta
          </AppText>
        </View>

        <View style={styles.bulletRow}>
          <Ionicons name="checkmark" size={18} color={COLORS.primary} />
          <AppText variant="body" style={styles.bulletText}>
            Envio opcional e anonimizado do relato à API de IAGen para gerar mensagens da flor
          </AppText>
        </View>

        <View style={styles.bulletRow}>
          <Ionicons name="checkmark" size={18} color={COLORS.primary} />
          <AppText variant="body" style={styles.bulletText}>
            Nunca divulgados a terceiros; você pode exportar em PDF ou excluir sua conta quando quiser
          </AppText>
        </View>

        <Pressable
          accessibilityRole="link"
          onPress={() => navigation.navigate('PrivacyPolicy')}
          style={styles.policyLinkRow}
          hitSlop={6}
        >
          <AppText variant="body" color={COLORS.primaryDark} style={styles.policyLink}>
            Ler Política de Privacidade
          </AppText>
          <Ionicons name="open-outline" size={16} color={COLORS.primaryDark} />
        </Pressable>
      </AppCard>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => {
          setErrorMessage(null);
          setAccepted((prev) => !prev);
        }}
        style={[
          styles.checkboxCard,
          accepted && styles.checkboxCardChecked,
        ]}
      >
        <View style={[styles.checkboxBox, accepted && styles.checkboxBoxChecked]}>
          {accepted && <Ionicons name="checkmark" size={16} color={COLORS.textOnPrimary} />}
        </View>
        <AppText variant="body" style={styles.checkboxText}>
          Li e concordo com o armazenamento seguro dos meus registros emocionais
        </AppText>
      </Pressable>

      <AppText variant="caption" style={styles.uncheckedNote}>
        Caixa desmarcada por padrão — a escolha é sempre sua
      </AppText>

      {errorMessage && (
        <AppCard style={styles.errorBox}>
          <AppText variant="caption" color={COLORS.danger}>
            {errorMessage}
          </AppText>
        </AppCard>
      )}

      <AppButton
        label="Concordar e começar"
        disabled={!accepted}
        loading={submitting}
        onPress={() => void handleConfirm()}
        style={styles.confirmBtn}
      />

      <AppText variant="caption" style={styles.bottomHint}>
        {accepted ? 'Consentimento pronto para ser salvo.' : 'Marque a caixa acima para continuar'}
      </AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  logoutLink: {
    textDecorationLine: 'underline',
    paddingVertical: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  shieldCircle: {
    width: 56,
    height: 56,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardIntro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: SPACING.md,
  },
  cardIntroText: {
    flex: 1,
    fontWeight: '500',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  bulletText: {
    flex: 1,
  },
  policyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 4,
  },
  policyLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    padding: SPACING.md,
    minHeight: 56,
  },
  checkboxCardChecked: {
    backgroundColor: COLORS.primarySoft,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    fontWeight: '500',
  },
  uncheckedNote: {
    marginTop: 6,
    marginBottom: SPACING.md,
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
    marginBottom: SPACING.md,
  },
  confirmBtn: {
    marginBottom: 8,
  },
  bottomHint: {
    textAlign: 'center',
  },
});