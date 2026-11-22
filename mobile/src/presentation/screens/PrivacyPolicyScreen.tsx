import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'PrivacyPolicy'>;

export function PrivacyPolicyScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
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
        Política de Privacidade
      </AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Explicação clara e direta sobre como cuidamos dos seus dados sensíveis (LGPD)
      </AppText>

      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          1. Quais dados coletamos
        </AppText>
        <AppText variant="body">
          Coletamos apenas o que você informa para usar o aplicativo: seu nome de exibição, e-mail,
          senha protegida por hash criptográfico, preferências de uso e seus registros emocionais
          (classificados como dados pessoais sensíveis pela Lei nº 13.709/2018).
        </AppText>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          2. Para qual finalidade
        </AppText>
        <AppText variant="body">
          Seus dados são usados exclusivamente para autenticar sua conta, manter seu histórico e
          floricultura semanal salvos, gerar resumos de reflexão e relatórios em PDF para você e
          adaptar a interface às suas escolhas. O aplicativo não realiza diagnóstico nem substitui
          acompanhamento profissional.
        </AppText>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          3. Onde os dados são armazenados
        </AppText>
        <AppText variant="body">
          Seus registros e preferências ficam armazenados no banco de dados PostgreSQL associado à
          sua conta, acessados apenas mediante token JWT, e seu token fica protegido no dispositivo.
        </AppText>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          4. Envio opcional de texto à API de IAGen
        </AppText>
        <AppText variant="body">
          Quando você mantém marcada a opção de mensagem acolhedora ao registrar um estado
          emocional, apenas o nível de humor, os contextos e o texto opcional do relato são enviados
          de forma anonimizada (sem nome, e-mail ou identificador da conta) à API de IAGen (Google
          Gemini) para gerar uma mensagem curta inspirada na flor do dia. Você pode desativar esse
          envio em qualquer registro.
        </AppText>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          5. Sem divulgação a terceiros e seus direitos
        </AppText>
        <AppText variant="body">
          Seus dados não são vendidos nem divulgados a terceiros. A qualquer momento você pode
          baixar seu relatório em PDF, exportar seus dados em JSON, editar ou excluir registros ou
          excluir permanentemente sua conta e todos os seus dados na aba Ajustes.
        </AppText>
      </AppCard>
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
    marginBottom: SPACING.md,
  },
  sectionCard: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 6,
  },
});