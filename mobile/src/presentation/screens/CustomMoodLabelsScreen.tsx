import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../../data/http/HttpClient';
import { DEFAULT_MOOD_CATALOG } from '../../domain/entities/MoodCatalog';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { InputField } from '../components/InputField';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, SPACING } from '../theme/tokens';
import { AppStackParamList } from '../types/navigation';
import { useSession } from '../viewmodels/SessionContext';

type Props = NativeStackScreenProps<AppStackParamList, 'CustomMoodLabels'>;

export function CustomMoodLabelsScreen({ navigation }: Props) {
  const { preferences, updatePreferences } = useSession();

  const [labels, setLabels] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const item of DEFAULT_MOOD_CATALOG) {
      const key = String(item.level);
      initial[key] = preferences.rotulosHumorCustom[key] ?? item.defaultLabel;
    }
    return initial;
  });

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMessage(null);
    const cleaned: Record<string, string> = {};
    for (const item of DEFAULT_MOOD_CATALOG) {
      const key = String(item.level);
      const val = (labels[key] ?? '').trim();
      if (!val) {
        setErrorMessage(`O rótulo do clima ${item.climateLabel} não pode ficar vazio.`);
        return;
      }
      cleaned[key] = val;
    }

    setSaving(true);
    try {
      await updatePreferences({ rotulosHumorCustom: cleaned });
      navigation.goBack();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Não foi possível salvar os rótulos.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    const defaults: Record<string, string> = {};
    for (const item of DEFAULT_MOOD_CATALOG) {
      defaults[String(item.level)] = item.defaultLabel;
    }
    setLabels(defaults);
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Rótulos de humor"
        subtitle="Nomeie cada estado do jeito que fizer mais sentido para você"
        onBack={() => navigation.goBack()}
      />

      {DEFAULT_MOOD_CATALOG.map((item) => {
        const key = String(item.level);
        return (
          <InputField
            key={key}
            label={`Clima: ${item.climateLabel}`}
            value={labels[key] ?? ''}
            onChangeText={(txt) => setLabels((prev) => ({ ...prev, [key]: txt }))}
            maxLength={40}
          />
        );
      })}

      {errorMessage && (
        <AppCard style={styles.errorBox}>
          <AppText variant="caption" color={COLORS.danger}>
            {errorMessage}
          </AppText>
        </AppCard>
      )}

      <View style={styles.actions}>
        <AppButton
          label="Restaurar padrão"
          variant="outlined"
          disabled={saving}
          onPress={handleResetDefault}
          style={styles.btn}
        />
        <AppButton
          label="Salvar rótulos"
          loading={saving}
          onPress={() => void handleSave()}
          style={styles.btn}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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