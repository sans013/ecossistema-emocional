# Ecossistema Emocional

Aplicativo móvel de apoio ao bem-estar e autoconhecimento emocional desenvolvido para a disciplina de Desenvolvimento de Aplicativos Móveis — Universidade Federal do Paraná (UFPR), Campus Palotina.

**Autor:** Samuel Wesley de Alcântara Magalhães  
**Repositório:** `https://github.com/sans013/ecossistema-emocional`

> **Aviso de caráter não clínico:** O Ecossistema Emocional tem caráter exclusivo de apoio, acompanhamento pessoal e reflexão. O aplicativo não realiza diagnósticos, não prescreve tratamentos e não substitui acompanhamento médico ou psicológico profissional.

---

## 1. Apresentação do aplicativo

### Tema e público-alvo
O **Ecossistema Emocional** é um aplicativo no domínio de **Saúde Mental** voltado para registro de estados emocionais, observação de contextos cotidianos e reflexão periódica com apoio visual acolhedor. O público-alvo compreende jovens adultos, estudantes universitários e pessoas que desejam acompanhar sua rotina emocional de forma leve, privada e livre de pressões por desempenho.

### Funcionalidades implementadas e justificativas

| Funcionalidade | Descrição | Justificativa |
| :--- | :--- | :--- |
| **Cadastro e autenticação segura** | Criação de conta com nome de exibição, e-mail e senha forte, login com token JWT e persistência segura de sessão no dispositivo. | Garante confidencialidade de dados pessoais sensíveis e isolamento estrito entre contas (LGPD). |
| **Consentimento LGPD e Política de Privacidade** | Tela obrigatória antes do primeiro registro, com caixa desmarcada por padrão, explicação em linguagem simples sobre dados sensíveis e tela dedicada de Política de Privacidade. | Cumpre a Lei nº 13.709/2018 e promove transparência desde o primeiro contato com o aplicativo. |
| **Floricultura Emocional Semanal (7 vasos + 5 flores reais)** | Prateleira interativa na tela inicial com 7 vasos (últimos 7 dias), onde cada humor cultiva uma flor real (*Lírio-da-paz*, *Lavanda*, *Camomila*, *Margarida* ou *Girassol*) associada ao clima emocional daquele dia. | Transforma o acompanhamento emocional em uma metáfora visual tangível e acolhedora, mantendo os dias sem registro em repouso calmo, livre de punições ou perda de sequências. |
| **Mensagens acolhedoras personalizadas com IAGen** | Integração com API própria de IAGen (Google Gemini) alimentada por catálogo botânico e diretrizes éticas versionadas em `iagen-api/materiais/`. | Oferece acolhimento imediato conectado ao simbolismo da flor e ao relato opcional do usuário, com envio anonimizado e controle explícito por checkbox. |
| **CRUD completo de registros emocionais** | Criação rápida (apenas humor) ou detalhada (humor, contextos e pensamento), listagem com filtros por contexto, visualização detalhada, edição e exclusão com confirmação. | Atende diferentes níveis de energia do usuário no momento do registro e garante autonomia sobre o próprio histórico. |
| **Painel de Reflexão (7 e 30 dias)** | Consolidação de frequência de humores/flores, contextos mais presentes e convite aberto à reflexão. | Facilita a identificação de padrões cotidianos com visualizações simples e livres de julgamento. |
| **Relatório em PDF e portabilidade JSON** | Geração e download/compartilhamento de relatório formatado em PDF diretamente pelo aplicativo (além de exportação JSON), contendo exclusivamente os dados persistidos do titular autenticado. | Permite ao usuário guardar seu histórico ou levá-lo como apoio a conversas com profissionais de saúde mental. |
| **Personalização e Acessibilidade** | Controle de intensidade da floricultura (`Desativada`, `Suave`, `Completa`), rótulos customizados para os 5 humores, lembretes por turno, ajuste de fonte (`Normal`, `Grande`, `Extra grande`) e modo de rótulos sempre visíveis. | Adapta o aplicativo às preferências e necessidades visuais/cognitivas individuais, mantendo tudo persistido no banco. |
| **Apoio Profissional e Exclusão de Conta** | Tela com canais de acolhimento (como CVV 188 e CAPS) e controles em Ajustes para apagar registros ou excluir permanentemente a conta. | Reforça o papel ético de apoio não clínico e assegura o direito de eliminação de dados previsto na LGPD. |

