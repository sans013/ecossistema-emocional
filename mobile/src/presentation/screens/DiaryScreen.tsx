import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CONTEXT_CATALOG, ContextSlug } from '../../domain/entities/EmotionalRecord';
import { getMoodDefinition } from '../../domain/entities/MoodCatalog';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { MoodGlyph } from '../components/MoodGlyph';
import { ScreenContainer } from '../components/ScreenContainer';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppStackParamList, MainTabParamList } from '../types/navigation';
import { formatRecordDate, useRecords } from '../viewmodels/RecordsViewModel';
import { useSession } from '../viewmodels/SessionContext';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'DiaryTab'>,
  NativeStackNavigationProp<AppStackParamList>
>;

export function DiaryScreen() {
  const navigation = useNavigation<NavProp>();
  const { preferences, isConnected } = useSession();
  const {
    records,
    loadingList,
    listError,
    selectedContextFilter,
    setSelectedContextFilter,
    refreshRecords,
  } = useRecords();

  const filterOptions: Array<{ key: ContextSlug | 'todos'; label: string }> = [
    { key: 'todos', label: 'Todos' },
    ...CONTEXT_CATALOG.map((c) => ({ key: c.slug, label: c.nome })),
  ];

  return (
    <ScreenContainer
      scrollProps={{
        refreshControl: (
          <RefreshControl
            refreshing={loadingList}
            onRefresh={() => void refreshRecords()}
            tintColor={COLORS.primary}
          />
        ),
      }}
    >
      <ConnectionBanner isConnected={isConnected} />

      <AppText variant="title" style={styles.title}>
        Meu Diário
      </AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        Seus momentos, com carinho
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filterOptions.map((opt) => {
          const active = selectedContextFilter === opt.key;
          return (
            <Pressable
              key={opt.key}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setSelectedContextFilter(opt.key)}
              style={[styles.filterChip, active ? styles.filterActive : styles.filterIdle]}
            >
              <AppText
                variant="caption"
                color={active ? COLORS.textOnPrimary : COLORS.textPrimary}
                style={styles.filterText}
              >
                {opt.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {loadingList && records.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : listError ? (
        <AppCard style={styles.emptyCard}>
          <AppText variant="body" color={COLORS.danger} style={styles.emptyText}>
            {listError}
          </AppText>
          <AppButton
            label="Tentar novamente"
            variant="outlined"
            onPress={() => void refreshRecords()}
          />
        </AppCard>
      ) : records.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <AppText variant="cardTitle" style={styles.emptyTitle}>
            Nenhum registro por aqui ainda
          </AppText>
          <AppText variant="subtitle" style={styles.emptyText}>
            Quando quiser, registre como você está se sentindo neste momento.
          </AppText>
          <AppButton
            label="Criar primeiro registro"
            onPress={() => navigation.navigate('CreateRecord')}
          />
        </AppCard>
      ) : (
        <View style={styles.list}>
          {records.map((item) => {
            const mood = getMoodDefinition(item.nivelHumor, preferences.rotulosHumorCustom);
            const itemContextNames = item.contextos
              .map((slug) => CONTEXT_CATALOG.find((c) => c.slug === slug)?.nome)
              .filter((name): name is string => Boolean(name));

            return (
              <AppCard key={item.id} style={styles.recordCard}>
                <View style={styles.cardRow}>
                  <MoodGlyph
                    iconKey={mood.iconKey}
                    softColor={mood.softColor}
                    accentColor={mood.accentColor}
                    size="sm"
                    showLabels={false}
                  />

                  <View style={styles.cardContent}>
                    <AppText variant="cardTitle">
                      {formatRecordDate(item.registradoEm)} •{' '}
                      {preferences.rotulosSempreVisiveis
                        ? `${mood.displayLabel} (${mood.climateLabel})`
                        : mood.climateLabel}
                    </AppText>

                    {preferences.rotulosSempreVisiveis && itemContextNames.length > 0 && (
                      <View style={styles.tagsRow}>
                        {itemContextNames.map((name) => (
                          <View key={name} style={styles.miniTag}>
                            <AppText variant="caption" color={COLORS.primaryDark}>
                              {name}
                            </AppText>
                          </View>
                        ))}
                      </View>
                    )}

                    {item.pensamento ? (
                      <AppText
                        variant="body"
                        color={COLORS.textSecondary}
                        numberOfLines={2}
                        style={styles.thoughtPreview}
                      >
                        {item.pensamento}
                      </AppText>
                    ) : (
                      <AppText
                        variant="caption"
                        color={COLORS.textSecondary}
                        style={styles.thoughtPreview}
                      >
                        Registro rápido sem anotação adicional
                      </AppText>
                    )}

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => navigation.navigate('RecordDetail', { recordId: item.id })}
                      style={styles.detailLinkRow}
                      hitSlop={6}
                    >
                      <AppText variant="body" color={COLORS.primaryDark} style={styles.detailLinkText}>
                        Ver detalhes
                      </AppText>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primaryDark} />
                    </Pressable>
                  </View>
                </View>
              </AppCard>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 2,
  },
  subtitle: {
    marginBottom: SPACING.md,
  },
  filterRow: {
    gap: 8,
    marginBottom: SPACING.md,
    paddingRight: 4,
  },
  filterChip: {
    minHeight: 38,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADII.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  filterIdle: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  filterActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontWeight: '600',
  },
  centered: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyTitle: {
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  recordCard: {
    padding: SPACING.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardContent: {
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  miniTag: {
    backgroundColor: COLORS.primarySoft,
    borderRadius: RADII.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  thoughtPreview: {
    marginTop: 8,
  },
  detailLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  detailLinkText: {
    fontWeight: '700',
  },
});