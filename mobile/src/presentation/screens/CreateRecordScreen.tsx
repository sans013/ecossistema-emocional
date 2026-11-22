import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '../../data/http/HttpClient';
import { getFlowerByMood } from '../../domain/catalog/FlowerCatalog';
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
  const { createRecord, generateFlowerMessage } = useRecords();

  const [selectedMood, setSelectedMood] = useState<number>(4);
  const [selectedContexts, setSelectedContexts] = useState<ContextSlug[]>([]);
  const [thought, setThought] = useState('');
  const [useIAGen, setUseIAGen] = useState(true);
  const [savingMode, setSavingMode] = useState<'quick' | 'full' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedFlower = getFlowerByMood(selectedMood);

  const toggleContext = (slug: ContextSlug) => {
    setSelectedContexts((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  const handleSave = async (mode: 'quick' | 'full') => {
    setErrorMessage(null);
    setSavingMode(mode);
    const chosenContexts = mode === 'quick' ? [] : selectedContexts;
    const chosenThought = mode === 'quick' ? null : thought.trim() || null;

    try {
      let mensagemFlor: string | undefined;

      if (useIAGen) {
        const aiResult = await generateFlowerMessage({
          nivelHumor: selectedMood,
          contextos: chosenContexts,
          pensamento: chosenThought,
        });
        if (aiResult.geradoPorIA) {
          mensagemFlor = aiResult.mensagem;
        }
      }

      const created = await createRecord({
        nivelHumor: selectedMood,
        contextos: chosenContexts,
        pensamento: chosenThought,
        ...(mensagemFlor ? { mensagemFlor } : {}),
      });

      navigation.replace('RecordSaved', {
        recordId: created.id,
        nivelHumor: created.nivelHumor,
        ...(mensagemFlor ? { mensagemFlor } : {}),
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

        <View
          style={[
            styles.flowerBanner,
            { backgroundColor: selectedFlower.ceuFundo, borderColor: selectedFlower.ceuBorda },
          ]}
        >
          <AppText variant="cardTitle" color={selectedFlower.corDestaque}>
            {selectedFlower.iconeClima} Flor do dia: {selectedFlower.flor} ({selectedFlower.clima})
          </AppText>
          <AppText variant="caption" style={styles.flowerSymbolism}>
            {selectedFlower.simbolismo}
          </AppText>
        </View>
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

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: useIAGen }}
        onPress={() => setUseIAGen((prev) => !prev)}
        style={[styles.aiConsentCard, useIAGen && styles.aiConsentCardActive]}
      >
        <View style={[styles.checkboxBox, useIAGen && styles.checkboxBoxChecked]}>
          {useIAGen && <Ionicons name="checkmark" size={15} color={COLORS.textOnPrimary} />}
        </View>
        <View style={styles.aiConsentCopy}>
          <AppText variant="cardTitle">
            Gerar mensagem personalizada da flor com IAGen
          </AppText>
          <AppText variant="caption" style={styles.aiConsentHint}>
            Aviso LGPD: apenas o humor, os contextos e o texto opcional acima são enviados de forma anonimizada (sem nome ou e-mail) à API de IAGen para redigir uma mensagem de apoio não clínico.
          </AppText>
        </View>
      </Pressable>

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
  flowerBanner: {
    marginTop: 10,
    borderRadius: RADII.md,
    borderWidth: 1,
    padding: 12,
  },
  flowerSymbolism: {
    marginTop: 3,
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
  aiConsentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: 12,
    marginBottom: SPACING.md,
  },
  aiConsentCardActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.primary,
  },
  aiConsentCopy: {
    flex: 1,
  },
  aiConsentHint: {
    marginTop: 4,
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