---

## 2. Tecnologias e bibliotecas utilizadas

### 2.1. Banco de Dados
| Tecnologia | Versão | Motivo da escolha |
| :--- | :--- | :--- |
| **PostgreSQL** | 16+ | SGBD relacional robusto, com suporte nativo a chaves estrangeiras em cascata (`ON DELETE CASCADE`), UUIDs, JSONB (para preferências customizadas) e integridade transacional. |

### 2.2. API Principal (`backend/`)
| Tecnologia / Biblioteca | Versão | Motivo da escolha |
| :--- | :--- | :--- |
| **Node.js + TypeScript** | Node 20+ / `^7.0.2` | Tipagem estática rigorosa em todo o domínio e unificação de linguagem com o frontend e a API de IAGen. |
| **Express** | `^5.3.0` | Framework HTTP maduro e enxuto, com suporte nativo a erros assíncronos e middlewares modulares. |
| **pg** | `^8.23.1` | Driver oficial do PostgreSQL para Node.js com pool de conexões e consultas parametrizadas contra SQL Injection. |
| **bcryptjs** | `^3.0.3` | Hashing seguro de senhas com salt individual antes do armazenamento no banco de dados. |
| **jsonwebtoken** | `^9.0.3` | Emissão e verificação de tokens JWT para proteção das rotas restritas da API. |
| **zod** | `^4.6.7` | Validação declarativa de payloads, parâmetros de rota, queries e variáveis de ambiente na inicialização. |
| **helmet** | `^8.3.0` | Aplicação automática de cabeçalhos HTTP de segurança contra vetores comuns na web. |
| **cors** | `^2.8.6` | Controle explícito das origens autorizadas a consumir a API. |
| **dotenv** | `^18.0.10` | Carregamento de variáveis sensíveis a partir de `.env` local (fora do controle de versão). |
| **vitest + supertest + tsx** | `^5.1.1` / `^7.3.2` / `^4.23.15` | Execução rápida de testes unitários e de integração HTTP + PostgreSQL, além de execução direta de TypeScript em desenvolvimento. |

### 2.3. API de Inteligência Artificial Generativa (`iagen-api/`)
| Tecnologia / Biblioteca | Versão | Motivo da escolha |
| :--- | :--- | :--- |
| **Express + TypeScript** | `^4.21.2` / `^5.7.3` | Serviço dedicado e desacoplado da API transacional, isolando latência e falhas da chamada externa de IAGen. |
| **Google Gemini API** | `gemini-3.5-flash-lite` (fallback: `gemini-3.8-flash`) | Modelo generativo de baixa latência para textos curtos em português, com fallback automático para maior disponibilidade. |
| **zod + helmet + cors + dotenv** | `^3.24.2` / `^8.0.0` / `^2.8.5` / `^16.4.7` | Validação estrita do contrato de entrada (apenas dados anonimizados) e proteção da chave da API via ambiente local. |
| **vitest + supertest + tsx** | `^3.0.4` / `^7.0.0` / `^4.19.2` | Validação automatizada do carregamento dos materiais, da montagem do prompt e das rotas HTTP. |

### 2.4. Aplicativo Móvel (`mobile/`)
| Tecnologia / Biblioteca | Versão | Motivo da escolha |
| :--- | :--- | :--- |
| **React Native + Expo** | `0.88.1` / `~58.0.26` | Desenvolvimento multiplataforma com acesso simplificado a APIs nativas, testes rápidos e empacotamento de APK via EAS Build. |
| **React + TypeScript** | `19.3.0` / `~6.0.3` | Interface declarativa baseada em componentes reutilizáveis com segurança de tipos em telas, repositórios e navegação. |
| **React Navigation (`native`, `native-stack`, `bottom-tabs`)** | `^7.5.2` / `^7.21.1` / `^7.22.0` | Organização clara dos fluxos de autenticação, consentimento LGPD, abas principais e telas secundárias. |
| **expo-secure-store** | `~58.0.3` | Armazenamento criptografado do token JWT no dispositivo (Keystore/Keychain), evitando persistência em texto puro. |
| **expo-print + expo-sharing** | `~58.0.9` / `~58.0.23` | Geração real de arquivos PDF a partir de HTML estruturado e compartilhamento/download nativo no dispositivo. |
| **react-native-svg** | `15.16.0` | Renderização vetorial nítida das 5 flores reais e dos 7 vasos da floricultura sem perda de qualidade em diferentes densidades de tela. |
| **@react-native-community/netinfo** | `12.0.1` | Detecção em tempo real do estado de conexão (Online/Offline) para adaptação sensível ao contexto. |
| **@expo/vector-icons** | `^15.0.2` | Iconografia padronizada (Ionicons) para reforço visual junto aos rótulos textuais. |
| **react-native-safe-area-context + react-native-screens** | `~5.11.1` / `~4.30.1` | Respeito às áreas seguras (notch e barras do sistema) e otimização de memória na navegação nativa. |
| **expo-build-properties** | Instalado via Expo | Configuração declarativa de propriedades nativas Android no APK de produção (como `usesCleartextTraffic` para testes em rede local). |
| **jest + jest-expo + @testing-library/react-native** | `~30.5.2` / `~58.0.15` / `^14.1.0` | Testes unitários e end-to-end (E2E) dos fluxos de autenticação, LGPD, CRUD e acessibilidade. |

