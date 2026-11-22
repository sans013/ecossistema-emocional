export interface FlowerInfo {
  nivelHumor: 1 | 2 | 3 | 4 | 5;
  rotuloPadrao: string;
  clima: string;
  flor: string;
  nomeCientifico: string;
  simbolismo: string;
  mensagemFallback: string;
  ceuFundo: string;
  ceuBorda: string;
  corDestaque: string;
  iconeClima: string;
}

export const FLOWER_CATALOG: Record<1 | 2 | 3 | 4 | 5, FlowerInfo> = {
  1: {
    nivelHumor: 1,
    rotuloPadrao: 'Muito mal',
    clima: 'Tempestade',
    flor: 'Lírio-da-paz',
    nomeCientifico: 'Spathiphyllum wallisii',
    simbolismo: 'Abrigo, resistência silenciosa na sombra e permissão para desacelerar.',
    mensagemFallback:
      'Como o lírio-da-paz que floresce mesmo na sombra, você tem permissão para desacelerar hoje. Um gesto simples de descanso já é cuidado.',
    ceuFundo: '#E3E9F0',
    ceuBorda: '#94A3B8',
    corDestaque: '#475569',
    iconeClima: '⛈️',
  },
  2: {
    nivelHumor: 2,
    rotuloPadrao: 'Mal',
    clima: 'Névoa',
    flor: 'Lavanda',
    nomeCientifico: 'Lavandula angustifolia',
    simbolismo: 'Acolhimento, alívio suave da tensão e cuidado gentil em dias nublados.',
    mensagemFallback:
      'Como a lavanda sob a névoa, acolha o seu ritmo sem cobrança neste momento. Respire fundo e dê apenas um pequeno passo gentil por vez.',
    ceuFundo: '#EDE9F5',
    ceuBorda: '#B4A2D8',
    corDestaque: '#6D4C9E',
    iconeClima: '🌫️',
  },
  3: {
    nivelHumor: 3,
    rotuloPadrao: 'Neutro',
    clima: 'Brisa',
    flor: 'Camomila',
    nomeCientifico: 'Matricaria chamomilla',
    simbolismo: 'Serenidade, equilíbrio cotidiano e valorização das pausas simples.',
    mensagemFallback:
      'Como a camomila em uma brisa calma, os dias equilibrados sustentam o seu caminho. Observe um pequeno detalhe que trouxe tranquilidade hoje.',
    ceuFundo: '#E7F3EE',
    ceuBorda: '#8BBFA8',
    corDestaque: '#2E6B55',
    iconeClima: '🍃',
  },
  4: {
    nivelHumor: 4,
    rotuloPadrao: 'Bem',
    clima: 'Sol ameno',
    flor: 'Margarida',
    nomeCientifico: 'Bellis perennis',
    simbolismo: 'Leveza, clareza e apreciação das pequenas conquistas do cotidiano.',
    mensagemFallback:
      'Como a margarida aberta ao sol ameno, reconheça os gestos simples que trouxeram leveza hoje. Guardar essa lembrança fortalece os próximos dias.',
    ceuFundo: '#FFF7E0',
    ceuBorda: '#E6C267',
    corDestaque: '#9A6B11',
    iconeClima: '🌤️',
  },
  5: {
    nivelHumor: 5,
    rotuloPadrao: 'Muito bem',
    clima: 'Céu limpo',
    flor: 'Girassol',
    nomeCientifico: 'Helianthus annuus',
    simbolismo: 'Vitalidade, abertura e celebração genuína de momentos luminosos.',
    mensagemFallback:
      'Como o girassol voltado ao céu limpo, celebre essa vitalidade com presença e afeto. Aproveite a energia boa sem pressa nem cobrança.',
    ceuFundo: '#FEF3C7',
    ceuBorda: '#F59E0B',
    corDestaque: '#B45309',
    iconeClima: '☀️',
  },
};

export function getFlowerByMood(nivelHumor: number): FlowerInfo {
  if (nivelHumor >= 1 && nivelHumor <= 5) {
    return FLOWER_CATALOG[nivelHumor as 1 | 2 | 3 | 4 | 5];
  }
  return FLOWER_CATALOG[3];
}