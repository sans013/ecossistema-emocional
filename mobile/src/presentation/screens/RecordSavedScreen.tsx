import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getFlowerByMood } from '../../domain/catalog/FlowerCatalog';
import { getMoodDefinition } from '../../domain/entities/MoodCatalog';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { FlowerIllustration } from '../components/FlowerIllustration';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppStackParamList } from '../types/navigation';
import { useSession } from '../viewmodels/SessionContext';

type Props = NativeStackScreenProps<AppStackParamList, 'RecordSaved'>;

export function RecordSavedScreen({ navigation, route }: Props) {
  const { preferences, ecosystemLevel } = useSession();
  const mood = getMoodDefinition(route.params.nivelHumor, preferences.rotulosHumorCustom);
  const flower = getFlowerByMood(route.params.nivelHumor);
  const messageText = route.params.mensagemFlor || flower.mensagemFallback;

  return (
    <ScreenContainer>
      <View style={styles.centerBlock}>
        <View
          style={[
            styles.flowerCircle,
            { backgroundColor: flower.ceuFundo, borderColor: flower.ceuBorda },
          ]}
        >
          <FlowerIllustration nivelHumor={route.params.nivelHumor} size={74} />
        </View>

        <View style={[styles.moodPill, { backgroundColor: mood.softColor }]}>
          <AppText variant="caption" color={COLORS.textPrimary} style={styles.moodPillText}>
            {flower.iconeClima} {flower.flor} •{' '}
            {preferences.rotulosSempreVisiveis
              ? `${mood.displayLabel} (${flower.clima})`
              : flower.clima}
          </AppText>
        </View>

        <AppText variant="title" style={styles.title}>
          Registro salvo!
        </AppText>

        <AppText variant="subtitle" style={styles.subtitle}>
          Você reservou um momento para cuidar de si. A flor deste dia já está na sua floricultura.
        </AppText>
      </View>

      <AppCard style={styles.messageCard}>
        <View style={styles.messageHeader}>
          <Ionicons name="sparkles-outline" size={18} color={COLORS.primary} />
          <AppText variant="cardTitle">Mensagem da {flower.flor}</AppText>
        </View>
        <AppText variant="body" style={styles.messageText}>
          “{messageText}”
        </AppText>
        <AppText variant="caption" style={styles.messageFooter}>
          {route.params.mensagemFlor
            ? 'Gerada via IAGen com base nos materiais botânicos (apoio reflexivo não clínico).'
            : `Simbolismo: ${flower.simbolismo}`}
        </AppText>
      </AppCard>

      {ecosystemLevel !== 'desativada' && (
        <AppCard style={styles.gardenCard}>
          <Ionicons name="leaf-outline" size={20} color={COLORS.primary} />
          <AppText variant="caption" style={styles.gardenText}>
            {mood.gardenFeedback}
          </AppText>
        </AppCard>
      )}

      <View style={styles.actions}>
        <AppButton
          label="Ver no Diário"
          variant="outlined"
          onPress={() => navigation.navigate('MainTabs', { screen: 'DiaryTab' })}
        />
        <AppButton
          label="Voltar ao Início"
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
        />
      </View>

      <View style={styles.snackbar}>
        <Ionicons name="checkmark-circle" size={18} color={COLORS.textOnPrimary} />
        <AppText variant="caption" color={COLORS.textOnPrimary} style={styles.snackbarText}>
          Salvo com sucesso no banco
        </AppText>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerBlock: {
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  flowerCircle: {
    width: 112,
    height: 112,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  moodPill: {
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },
  moodPillText: {
    fontWeight: '700',
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
  },
  messageCard: {
    marginBottom: SPACING.md,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  messageText: {
    lineHeight: 22,
    marginBottom: 8,
  },
  messageFooter: {
    color: COLORS.textSecondary,
  },
  gardenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  gardenText: {
    flex: 1,
  },
  actions: {
    gap: 12,
    marginBottom: SPACING.lg,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#25302B',
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  snackbarText: {
    fontWeight: '600',
  },
});