---

## 3. Decisões arquiteturais

O repositório está organizado em monorepo com quatro diretórios principais (`database/`, `backend/`, `iagen-api/` e `mobile/`), mantendo cada serviço independente quanto a dependências, variáveis de ambiente e testes.

```text
ecossistema-emocional/
├── database/
│   └── init.sql                 # Script idempotente de criação do esquema PostgreSQL
├── backend/                     # API Principal (Clean Architecture)
│   └── src/
│       ├── domain/              # Entidades, contratos de repositórios/serviços e erros
│       ├── application/         # Casos de uso (Auth, Me, EmotionalRecords) e schemas Zod
│       ├── infra/               # Pool PostgreSQL, repositórios Pg*, Bcrypt, JWT, container DI
│       └── presentation/        # Express app, rotas, controllers, middlewares e presenters
├── iagen-api/                   # API de IAGen desacoplada
│   ├── materiais/               # Base de conhecimento versionada (flores + diretrizes éticas)
│   └── src/
│       ├── config/              # Validação de variáveis de ambiente
│       ├── domain/              # Leitor de materiais e construtor de prompt fundamentado
│       ├── infra/               # Cliente Gemini com timeout, retry e fallback de modelos
│       └── presentation/        # Rotas HTTP (/health, /api/v1/materiais, /api/v1/mensagem-flor)
└── mobile/                      # Aplicativo React Native (Clean Architecture + MVVM)
    └── src/
        ├── domain/              # Entidades, catálogos (MoodCatalog, FlowerCatalog) e interfaces
        ├── data/                # HttpClient, Api*Repositories, SecureTokenStorage, PdfReportService
        └── presentation/        # Telas, componentes reutilizáveis, tema, navegação e ViewModels
```

### Justificativas das decisões arquiteturais
1. **Clean Architecture no `backend/`:** Separar `domain`, `application`, `infra` e `presentation` impede acoplamento entre regras de negócio e biblioteca HTTP/banco de dados, facilitando testes unitários com repositórios em memória e testes de integração contra o PostgreSQL real.
2. **Microsserviço dedicado para `iagen-api/`:** Isolar a geração de texto em um serviço separado evita que oscilações ou latência do provedor externo de IA bloqueiem as operações críticas de CRUD. Os arquivos de `iagen-api/materiais/` são lidos em tempo de execução, garantindo que toda mensagem siga as diretrizes botânicas e éticas versionadas no repositório.
3. **Clean Architecture + MVVM no `mobile/`:** As telas (`presentation/screens`) concentram apenas interface e interação; o gerenciamento de estado e regras de apresentação ficam nos ViewModels/Contexts (`SessionContext`, `RecordsViewModel`); a comunicação HTTP e geração de PDF ficam isoladas em `data/`. Essa separação facilita manutenção, troca de implementações e execução de testes E2E sem dependência de rede externa.

---

## 4. Execução em ambiente de desenvolvimento

### 4.1. Programas necessários
Instale previamente na máquina:
- **Git** (para clonar o repositório)
- **Node.js 20 LTS** ou superior (inclui `npm`)
- **PostgreSQL 16+** (com utilitário `psql` no PATH)
- **Expo Go** no celular Android/iOS (ou navegador Web / Emulador Android)

