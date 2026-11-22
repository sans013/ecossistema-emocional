import {
  EmotionalRecord,
  ReflectionSummary,
} from '../../domain/entities/EmotionalRecord';

export function presentEmotionalRecord(record: EmotionalRecord) {
  return {
    id: record.id,
    nivel_humor: record.nivelHumor,
    contextos: record.contextos,
    pensamento: record.pensamento,
    mensagem_flor: record.mensagemFlor ?? null,
    registrado_em: record.registradoEm,
    atualizado_em: record.atualizadoEm,
  };
}

export function presentReflectionSummary(summary: ReflectionSummary) {
  return {
    periodo_dias: summary.periodoDias,
    total_registros: summary.totalRegistros,
    frequencia_humores: summary.frequenciaHumores.map((item) => ({
      nivel_humor: item.nivelHumor,
      quantidade: item.quantidade,
    })),
    contextos_mais_presentes: summary.contextosMaisPresentes.map((item) => ({
      slug: item.slug,
      nome: item.nome,
      quantidade: item.quantidade,
    })),
  };
}