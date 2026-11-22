import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../data/http/HttpClient';
import { getFlowerByMood } from '../../domain/catalog/FlowerCatalog';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { FloriculturaShelf } from '../components/FloriculturaShelf';
import { MoodScaleSelector } from '../components/MoodScaleSelector';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppTheme } from '../theme/ThemeContext';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppStackParamList, MainTabParamList } from '../types/navigation';
import { useRecords } from '../viewmodels/RecordsViewModel';
import { useSession } from '../viewmodels/SessionContext';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { dayShift } = useAppTheme();
  const { user, preferences, isConnected, ecosystemLevel, fontSizeOption } = useSession();
  const { records, createRecord, generateFlowerMessage } = useRecords();

  const [selectedMood, setSelectedMood] = useState<number>(4);
  const [savingQuick, setSavingQuick] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const firstName = user?.nomeExibicao?.split(' ')[0] ?? 'você';
  const selectedFlower = getFlowerByMood(selectedMood);
  const fontScale =
    fontSizeOption === 'extra_grande' ? 1.2 : fontSizeOption === 'grande' ? 1.1 : 1;

  const handleQuickSave = async () => {
    setFeedbackError(null);
    setSavingQuick(true);
    try {
      const aiResult = await generateFlowerMessage({
        nivelHumor: selectedMood,
        contextos: [],
        pensamento: null,
      });

      const created = await createRecord({
        nivelHumor: selectedMood,
        contextos: [],
        pensamento: null,
        ...(aiResult.geradoPorIA ? { mensagemFlor: aiResult.mensagem } : {}),
      });

      navigation.navigate('RecordSaved', {
        recordId: created.id,
        nivelHumor: created.nivelHumor,
        ...(aiResult.geradoPorIA ? { mensagemFlor: aiResult.mensagem } : {}),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setFeedbackError(err.message);
      } else {
        setFeedbackError('Não foi possível salvar agora.');
      }
    } finally {
      setSavingQuick(false);
    }
  };

  return (
    <ScreenContainer>
      <ConnectionBanner isConnected={isConnected} />

      <View style={styles.topMeta}>
        <AppText variant="caption">
          {dayShift.shift === 'manha'
            ? 'Manhã tranquila'
            : dayShift.shift === 'tarde'
              ? 'Tarde em movimento'
              : 'Noite de respiro'}
        </AppText>

        <View style={styles.statusChips}>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isConnected ? COLORS.onlineDot : COLORS.offlineDot },
              ]}
            />
            <AppText variant="caption" style={styles.statusText}>
              {isConnected ? 'Online' : 'Offline'}
            </AppText>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate('RemindersSettings')}
            style={styles.statusPill}
          >
            <Ionicons name="notifications-outline" size={14} color={COLORS.textPrimary} />
            <AppText variant="caption" style={styles.statusText}>
              Lembretes
            </AppText>
          </Pressable>
        </View>
      </View>

      <AppText variant="title" style={styles.greeting}>
        {dayShift.greeting}, {firstName}
      </AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        {dayShift.subtitle}
      </AppText>

      {ecosystemLevel !== 'desativada' && (
        <View style={styles.floriculturaWrapper}>
          <FloriculturaShelf
            records={records}
            nivelEcossistema={ecosystemLevel}
            customMoodLabels={preferences.rotulosHumorCustom}
            fontScale={fontScale}
            onPressRegisterToday={() => navigation.navigate('CreateRecord')}
            onPressRecord={(rec) => navigation.navigate('RecordDetail', { recordId: rec.id })}
          />

          <View style={styles.ecosystemFooter}>
            <View style={styles.ecosystemCopy}>
              <AppText variant="caption" style={styles.ecoLabel}>
                Floricultura semanal ({ecosystemLevel})
              </AppText>
              <AppText variant="caption">
                Toque em qualquer vaso para rever o clima e a flor daquele dia — sem cobranças ou sequências.
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('MainTabs', { screen: 'SettingsTab' })}
              style={styles.adjustChip}
            >
              <Ionicons name="options-outline" size={14} color={COLORS.textPrimary} />
              <AppText variant="caption" style={styles.adjustChipText}>
                Ajustar nível
              </AppText>
            </Pressable>
          </View>
        </View>
      )}

      <AppCard style={styles.checkinCard}>
        <AppText variant="cardTitle" style={styles.checkinTitle}>
          Como você está se sentindo agora?
        </AppText>
        <AppText variant="caption" style={styles.checkinSubtitle}>
          Flor selecionada: {selectedFlower.iconeClima} {selectedFlower.flor} ({selectedFlower.clima}).
        </AppText>

        <MoodScaleSelector
          compact
          selectedLevel={selectedMood}
          onSelectLevel={setSelectedMood}
          customLabels={preferences.rotulosHumorCustom}
          showLabels={preferences.rotulosSempreVisiveis}
        />

        {feedbackError && (
          <AppText variant="caption" color={COLORS.danger} style={styles.errorText}>
            {feedbackError}
          </AppText>
        )}

        <View style={styles.actionsRow}>
          <AppButton
            label={savingQuick ? 'Cultivando...' : 'Salvar rápido'}
            variant="outlined"
            loading={savingQuick}
            onPress={() => void handleQuickSave()}
            style={styles.quickBtn}
          />
          <AppButton
            label="Adicionar detalhes"
            disabled={savingQuick}
            onPress={() => navigation.navigate('CreateRecord')}
            style={styles.detailBtn}
          />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  statusChips: {
    flexDirection: 'row',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: '600',
  },
  greeting: {
    marginBottom: 2,
  },
  subtitle: {
    marginBottom: SPACING.md,
  },
  floriculturaWrapper: {
    marginBottom: SPACING.md,
  },
  ecosystemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 4,
  },
  ecosystemCopy: {
    flex: 1,
  },
  ecoLabel: {
    fontWeight: '700',
    marginBottom: 2,
  },
  adjustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 36,
  },
  adjustChipText: {
    fontWeight: '600',
  },
  checkinCard: {
    marginBottom: SPACING.md,
  },
  checkinTitle: {
    marginBottom: 2,
  },
  checkinSubtitle: {
    marginBottom: SPACING.sm,
  },
  errorText: {
    marginTop: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.md,
    flexWrap: 'wrap',
  },
  quickBtn: {
    flex: 1,
    minWidth: 120,
  },
  detailBtn: {
    flex: 1.3,
    minWidth: 140,
  },
});