### 4.2. Clonar o repositório e posicionar os arquivos do ZIP
1. Clone o repositório público:
   ```bash
   git clone [https://github.com/sans013/ecossistema-emocional.git](https://github.com/sans013/ecossistema-emocional.git)
   cd ecossistema-emocional
   ```
2. Extraia o arquivo **ZIP entregue na UFPR Virtual** e copie cada arquivo para o local exato indicado abaixo:

| Arquivo dentro do ZIP | Local exato de destino no projeto | Finalidade |
| :--- | :--- | :--- |
| `backend/.env` | `ecossistema-emocional/backend/.env` | Credenciais do PostgreSQL, segredo JWT, porta `3000` e CORS da API principal. |
| `iagen-api/.env` | `ecossistema-emocional/iagen-api/.env` | Chave `GEMINI_API_KEY`, modelos (`gemini-3.5-flash-lite` e fallback `gemini-3.8-flash`), porta `3001` e CORS. |
| `mobile/.env` | `ecossistema-emocional/mobile/.env` | URLs `EXPO_PUBLIC_API_BASE_URL` e `EXPO_PUBLIC_IAGEN_API_URL` apontando para as duas APIs. |

*(Caso prefira configurar manualmente sem o ZIP, utilize os arquivos `.env.example` presentes em cada pasta como modelo.)*

### 4.3. Criar o banco de dados PostgreSQL
Crie o banco e execute o script de estrutura versionado no repositório:
```bash
psql -U postgres -c "CREATE DATABASE ecossistema_emocional;"
psql -U postgres -d ecossistema_emocional -f database/init.sql
```
*(Ajuste o usuário/senha em `backend/.env` caso o seu PostgreSQL local utilize credenciais diferentes.)*

### 4.4. Iniciar a API principal (Terminal 1 — porta `3000`)
```bash
cd backend
npm install
npm run dev
```
Verificação: acesse `http://localhost:3000/health` e confirme o retorno `{"status":"ok",...}`.

### 4.5. Iniciar a API de IAGen (Terminal 2 — porta `3001`)
```bash
cd iagen-api
npm install
npm run dev
```
Verificação: acesse `http://localhost:3001/health` e confirme `"materiais_carregados": 5`.

### 4.6. Iniciar o aplicativo React Native (Terminal 3)
> **Observação para teste em celular físico via Expo Go:** em `mobile/.env`, substitua `localhost` pelo endereço IPv4 da sua máquina na mesma rede Wi-Fi (ex.: `http://192.168.x.x:3000/api/v1` e `http://192.168.x.x:3001/api/v1`), mantenha `CORS_ORIGIN=*` nos `.env` das APIs e libere as portas `3000` e `3001` no Firewall.

```bash
cd mobile
npm install
npx expo start
```
- Pressione **`w`** para abrir na Web (`http://localhost:8081`), **`a`** para abrir no Emulador Android, ou escaneie o **QR Code** com o aplicativo **Expo Go**.

### 4.7. Executar a suíte de testes automatizados (opcional)
```bash
# Backend (unitários + integração com PostgreSQL)
cd backend && npm run typecheck && npm test && npm run test:integration

# API de IAGen
cd ../iagen-api && npm run typecheck && npm test

# Mobile (unitários + E2E)
cd ../mobile && npm run typecheck && npm test
```

---

## 5. Geração do APK para o ambiente de produção

O empacotamento Android em formato `.apk` instalável é realizado com **EAS Build** (Expo Application Services).

### 5.1. Configurações já presentes no repositório
- **`mobile/app.json`**: define nome oficial (`Ecossistema Emocional`), `orientation: "default"`, identificador `android.package: "br.ufpr.ecossistemaemocional"` e plugin `expo-build-properties` com `android.usesCleartextTraffic: true` (permitindo comunicação HTTP com o servidor em ambientes de teste acadêmico).
- **`mobile/eas.json`**: configura o perfil `production` com `"environment": "production"`, `"distribution": "internal"` e `"android": { "buildType": "apk" }`, garantindo a geração de `.apk` direto com injeção das variáveis de ambiente de produção.

### 5.2. Passo a passo de geração do APK
1. Acesse a pasta `mobile` e autentique-se na conta Expo:
   ```bash
   cd mobile
   npx eas-cli login
   ```
2. Vincule o projeto ao EAS (necessário apenas na primeira vez):
   ```bash
   npx eas-cli init
   ```
