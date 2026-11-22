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
        Explicação clara e direta sobre como cuidamos dos seus dados (LGPD)
      </AppText>

      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          1. Quais dados coletamos
        </AppText>
        <AppText variant="body">
          Coletamos apenas o que você informa para usar o aplicativo: seu nome de exibição, e-mail,
          senha protegida por hash, preferências de uso e seus registros emocionais (estado,
          contextos e anotações opcionais).
        </AppText>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          2. Para qual finalidade
        </AppText>
        <AppText variant="body">
          Seus dados são usados exclusivamente para autenticar sua conta, manter seu histórico e
          preferências salvos, gerar resumos de reflexão para você e adaptar a interface às suas
          escolhas.
        </AppText>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          3. Onde os dados são armazenados
        </AppText>
        <AppText variant="body">
          Seus registros e preferências ficam armazenados em banco de dados associado à sua conta, e
          seu token de acesso fica salvo de forma segura no dispositivo.
        </AppText>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          4. Sem divulgação a terceiros e seus direitos
        </AppText>
        <AppText variant="body">
          Seus registros emocionais não são vendidos nem divulgados a terceiros. A qualquer momento
          você pode editar ou excluir registros, exportar seus dados ou excluir sua conta
          permanentemente em Ajustes.
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