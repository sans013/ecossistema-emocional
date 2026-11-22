# Arquitetura do Sistema — Ecossistema Emocional

## 1. Visão Geral

O **Ecossistema Emocional** é uma plataforma mobile-first de registro e reflexão emocional construída em monorepo com três módulos independentes:

- **`database/`**: Script DDL idempotente para PostgreSQL (`init.sql`), executado como processo administrativo isolado.
- **`backend/`**: API REST em Node.js + Express + TypeScript seguindo **Clean Architecture**, **SOLID/DRY** e os princípios de **Twelve-Factor App**.
- **`mobile/`**: Aplicativo React Native (Expo + TypeScript) estruturado em **Clean Architecture + MVVM**, com suporte a acessibilidade, sensibilidade ao contexto, armazenamento seguro e observabilidade.

    [ Mobile (React Native / Expo) ]
       Presentation (Screens + ViewModels + Theme/Components)
            │
            ▼
       Domain (Entities + MoodCatalog + Repository Interfaces)
            ▲
            │
       Data (HttpClient + ApiRepositories + SecureTokenStorage + Observability)
            │  HTTPS / JSON + Bearer JWT
            ▼
    [ Backend (Node.js / Express / TypeScript) ]
       Presentation (Routes + Middlewares + Controllers + Presenters)
            │
            ▼
       Application (Zod Schemas + Use Cases)
            │
            ▼
       Domain (Entities + Errors + Repository & Security Interfaces)
            ▲
            │
       Infra (PgRepositories + Bcrypt + JWT + Env + Logger + Container)
            │
            ▼
    [ PostgreSQL (database/init.sql) ]

---

## 2. Clean Architecture e MVVM

### Backend (`backend/src/`)
- **`domain/`**: Regras puras, entidades (`User`, `EmotionalRecord`), erros (`AppError`) e contratos (`UserRepository`, `EmotionalRecordRepository`, `PasswordHasher`, `TokenService`). Zero dependência de Express ou `pg`.
- **`application/`**: Schemas de validação server-side (`zod`) e casos de uso isolados (`AuthUseCases`, `MeUseCases`, `EmotionalRecordUseCases`).
- **`infra/`**: Implementações concretas (`PgUserRepository`, `PgEmotionalRecordRepository`, `BcryptPasswordHasher`, `JwtTokenService`), validação *fail-fast* de variáveis de ambiente (`env.ts`), logger estruturado (`logger.ts`) e *composition root* (`createContainer.ts`).
- **`presentation/`**: Controllers, presenters de contrato JSON, rotas versionadas (`/api/v1/...`) e middlewares (`authenticate`, `requireLgpdConsent`, `errorHandler`).

### Mobile (`mobile/src/`)
- **`domain/`**: Entidades, catálogo único de humores/climas (`MoodCatalog.ts` — princípio DRY), sensibilidade ao turno do dia (`ContextService.ts`) e interfaces de repositórios/serviços.
- **`data/`**: Cliente HTTP centralizado (`HttpClient.ts`) com timeout e tratamento de erros de rede, repositórios REST, `SecureTokenStorage` (`expo-secure-store`) e `AppObservabilityService` (sanitização de segredos e ponto de integração para Crashlytics).
- **`presentation/`**:
  - **ViewModels (`SessionContext`, `RecordsViewModel`, `AuthViewModel`)**: Orquestram estado, sessão, rede (`NetInfo`), regras de formulário e sincronização com a API.
  - **Theme & Components (`ThemeContext`, `tokens.ts`, `AppText`, `AppButton`, `AppCard`, `MoodScaleSelector`, `ContextChipGroup`, `BottomTabBar`, `ScreenContainer`)**: Design System consistente, acessível e responsivo.
  - **Screens & Modals**: Telas focadas em renderização e delegação de ações aos ViewModels.

---

## 3. Aderência ao Twelve-Factor App

| Fator | Aplicação no Projeto |
| :--- | :--- |
| **1. Base de Código** | Repositório único Git com fluxo `main` ← `develop` ← `feat/*` via Pull Requests. |
| **2. Dependências** | Declaradas explicitamente em `backend/package.json` e `mobile/package.json` com lockfiles. |
| **3. Configurações** | Separadas do código via `.env` (ignorado no Git) e documentadas em `.env.example`, com validação Zod na subida (`env.ts`). |
| **4. Serviços de Apoio** | PostgreSQL conectado exclusivamente via `DATABASE_URL` como recurso anexável. |
| **5. Construir, Lançar, Executar** | Scripts separados (`npm run build`, `npm start`, `npm run typecheck`). |
| **6. Processos** | API *stateless*: sessão autenticada por JWT no cabeçalho `Authorization: Bearer`. |
| **7. Vínculo de Porta** | API expõe serviço via variável `PORT` (`app.listen(env.PORT)`). |
| **8. Concorrência** | Processos independentes sem estado em memória entre requisições. |
| **9. Descartabilidade** | Inicialização rápida e *graceful shutdown* em `SIGINT`/`SIGTERM` fechando servidor e pool do banco. |
| **10. Dev/Prod Similares** | Mesmo PostgreSQL 16 e mesmo `database/init.sql` executados localmente e no CI. |
| **11. Logs** | Eventos estruturados em JSON emitidos diretamente para `stdout`/`stderr` (`logger.ts`). |
| **12. Processos de Admin** | Criação/migração de schema executada de forma isolada e idempotente via `database/init.sql`. |

---

## 4. Segurança, Privacidade (LGPD) e Observabilidade

- **Credenciais e Senhas**: Senhas armazenadas exclusivamente com hash `bcryptjs` (salt configurável). Nenhum `.env` ou chave é versionado no Git.
- **Armazenamento Seguro no Dispositivo**: Token JWT salvo no keystore nativo via `expo-secure-store` (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`).
- **Isolamento por Usuário**: Todas as consultas, edições e exclusões de registros usam o `userId` extraído exclusivamente do token JWT validado, nunca de parâmetros do cliente.
- **LGPD**:
  - Consentimento explícito com caixa desmarcada por padrão antes do primeiro registro, reforçado também no servidor pelo middleware `requireLgpdConsent` (`HTTP 403`).
  - Política de Privacidade acessível em linguagem simples.
  - Exportação completa dos próprios dados em JSON (`GET /api/v1/me/export`).
  - Exclusão de todos os registros (`DELETE /api/v1/me/registros`) ou exclusão permanente da conta em cascata (`DELETE /api/v1/me`).
- **Observabilidade**: `AppObservabilityService` sanitiza chaves sensíveis (`senha`, `token`, `authorization`, `secret`) antes de registrar eventos/erros e centraliza o gancho para Crashlytics em builds nativos.

---

## 5. Pirâmide de Testes e CI

O workflow `.github/workflows/ci.yml` executa automaticamente em cada push/PR para `develop` e `main`:
1. **Banco de Dados**: Valida `database/init.sql` em PostgreSQL 16 (duas execuções para garantir idempotência).
2. **Backend**: `typecheck` + testes unitários (`vitest`) + testes de integração ponta a ponta contra PostgreSQL real (`supertest`).
3. **Mobile**: `typecheck` + testes unitários de domínio/HTTP/ViewModel + testes E2E de interface (`jest-expo` + `@testing-library/react-native`).