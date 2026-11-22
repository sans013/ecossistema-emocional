import { PublicUser, UserExportData, UserPreferences } from '../../domain/entities/User';

export function presentUser(user: PublicUser) {
  return {
    id: user.id,
    nome_exibicao: user.nomeExibicao,
    email: user.email,
    consentimento_lgpd: user.consentimentoLgpd,
    consentimento_aceito_em: user.consentimentoAceitoEm,
    criado_em: user.criadoEm,
    atualizado_em: user.atualizadoEm,
  };
}

export function presentPreferences(pref: UserPreferences) {
  return {
    nivel_ecossistema: pref.nivelEcossistema,
    rotulos_humor_custom: pref.rotulosHumorCustom,
    lembretes_ativos: pref.lembretesAtivos,
    lembretes_turnos: pref.lembretesTurnos,
    tamanho_fonte: pref.tamanhoFonte,
    rotulos_sempre_visiveis: pref.rotulosSempreVisiveis,
    atualizado_em: pref.atualizadoEm,
  };
}

export function presentExportData(data: UserExportData) {
  return {
    exportado_em: data.exportadoEm,
    usuario: presentUser(data.usuario),
    preferencias: presentPreferences(data.preferencias),
    registros: data.registros.map((r) => ({
      id: r.id,
      nivel_humor: r.nivelHumor,
      contextos: r.contextos,
      pensamento: r.pensamento,
      registrado_em: r.registradoEm,
      atualizado_em: r.atualizadoEm,
    })),
  };
}