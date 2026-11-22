import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiError } from '../../data/http/HttpClient';
import { getFlowerByMood } from '../../domain/catalog/FlowerCatalog';
import { CONTEXT_CATALOG, EmotionalRecord } from '../../domain/entities/EmotionalRecord';
import { getMoodDefinition } from '../../domain/entities/MoodCatalog';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { FlowerIllustration } from '../components/FlowerIllustration';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { ConfirmModal } from '../modals/ConfirmModal';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppStackParamList } from '../types/navigation';
import { formatRecordDate, useRecords } from '../viewmodels/RecordsViewModel';
import { useSession } from '../viewmodels/SessionContext';

type Props = NativeStackScreenProps<AppStackParamList, 'RecordDetail'>;

export function RecordDetailScreen({ navigation, route }: Props) {
  const { recordId } = route.params;
  const { preferences, isConnected } = useSession();
  const { records, getRecordById, deleteRecord } = useRecords();

  const cached = records.find((r) => r.id === recordId) ?? null;
  const [record, setRecord] = useState<EmotionalRecord | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadRecord = useCallback(async () => {
    setErrorMessage(null);
    try {
      const fresh = await getRecordById(recordId);
      setRecord(fresh);
    } catch (err) {
      if (!cached) {
        setErrorMessage(
          err instanceof ApiError ? err.message : 'Não foi possível carregar este registro.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [recordId, getRecordById, cached]);

  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  useEffect(() => {
    if (cached) {
      setRecord(cached);
    }
  }, [cached]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRecord(recordId);
      setConfirmOpen(false);
      navigation.goBack();
    } catch (err) {
      setConfirmOpen(false);
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Não foi possível excluir o registro.'
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !record) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!record) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Detalhes do registro" onBack={() => navigation.goBack()} />
        <AppCard>
          <AppText variant="body" color={COLORS.danger}>
            {errorMessage ?? 'Registro não encontrado.'}
          </AppText>
        </AppCard>
      </ScreenContainer>
    );
  }

  const mood = getMoodDefinition(record.nivelHumor, preferences.rotulosHumorCustom);
  const flower = getFlowerByMood(record.nivelHumor);
  const contextNames = record.contextos
    .map((slug) => CONTEXT_CATALOG.find((c) => c.slug === slug)?.nome)
    .filter((n): n is string => Boolean(n));

  return (
    <ScreenContainer>
      <ConnectionBanner isConnected={isConnected} />

      <ScreenHeader
        title="Detalhes do registro"
        subtitle="Acompanhe este momento com tranquilidade"
        badgeText={formatRecordDate(record.registradoEm)}
        onBack={() => navigation.goBack()}
      />

      <AppCard style={styles.card}>
        <View style={styles.moodHeader}>
          <View
            style={[
              styles.flowerBadge,
              { backgroundColor: flower.ceuFundo, borderColor: flower.ceuBorda },
            ]}
          >
            <FlowerIllustration nivelHumor={record.nivelHumor} size={54} />
          </View>
          <View style={styles.moodInfo}>
            <AppText variant="title">
              {preferences.rotulosSempreVisiveis ? mood.displayLabel : flower.clima}
            </AppText>
            <AppText variant="subtitle">
              {flower.iconeClima} {flower.flor} • {flower.clima}
            </AppText>
          </View>
        </View>

        <View style={styles.flowerMessageBox}>
          <AppText variant="cardTitle" style={styles.blockLabel}>
            Mensagem da flor
          </AppText>
          <AppText variant="body">
            “{record.mensagemFlor || flower.mensagemFallback}”
          </AppText>
        </View>

        <View style={styles.block}>
          <AppText variant="cardTitle" style={styles.blockLabel}>
            Contextos
          </AppText>
          {contextNames.length > 0 ? (
            <View style={styles.tagsRow}>
              {contextNames.map((name) => (
                <View key={name} style={styles.tag}>
                  <AppText variant="caption" color={COLORS.primaryDark} style={styles.tagText}>
                    {name}
                  </AppText>
                </View>
              ))}
            </View>
          ) : (
            <AppText variant="body" color={COLORS.textSecondary}>
              Nenhum contexto selecionado.
            </AppText>
          )}
        </View>

        <View style={styles.block}>
          <AppText variant="cardTitle" style={styles.blockLabel}>
            Pensamento registrado
          </AppText>
          <AppText
            variant="body"
            color={record.pensamento ? COLORS.textPrimary : COLORS.textSecondary}
          >
            {record.pensamento ?? 'Nenhuma anotação escrita neste registro.'}
          </AppText>
        </View>
      </AppCard>

      {errorMessage && (
        <AppCard style={styles.errorBox}>
          <AppText variant="caption" color={COLORS.danger}>
            {errorMessage}
          </AppText>
        </AppCard>
      )}

      <View style={styles.actions}>
        <AppButton
          label="Excluir registro"
          variant="danger"
          disabled={deleting}
          onPress={() => setConfirmOpen(true)}
          style={styles.btn}
        />
        <AppButton
          label="Editar registro"
          disabled={deleting}
          onPress={() => navigation.navigate('EditRecord', { recordId: record.id })}
          style={styles.btn}
        />
      </View>

      <ConfirmModal
        visible={confirmOpen}
        title="Excluir registro?"
        description="Este registro emocional será removido permanentemente do seu diário."
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setConfirmOpen(false)}
      />
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
  card: {
    marginBottom: SPACING.md,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: SPACING.md,
  },
  flowerBadge: {
    width: 74,
    height: 74,
    borderRadius: RADII.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodInfo: {
    flex: 1,
  },
  flowerMessageBox: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADII.md,
    padding: 12,
    marginBottom: SPACING.md,
  },
  block: {
    marginBottom: SPACING.md,
  },
  blockLabel: {
    marginBottom: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADII.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    fontWeight: '600',
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