import React from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { SPACING } from '../theme/tokens';
import { AppStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'ProfessionalSupport'>;

export function ProfessionalSupportScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <ScreenHeader
        title="Encontre apoio profissional"
        subtitle="O aplicativo apoia seu automonitoramento e não substitui cuidado clínico"
        onBack={() => navigation.goBack()}
      />

      <AppCard style={styles.card}>
        <AppText variant="cardTitle" style={styles.cardTitle}>
          Acompanhamento psicológico e médico
        </AppText>
        <AppText variant="body">
          Se você está passando por momentos de sofrimento intenso ou ansiedade persistente,
          considere conversar com um psicólogo, médico ou buscar os serviços públicos de saúde da
          sua rede local (como as Unidades Básicas de Saúde e os Centros de Atenção Psicossocial —
          CAPS).
        </AppText>
      </AppCard>

      <AppCard style={styles.card}>
        <AppText variant="cardTitle" style={styles.cardTitle}>
          Apoio emocional gratuito no Brasil
        </AppText>
        <AppText variant="body">
          O CVV (Centro de Valorização da Vida) oferece apoio emocional e prevenção ao suicídio de
          forma sigilosa e gratuita pelo telefone 188 (24 horas) ou pelo site cvv.org.br. Em
          emergências médicas imediatas, procure o pronto atendimento ou acione o SAMU (192).
        </AppText>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    marginBottom: 6,
  },
});