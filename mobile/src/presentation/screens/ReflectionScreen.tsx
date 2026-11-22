import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../data/http/HttpClient';
import { ReflectionSummary } from '../../domain/entities/EmotionalRecord';
import { getMoodDefinition } from '../../domain/entities/MoodCatalog';
import { UserExportData } from '../../domain/entities/User';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { useRecords } from '../viewmodels/RecordsViewModel';
import { useSession } from '../viewmodels/SessionContext';

interface ReflectionScreenProps {
  exportUserData: () => Promise<UserExportData>;
}

export function ReflectionScreen({ exportUserData }: ReflectionScreenProps) {
  const { preferences, isConnected } = useSession();
  const { fetchReflectionSummary, records } = useRecords();

  const [period, setPeriod] = useState<7 | 30>(7);
  const [summary, setSummary] = useState<ReflectionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportedPayload, setExportedPayload] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchReflectionSummary(period);
      setSummary(data);
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Não foi possível carregar o resumo.'
      );
    } finally {
      setLoading(false);
    }
  }, [period, fetchReflectionSummary]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary, records.length]);

  const handleExport = async () => {
    setExporting(true);
    setErrorMessage(null);
    try {
      const data = await exportUserData();
      setExportedPayload(JSON.stringify(data, null, 2));
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Não foi possível exportar seus dados agora.'
      );
    } finally {
      setExporting(false);
    }
  };

  const maxMoodCount = Math.max(
    1,
    ...(summary?.frequenciaHumores.map((item) => item.quantidade) ?? [1])
  );

  return (
    <ScreenContainer>
      <ConnectionBanner isConnected={isConnected} />

      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <AppText variant="title">Reflexão</AppText>
          <AppText variant="subtitle">Olhar gentil para seus dias</AppText>
        </View>

        <View style={styles.periodSwitch}>
          {([7, 30] as const).map((days) => {
            const active = period === days;
            return (
              <Pressable
                key={days}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setPeriod(days)}
                style={[styles.periodBtn, active && styles.periodBtnActive]}
              >
                <AppText
                  variant="caption"
                  color={active ? COLORS.textOnPrimary : COLORS.textPrimary}
                  style={styles.periodLabel}
                >
                  {days} dias
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : errorMessage ? (
        <AppCard style={styles.card}>
          <AppText variant="body" color={COLORS.danger}>
            {errorMessage}
          </AppText>
        </AppCard>
      ) : (
        <>
          <AppCard style={styles.card}>
            <AppText variant="cardTitle" style={styles.cardTitle}>
              Resumo dos seus momentos ({summary?.totalRegistros ?? 0})
            </AppText>

            {summary && summary.frequenciaHumores.length > 0 ? (
              <View style={styles.barsList}>
                {summary.frequenciaHumores.map((item) => {
                  const mood = getMoodDefinition(item.nivelHumor, preferences.rotulosHumorCustom);
                  const widthPercent = `${Math.round(
                    Math.max(0.12, item.quantidade / maxMoodCount) * 100
                  )}%` as const;

                  return (
                    <View key={item.nivelHumor} style={styles.barRow}>
                      <AppText variant="caption" style={styles.barLabel}>
                        {preferences.rotulosSempreVisiveis
                          ? mood.displayLabel
                          : mood.climateLabel}
                      </AppText>

                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { width: widthPercent, backgroundColor: mood.accentColor },
                          ]}
                        />
                      </View>

                      <AppText variant="cardTitle" style={styles.barCount}>
                        {item.quantidade}
                      </AppText>
                    </View>
                  );
                })}
              </View>
            ) : (
              <AppText variant="body" color={COLORS.textSecondary}>
                Ainda não há registros neste período de {period} dias.
              </AppText>
            )}
          </AppCard>

          <AppCard style={styles.card}>
            <AppText variant="cardTitle" style={styles.cardTitle}>
              Contextos mais presentes
            </AppText>

            {summary && summary.contextosMaisPresentes.length > 0 ? (
              <View style={styles.contextList}>
                {summary.contextosMaisPresentes.map((ctx) => (
                  <View key={ctx.slug} style={styles.contextRow}>
                    <AppText variant="body">
                      {preferences.rotulosSempreVisiveis ? ctx.nome : ctx.slug}
                    </AppText>
                    <View style={styles.countPill}>
                      <AppText variant="caption" color={COLORS.primaryDark} style={styles.countPillText}>
                        {ctx.quantidade} {ctx.quantidade === 1 ? 'registro' : 'registros'}
                      </AppText>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <AppText variant="body" color={COLORS.textSecondary}>
                Nenhum contexto associado nos últimos {period} dias.
              </AppText>
            )}
          </AppCard>
        </>
      )}

      <AppCard style={styles.promptCard}>
        <View style={styles.promptHeader}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.primary} />
          <AppText variant="cardTitle">Convite para refletir</AppText>
        </View>
        <AppText variant="body">
          O que ajudou a trazer mais leveza nos dias nublados ou pesados desta semana?
        </AppText>
      </AppCard>

      <AppButton
        label="Exportar meus dados"
        variant="outlined"
        loading={exporting}
        onPress={() => void handleExport()}
        style={styles.exportBtn}
      />

      {exportedPayload && (
        <AppCard style={styles.exportCard}>
          <View style={styles.exportHeader}>
            <AppText variant="cardTitle">Seus dados exportados (JSON)</AppText>
            <AppText
              variant="caption"
              color={COLORS.primaryDark}
              style={styles.hideLink}
              onPress={() => setExportedPayload(null)}
            >
              Ocultar
            </AppText>
          </View>
          <AppText variant="caption" style={styles.jsonText}>
            {exportedPayload}
          </AppText>
        </AppCard>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  headerCopy: {
    flex: 1,
    minWidth: 160,
  },
  periodSwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 3,
  },
  periodBtn: {
    borderRadius: RADII.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minHeight: 34,
    justifyContent: 'center',
  },
  periodBtnActive: {
    backgroundColor: COLORS.primary,
  },
  periodLabel: {
    fontWeight: '700',
  },
  centered: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    marginBottom: 12,
  },
  barsList: {
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    width: 78,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADII.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: RADII.pill,
  },
  barCount: {
    width: 28,
    textAlign: 'right',
  },
  contextList: {
    gap: 10,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countPill: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  countPillText: {
    fontWeight: '600',
  },
  promptCard: {
    backgroundColor: '#EEF2F5',
    marginBottom: SPACING.md,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  exportBtn: {
    marginBottom: SPACING.md,
  },
  exportCard: {
    marginBottom: SPACING.md,
  },
  exportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hideLink: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  jsonText: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
});