3. Cadastre as URLs das duas APIs no ambiente `production` do EAS (substituindo `IP_OU_DOMINIO` pelo endereço acessível pelo celular):
   ```bash
   npx eas-cli env:create --name EXPO_PUBLIC_API_BASE_URL --value "http://IP_OU_DOMINIO:3000/api/v1" --environment production --visibility plaintext --force
   npx eas-cli env:create --name EXPO_PUBLIC_IAGEN_API_URL --value "http://IP_OU_DOMINIO:3001/api/v1" --environment production --visibility plaintext --force
   ```
4. Dispare a compilação do `.apk` na nuvem:
   ```bash
   npx eas-cli build -p android --profile production
   ```
5. Na primeira compilação, confirme com `Y` para o EAS gerar e gerenciar a Keystore Android. Ao concluir, o terminal (e o painel `expo.dev`) exibirá o link de download e o QR Code do arquivo `.apk` para instalação direta no dispositivo Android.

---

## 6. Requisitos de qualidade adotados

| Atributo de qualidade | Medidas adotadas | Justificativa |
| :--- | :--- | :--- |
| **Facilidade de uso (Usabilidade)** | Fluxo de check-in rápido em 1 toque ("Salvar rápido"), textos acolhedores em português claro, navegação rasa com 4 abas fixas, estados vazios orientativos e confirmação modal antes de ações destrutivas (`ConfirmModal`). | Reduz atrito e carga cognitiva em momentos de cansaço emocional, prevenindo cliques acidentais na exclusão de registros ou conta. |
| **Desempenho** | Consultas SQL agregadas diretamente no PostgreSQL (com índices em `usuario_id` e `registrado_em`), flores renderizadas em SVG vetorial leve (`react-native-svg`), modelo de IAGen de baixa latência (`gemini-3.5-flash-lite`) e atualização otimista do estado local no `RecordsViewModel`. | Proporciona resposta fluida em dispositivos Android intermediários e minimiza espera na rede. |
| **Manutenibilidade** | Clean Architecture + MVVM, TypeScript em modo `strict` nos três módulos, validação centralizada com Zod, catálogos únicos (`MoodCatalog.ts` e `FlowerCatalog.ts` seguindo DRY) e pipeline de CI no GitHub Actions (`.github/workflows/ci.yml`). | Facilita evolução segura do código, reduz duplicação e detecta regressões automaticamente a cada commit/PR. |
| **Confiabilidade** | Timeout controlado via `AbortController` no `HttpClient` e no `GeminiClient`, retry automático com fallback de modelo (`gemini-3.8-flash`) na `iagen-api`, mensagem botânica local de contingência caso a rede falhe durante a chamada da IA, e suíte automatizada com testes unitários, de integração (PostgreSQL real) e E2E. | Assegura que o usuário nunca perca um registro emocional mesmo diante de instabilidades temporárias de rede ou de pico de demanda na API de IA. |

---

## 7. Requisitos de segurança e de proteção de dados (LGPD)

Por tratar dados de saúde emocional — classificados como **dados pessoais sensíveis** pela Lei nº 13.709/2018 (LGPD) — todos os requisitos da Seção 2.5 foram implementados com defesa em profundidade:

