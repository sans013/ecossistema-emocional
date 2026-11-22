# Ecossistema Emocional

Aplicativo mobile e API REST para registro e reflexão emocional projetados com **Clean Architecture**, **MVVM**, **Twelve-Factor App**, **LGPD by Design** e alinhamento integral às **10 recomendações do Guia TrackWell**.

## Estrutura do Repositório

    ecossistema-emocional/
    ├── .github/workflows/ci.yml   # Pipeline de CI (PostgreSQL + Backend + Mobile)
    ├── database/init.sql          # Script DDL idempotente do PostgreSQL
    ├── backend/                   # API REST (Node.js + Express + TypeScript + PostgreSQL)
    ├── mobile/                    # App React Native (Expo + TypeScript + MVVM)
    └── docs/
        ├── arquitetura.md         # Decisões arquiteturais, 12-Factor, segurança e testes
        └── trackwell.md           # Mapeamento das 10 recomendações do Guia TrackWell

## Pré-requisitos

- **Node.js 20+**
- **PostgreSQL 16** (local ou via Docker)
- **Expo Go** (celular físico) ou **Android Emulator** ou navegador (Expo Web)

## Como executar localmente

### 1. Banco de Dados (PostgreSQL)

Crie o banco `ecossistema_emocional` e aplique o script DDL:

    psql -U postgres -c "CREATE DATABASE ecossistema_emocional;"
    psql -U postgres -d ecossistema_emocional -f database/init.sql

### 2. Backend (`backend/`)

1. Copie `backend/.env.example` para `backend/.env` e preencha `DATABASE_URL` e `JWT_SECRET` (mínimo 32 caracteres).
2. Instale as dependências e inicie o servidor:

    cd backend
    npm install
    npm run dev

Verifique em `http://localhost:3000/health` se o retorno exibe `"status": "ok"` e `"database": "connected"`.

### 3. Aplicativo Mobile (`mobile/`)

1. Copie `mobile/.env.example` para `mobile/.env` e ajuste `EXPO_PUBLIC_API_BASE_URL`:
   - **Web:** `http://localhost:3000/api/v1`
   - **Emulador Android:** `http://10.0.2.2:3000/api/v1`
   - **Celular físico (mesmo Wi-Fi):** `http://<SEU_IP_LOCAL>:3000/api/v1`
2. Instale as dependências e inicie o Expo:

    cd mobile
    npm install
    npx expo start

## Como executar os testes

### Backend (Typecheck + Unitários + Integração com PostgreSQL real)

    cd backend
    npm run typecheck
    npm test
    npm run test:integration

### Mobile (Typecheck + Unitários + Fluxos E2E de Interface)

    cd mobile
    npm run typecheck
    npm test

## Segurança de Credenciais

Os arquivos `.env` reais são bloqueados pelo `.gitignore` e nunca são enviados ao repositório Git. Os modelos públicos ficam documentados em `backend/.env.example` e `mobile/.env.example`.

## Documentação Complementar

- [Arquitetura, 12-Factor, Segurança e Testes](docs/arquitetura.md)
- [Mapeamento das 10 Recomendações do Guia TrackWell](docs/trackwell.md)