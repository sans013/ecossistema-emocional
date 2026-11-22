import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
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
import { formatRecordDate, useRecords } from '../viewmodels/RecordsViewModel';
import { useSession } from '../viewmodels/SessionContext';

type Props = NativeStackScreenProps<AppStackParamList, 'EditRecord'>;

export function EditRecordScreen({ navigation, route }: Props) {
  const { recordId } = route.params;
  const { scaledFont } = useAppTheme();
  const { preferences, isConnected } = useSession();
  const { records, getRecordById, updateRecord } = useRecords();

  const existing = records.find((r) => r.id === recordId) ?? null;

  const [loadingInitial, setLoadingInitial] = useState(!existing);
  const [registeredAt, setRegisteredAt] = useState<string>(existing?.registradoEm ?? '');
  const [selectedMood, setSelectedMood] = useState<number>(existing?.nivelHumor ?? 3);
  const [selectedContexts, setSelectedContexts] = useState<ContextSlug[]>(
    existing?.contextos ?? []
  );
  const [thought, setThought] = useState<string>(existing?.pensamento ?? '');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (existing) {
        setRegisteredAt(existing.registradoEm);
        setSelectedMood(existing.nivelHumor);
        setSelectedContexts(existing.contextos);
        setThought(existing.pensamento ?? '');
        setLoadingInitial(false);
        return;
      }

      try {
        const fetched = await getRecordById(recordId);
        if (active) {
          setRegisteredAt(fetched.registradoEm);
          setSelectedMood(fetched.nivelHumor);
          setSelectedContexts(fetched.contextos);
          setThought(fetched.pensamento ?? '');
        }
      } catch (err) {
        if (active) {
          setErrorMessage(
            err instanceof ApiError ? err.message : 'Não foi possível carregar o registro.'
          );
        }
      } finally {
        if (active) setLoadingInitial(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [recordId, existing, getRecordById]);

  const toggleContext = (slug: ContextSlug) => {
    setSelectedContexts((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  const handleSaveChanges = async () => {
    setErrorMessage(null);
    setSaving(true);
    try {
      await updateRecord(recordId, {
        nivelHumor: selectedMood,
        contextos: selectedContexts,
        pensamento: thought.trim() || null,
      });
      navigation.goBack();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Não foi possível salvar as alterações agora.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ConnectionBanner isConnected={isConnected} />

      <ScreenHeader
        title="Editar registro"
        subtitle="Ajuste com calma, sem pressa"
        badgeText={registeredAt ? formatRecordDate(registeredAt) : undefined}
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
      </View>

      <View style={styles.section}>
        <AppText variant="cardTitle" style={styles.sectionTitle}>
          Quer registrar um pensamento?
        </AppText>
        <AppCard style={styles.textAreaCard}>
          <TextInput
            accessibilityLabel="Editar pensamento"
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
          label="Cancelar"
          variant="outlined"
          disabled={saving}
          onPress={() => navigation.goBack()}
          style={styles.btn}
        />
        <AppButton
          label="Salvar alterações"
          loading={saving}
          onPress={() => void handleSaveChanges()}
          style={styles.btn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    marginBottom: 8,
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
  },
  btn: {
    flex: 1,
  },
});