| Requisito (Seção 2.5) | Onde foi implementado (arquivo / tela) | Justificativa |
| :--- | :--- | :--- |
| **Senhas criptografadas no banco** | `backend/src/infra/security/BcryptPasswordHasher.ts` e `AuthUseCases.ts` | Impede exposição de senhas em texto claro por meio de hash criptográfico com salt via `bcryptjs`. |
| **Autenticação por token e rotas restritas** | `backend/src/infra/security/JwtTokenService.ts`, `backend/src/presentation/middlewares/authenticate.ts`, `mobile/src/data/storage/SecureTokenStorage.ts` e `HttpClient.ts` | Exige token JWT válido em todas as rotas de perfil, registros e reflexão; o token é armazenado de forma segura no dispositivo via `expo-secure-store`. |
| **Isolamento estrito de dados por titular** | `backend/src/infra/repositories/PgEmotionalRecordRepository.ts` e `PgUserRepository.ts` (filtros `WHERE usuario_id = $1` usando o `userId` extraído do JWT) e `PdfReportService.ts` | Garante que cada usuário consulte, altere, exclua e exporte em PDF/JSON exclusivamente os próprios dados, bloqueando acessos cruzados (IDOR). |
| **Sigilo de credenciais e arquivos `.env`** | `.gitignore` na raiz, arquivos `.env.example` públicos e entrega dos `.env` reais apenas no ZIP da UFPR Virtual | Impede exposição de chaves da API Gemini, segredo JWT e senha do banco no histórico público do GitHub. |
| **Aviso sobre dados sensíveis e consentimento explícito** | `mobile/src/presentation/screens/LgpdConsentScreen.tsx` e middleware `backend/src/presentation/middlewares/requireLgpdConsent.ts` | Bloqueia a criação/listagem de registros no frontend e no backend até que o usuário leia o aviso sobre dados sensíveis e marque ativamente a caixa de consentimento (desmarcada por padrão). |
| **Política de Privacidade e aviso de envio à IAGen** | `mobile/src/presentation/screens/PrivacyPolicyScreen.tsx`, `CreateRecordScreen.tsx` e `iagen-api/src/domain/PromptBuilder.ts` | Informa em linguagem simples coleta, finalidade, armazenamento e não divulgação a terceiros; explicita que o envio à IAGen é opcional (checkbox) e anonimizado (apenas humor, contextos e relato, sem nome, e-mail ou ID). |
| **Exclusão dos próprios dados e da conta** | `mobile/src/presentation/screens/SettingsScreen.tsx`, `RecordDetailScreen.tsx`, `backend/src/presentation/controllers/MeController.ts` e `ON DELETE CASCADE` em `database/init.sql` | Permite remover registros individuais, limpar dados ou excluir definitivamente a conta e todos os registros vinculados. |
| **Uso exclusivo de dados fictícios** | `backend/tests/`, `mobile/tests/`, `iagen-api/tests/` e contas de demonstração | Protege a privacidade de pessoas reais durante desenvolvimento, testes automatizados e apresentação. |

---

## 8. Interface, IHC e UX

### 8.1. Responsividade, Sensibilidade ao Contexto, Personalização e Acessibilidade

| Critério | Como foi implementado | Justificativa |
| :--- | :--- | :--- |
| **Responsividade** | `mobile/app.json` configurado com `"orientation": "default"` (retrato e paisagem), `ScreenContainer.tsx` com `SafeAreaView` + `ScrollView`, layouts em Flexbox com `flexWrap`, `minWidth` e prateleira horizontal rolável na `FloriculturaShelf.tsx`. | Permite uso confortável em telas compactas, aparelhos maiores, tablets e modo paisagem sem cortes ou sobreposições. |
| **Sensibilidade ao contexto** | 1) **Horário do dia:** `ContextService.ts` e `ThemeContext.tsx` adaptam saudação, subtítulo e tom visual da `HomeScreen` conforme o turno (*manhã*, *tarde* ou *noite*). 2) **Estado da conexão:** `@react-native-community/netinfo` no `SessionContext.tsx` exibe status `Online/Offline` na `HomeScreen` e banner contextual (`ConnectionBanner.tsx`) quando sem internet. | Torna o acolhimento pertinente ao momento do dia e evita frustração ao tentar sincronizar registros sem rede. |
| **Personalização** *(persistida no PostgreSQL)* | `SettingsScreen.tsx`, `CustomMoodLabelsScreen.tsx` e `RemindersSettingsScreen.tsx` permitem configurar o **nível da floricultura** (`Desativada`, `Suave`, `Completa`), **renomear os rótulos dos 5 humores** e configurar **turnos de lembretes**, salvando via `PATCH /api/v1/me/preferencias`. | Respeita o estilo pessoal e o vocabulário emocional de cada usuário, mantendo as escolhas sincronizadas após fechar e reabrir o app. |
| **Acessibilidade** *(distinta da personalização)* | 1) **Tamanho de fonte ajustável** em 3 escalas (`normal`, `grande`, `extra_grande`) aplicado globalmente via `ThemeContext.tsx` (`scaledFont`) e `FloriculturaShelf.tsx`. 2) **Alternativa à cor/ícone (`rotulos_sempre_visiveis`)** exibindo rótulos textuais fixos em todos os estados emocionais e contextos. 3) **Semântica para leitores de tela** (`accessibilityRole`, `accessibilityLabel`, `accessibilityState`) e alvos de toque mínimos de 44 dp. | Assegura leitura confortável para pessoas com baixa visão ou daltonismo e compatibilidade com tecnologias assistivas (TalkBack/VoiceOver), utilizando recursos independentes dos itens de personalização acima. |

