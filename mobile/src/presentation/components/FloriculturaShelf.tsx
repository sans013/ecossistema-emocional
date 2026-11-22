import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getFlowerByMood } from '../../domain/catalog/FlowerCatalog';
import { FlowerIllustration } from './FlowerIllustration';

export interface FloriculturaRecordItem {
  id: string;
  nivelHumor: number;
  contextos: string[];
  pensamento: string | null;
  registradoEm: string;
  mensagemFlor?: string | null;
}

interface FloriculturaShelfProps {
  records: FloriculturaRecordItem[];
  nivelEcossistema: 'desativada' | 'suave' | 'completa';
  customMoodLabels?: Record<string, string>;
  fontScale?: number;
  onPressRegisterToday?: () => void;
  onPressRecord?: (record: FloriculturaRecordItem) => void;
}

const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function FloriculturaShelf({
  records,
  nivelEcossistema,
  customMoodLabels = {},
  fontScale = 1,
  onPressRegisterToday,
  onPressRecord,
}: FloriculturaShelfProps) {
  const days = useMemo(() => {
    const today = new Date();
    const list: Array<{
      dateKey: string;
      weekdayLabel: string;
      dayNumber: string;
      isToday: boolean;
      record: FloriculturaRecordItem | null;
    }> = [];

    const latestByDate = new Map<string, FloriculturaRecordItem>();
    for (const rec of records) {
      const parsed = new Date(rec.registradoEm);
      if (Number.isNaN(parsed.getTime())) continue;
      const key = toLocalDateKey(parsed);
      const existing = latestByDate.get(key);
      if (!existing || new Date(rec.registradoEm).getTime() > new Date(existing.registradoEm).getTime()) {
        latestByDate.set(key, rec);
      }
    }

    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(today);
      d.setHours(12, 0, 0, 0);
      d.setDate(today.getDate() - offset);
      const dateKey = toLocalDateKey(d);
      list.push({
        dateKey,
        weekdayLabel: WEEKDAY_SHORT[d.getDay()],
        dayNumber: String(d.getDate()).padStart(2, '0'),
        isToday: offset === 0,
        record: latestByDate.get(dateKey) ?? null,
      });
    }

    return list;
  }, [records]);

  const [selectedIndex, setSelectedIndex] = useState(6);

  if (nivelEcossistema === 'desativada') {
    return null;
  }

  const activeDay = days[selectedIndex] ?? days[6];
  const activeRecord = activeDay?.record ?? null;
  const activeFlower = activeRecord ? getFlowerByMood(activeRecord.nivelHumor) : null;
  const moodLabel = activeRecord
    ? customMoodLabels[String(activeRecord.nivelHumor)] || activeFlower?.rotuloPadrao
    : null;

  const isCompleta = nivelEcossistema === 'completa';
  const cardBg = activeFlower
    ? isCompleta
      ? activeFlower.ceuFundo
      : '#F8FAF8'
    : '#F5F7F4';
  const cardBorder = activeFlower ? activeFlower.ceuBorda : '#CBD5CE';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: cardBg, borderColor: cardBorder },
      ]}
    >
      {/* Cabeçalho da Floricultura + Clima do dia selecionado */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleBox}>
          <Text style={[styles.eyebrow, { fontSize: 12 * fontScale }]}>
            FLORICULTURA DA SEMANA
          </Text>
          <Text style={[styles.title, { fontSize: 18 * fontScale }]}>
            {activeFlower
              ? `${activeFlower.iconeClima} ${activeFlower.clima} • ${activeFlower.flor}`
              : '🌿 Estufa em repouso'}
          </Text>
        </View>
        <View style={styles.dayBadge}>
          <Text style={[styles.dayBadgeText, { fontSize: 12 * fontScale }]}>
            {activeDay.isToday ? 'Hoje' : `${activeDay.weekdayLabel} ${activeDay.dayNumber}`}
          </Text>
        </View>
      </View>

      {/* Prateleira interativa com 7 vasos (1 para cada dia da semana) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shelfRow}
      >
        {days.map((day, index) => {
          const isSelected = index === selectedIndex;
          const flower = day.record ? getFlowerByMood(day.record.nivelHumor) : null;
          return (
            <Pressable
              key={day.dateKey}
              onPress={() => setSelectedIndex(index)}
              accessibilityRole="button"
              accessibilityLabel={`${day.weekdayLabel} dia ${day.dayNumber}: ${
                flower ? `${flower.flor}, clima ${flower.clima}` : 'vaso em repouso, sem registro'
              }`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.potSlot,
                isSelected && styles.potSlotSelected,
              ]}
            >
              <FlowerIllustration nivelHumor={day.record?.nivelHumor ?? null} size={50} />
              <Text
                style={[
                  styles.weekdayText,
                  { fontSize: 12 * fontScale },
                  isSelected && styles.weekdayTextSelected,
                ]}
              >
                {day.weekdayLabel}
              </Text>
              <Text style={[styles.dayNumText, { fontSize: 11 * fontScale }]}>
                {day.dayNumber}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Prateleira de madeira visual */}
      <View style={styles.woodBar} />

      {/* Cartão de detalhes da flor selecionada + mensagem da IAGen */}
      <View style={styles.detailCard}>
        {activeRecord && activeFlower ? (
          <>
            <View style={styles.detailTop}>
              <Text
                style={[
                  styles.flowerName,
                  { fontSize: 15 * fontScale, color: activeFlower.corDestaque },
                ]}
              >
                {activeFlower.flor} ({moodLabel})
              </Text>
              <Text style={[styles.scientificName, { fontSize: 12 * fontScale }]}>
                {activeFlower.nomeCientifico}
              </Text>
            </View>

            <Text style={[styles.aiMessage, { fontSize: 14 * fontScale }]}>
              “{activeRecord.mensagemFlor || activeFlower.mensagemFallback}”
            </Text>

            <Text style={[styles.aiCaption, { fontSize: 11 * fontScale }]}>
              {activeRecord.mensagemFlor
                ? 'Mensagem acolhedora personalizada via IAGen (apoio não clínico).'
                : `Simbolismo: ${activeFlower.simbolismo}`}
            </Text>

            {onPressRecord && (
              <Pressable
                onPress={() => onPressRecord(activeRecord)}
                accessibilityRole="button"
                style={styles.detailActionBtn}
              >
                <Text style={[styles.detailActionText, { fontSize: 13 * fontScale }]}>
                  Ver registro completo deste dia
                </Text>
              </Pressable>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.emptyTitle, { fontSize: 14 * fontScale }]}>
              {activeDay.isToday
                ? 'O vaso de hoje ainda está em repouso.'
                : `Nenhum registro em ${activeDay.weekdayLabel} (${activeDay.dayNumber}) — e tudo bem fazer pausas.`}
            </Text>
            <Text style={[styles.emptySubtitle, { fontSize: 13 * fontScale }]}>
              Ao registrar como você se sente, uma flor real desabrocha neste vaso junto com uma mensagem de acolhimento.
            </Text>
            {activeDay.isToday && onPressRegisterToday && (
              <Pressable
                onPress={onPressRegisterToday}
                accessibilityRole="button"
                style={styles.plantBtn}
              >
                <Text style={[styles.plantBtnText, { fontSize: 14 * fontScale }]}>
                  Registrar o clima de hoje
                </Text>
              </Pressable>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  headerTitleBox: {
    flex: 1,
  },
  eyebrow: {
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#4B5563',
    marginBottom: 2,
  },
  title: {
    fontWeight: '700',
    color: '#1F2937',
  },
  dayBadge: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  dayBadgeText: {
    fontWeight: '600',
    color: '#374151',
  },
  shelfRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  potSlot: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 14,
    minWidth: 62,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  potSlotSelected: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderColor: '#5B7B6A',
  },
  weekdayText: {
    marginTop: 2,
    fontWeight: '600',
    color: '#4B5563',
  },
  weekdayTextSelected: {
    color: '#1F2937',
    fontWeight: '700',
  },
  dayNumText: {
    color: '#6B7280',
  },
  woodBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A9714B',
    marginTop: 2,
    marginBottom: 14,
  },
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  detailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 6,
  },
  flowerName: {
    fontWeight: '700',
  },
  scientificName: {
    fontStyle: 'italic',
    color: '#6B7280',
  },
  aiMessage: {
    color: '#1F2937',
    lineHeight: 21,
  },
  aiCaption: {
    color: '#6B7280',
  },
  detailActionBtn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#EEF2F0',
  },
  detailActionText: {
    color: '#2E5A44',
    fontWeight: '600',
  },
  emptyTitle: {
    fontWeight: '700',
    color: '#1F2937',
  },
  emptySubtitle: {
    color: '#4B5563',
    lineHeight: 19,
  },
  plantBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#3B6E57',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  plantBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});