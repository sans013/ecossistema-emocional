import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../../data/http/HttpClient';
import { ReminderShift } from '../../domain/entities/User';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppStackParamList } from '../types/navigation';
import { useSession } from '../viewmodels/SessionContext';

type Props = NativeStackScreenProps<AppStackParamList, 'RemindersSettings'>;

const SHIFTS: Array<{ key: ReminderShift; label: string }> = [
  { key: 'manha', label: 'Manhã' },
  { key: 'tarde', label: 'Tarde' },
  { key: 'noite', label: 'Noite' },
];

export function RemindersSettingsScreen({ navigation }: Props) {
  const { preferences, updatePreferences } = useSession();

  const [enabled, setEnabled] = useState(preferences.lembretesAtivos);
  const [shifts, setShifts] = useState<ReminderShift[]>(preferences.lembretesTurnos);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleShift = (shift: ReminderShift) => {
    setShifts((prev) =>
      prev.includes(shift) ? prev.filter((item) => item !== shift) : [...prev, shift]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await updatePreferences({
        lembretesAtivos: enabled,
        lembretesTurnos: shifts,
      });
      navigation.goBack();
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Não foi possível salvar os lembretes.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Lembretes gentis"
        subtitle="Você escolhe se quer convites e em quais turnos do dia"
        onBack={() => navigation.goBack()}
      />

      <AppCard style={styles.card}>
        <View style={styles.switchRow}>
          <AppText variant="cardTitle" style={styles.switchLabel}>
            Ativar convites de pausa e registro
          </AppText>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.surface}
          />
        </View>

        <AppText variant="caption" style={styles.shiftsTitle}>
          Turnos preferidos
        </AppText>

        <View style={styles.chipsRow}>
          {SHIFTS.map((s) => {
            const active = shifts.includes(s.key);
            return (
              <Pressable
                key={s.key}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active }}
                disabled={!enabled}
                onPress={() => toggleShift(s.key)}
                style={[
                  styles.chip,
                  active && enabled ? styles.chipActive : styles.chipIdle,
                  !enabled && styles.chipDisabled,
                ]}
              >
                <AppText
                  variant="caption"
                  color={active && enabled ? COLORS.textOnPrimary : COLORS.textPrimary}
                  style={styles.chipText}
                >
                  {s.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      {errorMessage && (
        <AppCard style={styles.errorBox}>
          <AppText variant="caption" color={COLORS.danger}>
            {errorMessage}
          </AppText>
        </AppCard>
      )}

      <AppButton
        label="Salvar preferências"
        loading={saving}
        onPress={() => void handleSave()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: SPACING.md,
  },
  switchLabel: {
    flex: 1,
  },
  shiftsTitle: {
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  chipIdle: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
    marginBottom: SPACING.md,
  },
});