### 8.2. Recomendações do Guia de Interface para Saúde Mental (CAPES) aplicadas

Com base no guia disponível em `https://educapes.capes.gov.br/handle/capes/1132272`, foram aplicadas e documentadas **10 recomendações**:

| # | Item / Recomendação do Guia | Tela em que foi aplicado | Justificativa da escolha |
| :-: | :--- | :--- | :--- |
| **1** | **Registro rápido com baixa carga cognitiva** | `HomeScreen` e `CreateRecordScreen` | Permite registrar apenas o estado emocional com um toque ("Salvar rápido"), viabilizando o uso mesmo em dias de esgotamento ou ansiedade. |
| **2** | **Associação opcional de contextos e anotações livres** | `CreateRecordScreen` e `EditRecordScreen` | Oferece chips opcionais (*Sono*, *Estudo*, *Trabalho*, *Descanso*, *Relações*) e campo livre sem obrigar preenchimento, apoiando a descoberta de gatilhos sem burocracia. |
| **3** | **Gamificação acolhedora, opcional e livre de punições** | `HomeScreen` (`FloriculturaShelf`) e `SettingsScreen` | Apresenta os 7 vasos da semana com dias vazios em repouso calmo (sem murchar plantas nem punir sequências quebradas) e permite desativar totalmente a metáfora visual. |
| **4** | **Personalização do vocabulário emocional** | `CustomMoodLabelsScreen` e `MoodScaleSelector` | Permite que cada pessoa nomeie os 5 estados emocionais com palavras que façam sentido para a própria vivência. |
| **5** | **Feedback visual positivo e acolhedor pós-registro** | `RecordSavedScreen` | Celebra o ato de cuidar de si exibindo a flor cultivada e uma mensagem acolhedora personalizada, reforçando o hábito de forma gentil. |
| **6** | **Visualização simples de tendências para autorreflexão** | `ReflectionScreen` | Resume padrões de 7 e 30 dias com barras proporcionais claras, contextos frequentes e pergunta aberta de reflexão, evitando métricas competitivas. |
| **7** | **Consentimento informado e privacidade em linguagem simples** | `LgpdConsentScreen` e `PrivacyPolicyScreen` | Explica claramente o tratamento de dados sensíveis e o envio opcional à IAGen antes da coleta, promovendo confiança e segurança psicológica. |
| **8** | **Direcionamento claro a apoio profissional e limites do app** | `ProfessionalSupportScreen`, rodapé do PDF e `iagen-api/materiais/diretrizes-acolhimento.md` | Deixa explícito o papel não clínico do aplicativo e disponibiliza acesso direto a canais gratuitos de acolhimento (CVV 188 e CAPS). |
| **9** | **Lembretes respeitosos e sob controle do usuário** | `RemindersSettingsScreen` | Permite ativar, desativar e escolher os turnos preferidos de lembrete, evitando notificações intrusivas fora de hora. |
| **10** | **Autonomia sobre os dados (portabilidade e exclusão)** | `ReflectionScreen`, `RecordDetailScreen` e `SettingsScreen` | Garante controle total do titular para baixar relatórios em PDF, exportar JSON, editar registros ou excluir a conta permanentemente. |

---

## 9. Criatividade e inovação

### 9.1. Descrição da inovação implementada
A proposta inovadora do aplicativo é a **Floricultura Emocional Semanal com Acolhimento Botânico via IAGen**, implementada integralmente na `HomeScreen` (`FloriculturaShelf.tsx` + `FlowerIllustration.tsx`), `CreateRecordScreen.tsx`, `RecordSavedScreen.tsx`, `RecordDetailScreen.tsx` e no serviço `iagen-api/`:

- **Metáfora semanal de 7 vasos reais:** Cada dia da semana corresponde a um vaso na prateleira. Ao registrar um estado emocional, desabrocha uma de cinco flores reais (*Lírio-da-paz*, *Lavanda*, *Camomila*, *Margarida* ou *Girassol*) acompanhada do clima atmosférico daquele dia (*Tempestade*, *Névoa*, *Brisa*, *Sol ameno*, *Céu limpo*).
- **Acolhimento contextualizado via IAGen fundamentada:** A `iagen-api` combina o simbolismo botânico (`materiais/catalogo-flores.json`), diretrizes éticas não clínicas (`materiais/diretrizes-acolhimento.md`) e o relato opcional do usuário para gerar uma mensagem curta de autoajuda conectada à flor cultivada — persistida no registro e acessível ao tocar em qualquer vaso da semana.
- **Anti-culpa por design:** Dias sem registro exibem um vaso em repouso calmo com broto sereno, preservando o acolhimento mesmo após pausas.

