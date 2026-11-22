import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../data/http/HttpClient';
import { EcosystemLevel, FontSizeOption } from '../../domain/entities/User';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ConnectionBanner } from '../components/ConnectionBanner';
import { ScreenContainer } from '../components/ScreenContainer';
import { ConfirmModal } from '../modals/ConfirmModal';
import { COLORS, RADII, SPACING } from '../theme/tokens';
import { AppStackParamList, MainTabParamList } from '../types/navigation';
import { useRecords } from '../viewmodels/RecordsViewModel';
import { useSession } from '../viewmodels/SessionContext';

type NavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'SettingsTab'>,
  NativeStackNavigationProp<AppStackParamList>
>;

type DangerAction = 'all_records' | 'delete_account' | null;

export function SettingsScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    user,
    preferences,
    isConnected,
    updatePreferences,
    deleteAllRecords,
    deleteAccount,
    logout,
  } = useSession();
  const { refreshRecords } = useRecords();

  const [savingPref, setSavingPref] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dangerAction, setDangerAction] = useState<DangerAction>(null);
  const [processingDanger, setProcessingDanger] = useState(false);

  const applyPreference = async (patch: {
    nivelEcossistema?: EcosystemLevel;
    tamanhoFonte?: FontSizeOption;
    rotulosSempreVisiveis?: boolean;
  }) => {
    setSavingPref(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await updatePreferences(patch);
      setStatusMessage('Preferência salva.');
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Não foi possível salvar a preferência.'
      );
    } finally {
      setSavingPref(false);
    }
  };

  const handleConfirmDanger = async () => {
    if (!dangerAction) return;
    setProcessingDanger(true);
    setErrorMessage(null);
    try {
      if (dangerAction === 'all_records') {
        await deleteAllRecords();
        await refreshRecords();
        setDangerAction(null);
        setStatusMessage('Todos os seus registros foram removidos.');
      } else {
        await deleteAccount();
        setDangerAction(null);
      }
    } catch (err) {
      setDangerAction(null);
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Não foi possível concluir a exclusão.'
      );
    } finally {
      setProcessingDanger(false);
    }
  };

  const ecoOptions: Array<{ key: EcosystemLevel; label: string }> = [
    { key: 'desativada', label: 'Desativada' },
    { key: 'suave', label: 'Suave' },
    { key: 'completa', label: 'Completa' },
  ];

  const fontOptions: Array<{ key: FontSizeOption; label: string }> = [
    { key: 'padrao', label: 'Padrão' },
    { key: 'grande', label: 'Grande' },
    { key: 'extra_grande', label: 'Extra grande' },
  ];

  const isDeleteAccount = dangerAction === 'delete_account';

  return (
    <ScreenContainer>
      <ConnectionBanner isConnected={isConnected} />

      <AppText variant="title" style={styles.title}>
        Ajustes
      </AppText>
      <AppText variant="subtitle" style={styles.subtitle}>
        {user ? `${user.nomeExibicao} • ${user.email}` : 'Personalize com calma'}
      </AppText>

      {statusMessage && (
        <AppCard style={styles.statusBox}>
          <AppText variant="caption" color={COLORS.primaryDark}>
            {statusMessage}
          </AppText>
        </AppCard>
      )}

      {errorMessage && (
        <AppCard style={styles.errorBox}>
          <AppText variant="caption" color={COLORS.danger}>
            {errorMessage}
          </AppText>
        </AppCard>
      )}

      <AppCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="leaf-outline" size={18} color={COLORS.primary} />
          <AppText variant="cardTitle">Personalização</AppText>
        </View>

        <AppText variant="caption" style={styles.fieldLabel}>
          Nível do ecossistema
        </AppText>
        <View style={styles.segmented}>
          {ecoOptions.map((opt) => {
            const active = preferences.nivelEcossistema === opt.key;
            return (
              <Pressable
                key={opt.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                disabled={savingPref}
                onPress={() => void applyPreference({ nivelEcossistema: opt.key })}
                style={[styles.segBtn, active && styles.segBtnActive]}
              >
                <AppText
                  variant="caption"
                  color={active ? COLORS.primaryDark : COLORS.textSecondary}
                  style={styles.segText}
                >
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('CustomMoodLabels')}
          style={styles.rowLink}
        >
          <AppText variant="body">Personalizar rótulos de humor</AppText>
          <View style={styles.rowRight}>
            <AppText variant="body" color={COLORS.textSecondary}>
              Abrir
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </View>
        </Pressable>
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="accessibility-outline" size={18} color={COLORS.primary} />
          <AppText variant="cardTitle">Acessibilidade</AppText>
        </View>

        <AppText variant="caption" style={styles.fieldLabel}>
          Tamanho da fonte
        </AppText>
        <View style={styles.segmented}>
          {fontOptions.map((opt) => {
            const active = preferences.tamanhoFonte === opt.key;
            return (
              <Pressable
                key={opt.key}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                disabled={savingPref}
                onPress={() => void applyPreference({ tamanhoFonte: opt.key })}
                style={[styles.segBtn, active && styles.segBtnActive]}
              >
                <AppText
                  variant="caption"
                  color={active ? COLORS.primaryDark : COLORS.textSecondary}
                  style={styles.segText}
                >
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppCard style={styles.previewBox}>
          <AppText variant="body">
            Pré-visualização: este texto cresce sem quebrar o layout.
          </AppText>
        </AppCard>

        <View style={styles.switchRow}>
          <AppText variant="body" style={styles.switchLabel}>
            Rótulos de texto sempre visíveis
          </AppText>
          <Switch
            value={preferences.rotulosSempreVisiveis}
            disabled={savingPref}
            onValueChange={(val) => void applyPreference({ rotulosSempreVisiveis: val })}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.surface}
          />
        </View>
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
          <AppText variant="cardTitle">Privacidade e LGPD</AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('PrivacyPolicy')}
          style={styles.rowLink}
        >
          <AppText variant="body">Política de Privacidade</AppText>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('MainTabs', { screen: 'ReflectionTab' })}
          style={styles.rowLink}
        >
          <AppText variant="body">Exportar meus dados</AppText>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setDangerAction('all_records')}
          style={styles.rowLink}
        >
          <AppText variant="body">Excluir todos os registros</AppText>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </Pressable>
      </AppCard>

      <AppCard style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="heart-outline" size={18} color={COLORS.primary} />
          <AppText variant="cardTitle">Conta e Apoio</AppText>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('ProfessionalSupport')}
          style={styles.rowLink}
        >
          <AppText variant="body">Encontre apoio profissional</AppText>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => void logout()}
          style={styles.rowLink}
        >
          <AppText variant="body" style={styles.boldText}>
            Sair da conta
          </AppText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setDangerAction('delete_account')}
          style={styles.lastRow}
        >
          <AppText variant="body" color={COLORS.danger} style={styles.boldText}>
            Excluir minha conta permanentemente
          </AppText>
        </Pressable>
      </AppCard>

      <ConfirmModal
        visible={dangerAction !== null}
        title={isDeleteAccount ? 'Excluir conta permanentemente?' : 'Excluir todos os registros?'}
        description={
          isDeleteAccount
            ? 'Esta ação remove sua conta, preferências e todos os seus registros permanentemente.'
            : 'Todos os seus registros emocionais salvos serão apagados permanentemente.'
        }
        confirmLabel={isDeleteAccount ? 'Excluir conta' : 'Excluir registros'}
        loading={processingDanger}
        onConfirm={() => void handleConfirmDanger()}
        onCancel={() => setDangerAction(null)}
      />
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
  statusBox: {
    backgroundColor: COLORS.primarySoft,
    marginBottom: SPACING.md,
  },
  errorBox: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: COLORS.danger,
    marginBottom: SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  fieldLabel: {
    marginBottom: 8,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: RADII.pill,
    padding: 4,
    marginBottom: 12,
  },
  segBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: RADII.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  segBtnActive: {
    backgroundColor: COLORS.surface,
  },
  segText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  rowLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
    minHeight: 46,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewBox: {
    backgroundColor: COLORS.surfaceMuted,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    gap: 12,
  },
  switchLabel: {
    flex: 1,
  },
  boldText: {
    fontWeight: '600',
  },
  lastRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceMuted,
    minHeight: 46,
  },
});