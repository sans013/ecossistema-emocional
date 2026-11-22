import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../../data/http/HttpClient';
import { ContextSlug } from '../../domain/entities/EmotionalRecord';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { ContextChipGroup } from '../components/ContextChipGroup';
import { MoodScaleSelector } from '../components/MoodScaleSelector';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAppTheme } from '../theme/ThemeContext';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppStackParamList } from '../types/navigation';
import { useRecords } from '../viewmodels/RecordsViewModel';
import { useSession } from '../viewmodels/SessionContext';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateRecord'>;

export function CreateRecordScreen({ navigation }: Props) {
  const { scaledFont } = useAppTheme();
  const { preferences, isConnected } = useSession();
  const { createRecord } = useRecords();

  const [selectedMood, setSelectedMood] = useState<number>(4);
  const [selectedContexts, setSelectedContexts] = useState<ContextSlug[]>([]);
  const [thought, setThought] = useState('');
  const [savingMode, setSavingMode] = useState<'quick' | 'full' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleContext = (slug: ContextSlug) => {
    setSelectedContexts((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  const handleSave = async (mode: 'quick' | 'full') => {
    setErrorMessage(null);
    setSavingMode(mode);
    try {
      const created = await createRecord({
        nivelHumor: selectedMood,
        contextos: mode === 'quick' ? [] : selectedContexts,
        pensamento: mode === 'quick' ? null : thought.trim() || null,
      });
      navigation.replace('RecordSaved', {
        recordId: created.id,
        nivelHumor: created.nivelHumor,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Não foi possível salvar seu registro agora.');
      }
    } finally {
      setSavingMode(null);
    }
  };

  return (
    <ScreenContainer>
      <ConnectionBanner isConnected={isConnected} />

      <ScreenHeader
        title="Como você está se sentindo agora?"
        subtitle="Escolha o clima que mais parece com você"
        badgeText="Agora"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.section}>
        <MoodScaleSelector
          selectedLevel={selectedMood}
          onSelectLevel={setSelectedMood}
          customLabels={preferences.rotulosHumorCustom}
          showLabels={preferences.rotulosSempreVisiveis}
        />
      </View>

      <View style={styles.section}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          Adicionar contexto (opcional)
        </AppText>
        <ContextChipGroup
          selected={selectedContexts}
          onToggle={toggleContext}
          showLabels={preferences.rotulosSempreVisiveis}
        />
        <AppText variant="caption" style={styles.helper}>
          Toque para selecionar — sem obrigação
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          Quer registrar um pensamento?
        </AppText>
        <AppCard style={styles.textAreaCard}>
          <TextInput
            accessibilityLabel="Pensamento opcional"
            multiline
            numberOfLines={4}
            maxLength={1000}
            value={thought}
            onChangeText={setThought}
            placeholder="Se quiser, conte o que influenciou este momento..."
            placeholderTextColor={COLORS.textSecondary}
            style={[
              styles.textArea,
              { fontSize: scaledFont(15), color: COLORS.textPrimary },
            ]}
          />
        </AppCard>
      </View>

      {errorMessage && (
        <AppCard style={styles.errorBox}>
          <AppText variant="caption" color={COLORS.danger}>
            {errorMessage}
          </AppText>
        </AppCard>
      )}

      <View style={styles.actions}>
        <AppButton
          label="Salvar rápido"
          variant="outlined"
          disabled={savingMode !== null}
          loading={savingMode === 'quick'}
          onPress={() => void handleSave('quick')}
          style={styles.btn}
        />
        <AppButton
          label="Salvar registro"
          disabled={savingMode !== null}
          loading={savingMode === 'full'}
          onPress={() => void handleSave('full')}
          style={styles.btn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  helper: {
    marginTop: 6,
  },
  textAreaCard: {
    minHeight: 112,
    padding: 12,
    borderRadius: RADII.md,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
    marginBottom: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  btn: {
    flex: 1,
  },
});