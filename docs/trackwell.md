#### 3.2. Crie `docs/trackwell.md`

```markdown
# Mapeamento das 10 Recomendações do Guia TrackWell

Este documento detalha como o aplicativo **Ecossistema Emocional** traduz as 10 recomendações do Guia TrackWell para ferramentas digitais de automonitoramento emocional em decisões concretas de produto, interface e arquitetura.

| # | Recomendação TrackWell | Implementação no Ecossistema Emocional | Onde verificar no código |
| :-: | :--- | :--- | :--- |
| **1** | **Baixa fricção e flexibilidade no registro** | Permite tanto o **Salvar rápido** (apenas selecionando o estado/clima em um toque na tela inicial ou no formulário) quanto o registro detalhado com contextos e texto livre opcional. | `HomeScreen.tsx`, `CreateRecordScreen.tsx` |
| **2** | **Linguagem acolhedora, gentil e não clínica** | Microcopy empática, sem julgamentos ou diagnósticos (ex.: *"sem pressa"*, *"tudo bem fazer pausas"*), reforçando o foco em autoconhecimento. | `MoodCatalog.ts`, `RecordSavedScreen.tsx`, `ReflectionScreen.tsx` |
| **3** | **Gamificação opcional e livre de punição** | A metáfora do jardim/ecossistema nunca exibe sequências quebradas (*streaks*) nem penalidades por ausência, podendo ser ajustada entre **Desativada**, **Suave** e **Completa**. | `HomeScreen.tsx`, `SettingsScreen.tsx`, `preferencias_usuario` |
| **4** | **Personalização do vocabulário emocional** | O usuário pode renomear os rótulos dos 5 estados emocionais conforme sua própria vivência e restaurar os padrões quando desejar, refletindo em todo o aplicativo. | `CustomMoodLabelsScreen.tsx`, `MoodCatalog.ts` |
| **5** | **Acessibilidade independente da personalização** | Controles de **Acessibilidade** (*Tamanho da fonte*: Padrão, Grande, Extra grande + *Rótulos de texto sempre visíveis*) ficam em seção dedicada, separada da personalização visual, com escalonamento dinâmico via `ThemeContext`. | `SettingsScreen.tsx`, `ThemeContext.tsx`, `AppText.tsx`, `BottomTabBar.tsx` |
| **6** | **Contextos opcionais para dar sentido aos estados** | Associação opcional de múltiplos contextos do cotidiano (*Sono*, *Estudo*, *Trabalho*, *Descanso*, *Relações*) e anotações abertas, com filtragem no Diário sem perder os demais contextos do registro. | `ContextChipGroup.tsx`, `DiaryScreen.tsx`, `PgEmotionalRecordRepository.ts` |
| **7** | **Visualização reflexiva simples e orientada a padrões** | A aba **Reflexão** apresenta frequências de humor e contextos mais presentes em janelas de **7 ou 30 dias** acompanhadas de convite aberto de reflexão, evitando gráficos densos ou notas de desempenho. | `ReflectionScreen.tsx`, `GET /api/v1/reflexao/resumo` |
| **8** | **Notificações e lembretes sob controle do usuário** | Lembretes vêm desativados por padrão; o usuário decide se deseja ativar convites gentis e escolhe os turnos preferidos (*Manhã*, *Tarde*, *Noite*). | `RemindersSettingsScreen.tsx`, `meSchemas.ts` |
| **9** | **Transparência, privacidade e controle sobre os dados (LGPD)** | Consentimento explícito com caixa desmarcada por padrão antes do primeiro registro, Política de Privacidade em linguagem simples, exportação integral em JSON e exclusão de registros ou da conta. | `LgpdConsentScreen.tsx`, `PrivacyPolicyScreen.tsx`, `requireLgpdConsent.ts`, `MeController.ts` |
| **10** | **Apoio humano e limites claros da ferramenta** | Tela dedicada de **Apoio Profissional** esclarecendo que o app não substitui acompanhamento clínico e indicando canais reais de suporte (UBS/CAPS, CVV 188 e SAMU 192). | `ProfessionalSupportScreen.tsx`, `SettingsScreen.tsx` |