### 9.2. Pesquisa e comparação com aplicativos existentes do domínio

| Aplicativo pesquisado | Características comuns no domínio | Limitação identificada | Diferencial do Ecossistema Emocional |
| :--- | :--- | :--- | :--- |
| **Daylio** | Registro rápido de humor em escala de 5 pontos, ícones de atividades e estatísticas mensais. | Foco analítico em gráficos e sequências (*streaks*) que penalizam quebras; respostas estáticas sem acolhimento contextual. | Substitui *streaks* punitivos pela prateleira semanal de 7 vasos em repouso e entrega mensagens personalizadas ligadas ao simbolismo da flor. |
| **Finch** | Forte gamificação com mascote virtual, metas diárias e recompensas por consistência. | Alta carga visual e mecânicas de metas/moedas que podem gerar ansiedade ou sobrecarga para quem busca simplicidade. | Gamificação minimalista, contemplativa e ajustável em 3 níveis (incluindo desativação completa), centrada em flores reais. |
| **Cíngulo** | Conteúdos guiados de terapia emocional, sessões de áudio e autoavaliações estruturadas. | Conteúdo pré-gravado pouco adaptado ao relato livre do momento específico e forte paywall em recursos centrais. | Combina diário livre com acolhimento textual único gerado em tempo real a partir do relato e do clima emocional do dia. |
| **Moodflow** | Diário de humor, rotinas, visualização anual em pixels e tags de contexto. | Experiência centrada em tabelas e grades densas, com baixo retorno afetivo imediato após o registro. | Oferece feedback afetivo imediato com ilustração vetorial da flor do dia, clima visual e mensagem acolhedora salva para consulta posterior. |

### 9.3. Relevância para o usuário
A combinação de metáfora botânica semanal + mensagem personalizada de IAGen cria um **retorno afetivo imediato** mesmo em dias difíceis (quando o *Lírio-da-paz* ou a *Lavanda* validam o cansaço em vez de exigir positividade forçada), estimula a revisitação reflexiva da semana ao tocar nos 7 vasos e elimina a culpa comum em aplicativos baseados em sequências obrigatórias.

### 9.4. Contribuição da IAGen na concepção e análise crítica
Durante a fase de ideação e refinamento, a Inteligência Artificial Generativa (Google Gemini) foi utilizada como parceira de brainstorming e revisão crítica para:
1. Analisar pontos de fadiga nos aplicativos pesquisados (como excesso de cobrança por *streaks* e mensagens genéricas de autoajuda);
2. Refinar a evolução do jardim estático inicial para o conceito de **Floricultura de 7 vasos**, alinhando cada nível emocional a uma flor real e a um simbolismo acolhedor;
3. Estruturar os limites éticos dos materiais em `iagen-api/materiais/diretrizes-acolhimento.md`, garantindo ausência de diagnósticos, inclusão de orientação ao CVV (188) em relatos de sofrimento intenso e anonimização completa dos dados enviados ao modelo.

---

## 10. Divisão do trabalho

Este projeto foi desenvolvido de forma **individual**, com todas as frentes projetadas, implementadas, testadas e documentadas pelo integrante abaixo:

| Nome completo | Responsabilidades executadas |
| :--- | :--- |
| **Samuel Wesley de Alcântara Magalhães** | Modelagem do banco PostgreSQL (`database/init.sql`); desenvolvimento completo da API principal (`backend/`) com autenticação JWT, bcrypt, CRUD e LGPD; desenvolvimento da API de IAGen (`iagen-api/`) com materiais botânicos/éticos e cliente Gemini com retry/fallback; desenvolvimento do aplicativo React Native (`mobile/`) em Clean Architecture + MVVM, Floricultura interativa de 7 vasos, geração de Relatório em PDF, responsividade, contexto, personalização e acessibilidade; testes automatizados (unitários, integração e E2E), CI no GitHub Actions, configuração e geração do APK via EAS Build e documentação completa (`README.md`). |