<div align="center">

# 🌐 zm-langAi

**An AI-powered language learning platform built for depth, speed, and clarity.**

[![Node.js](https://img.shields.io/badge/Node.js-24-green?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-black?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-blue?logo=postgresql)](https://www.postgresql.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange?logo=pnpm)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Helping learners acquire languages faster through AI-driven personalization, real-time feedback, and structured progression — no matter the language or dialect.

</div>

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Current Features](#-current-features)
- [Feature Recommendations](#-feature-recommendations)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 Overview

**zm-langAi** is a full-stack, contract-first language learning platform that uses AI to personalize the learning journey for every user. It is designed from the ground up to support underrepresented languages — including Kurdish dialects (Badini, Sorani, Kurmanji), Arabic, and others — while remaining extensible to any language pair.

The platform is built on a modern monorepo architecture using pnpm workspaces, enabling strict separation of concerns between the API layer, database models, frontend clients, and code-generated contracts.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                 pnpm Workspace                  │
│                                                 │
│  ┌──────────────────┐   ┌───────────────────┐   │
│  │  artifacts/      │   │  lib/             │   │
│  │  api-server      │   │  api-spec         │   │
│  │  (Express 5)     │   │  (OpenAPI YAML)   │   │
│  │                  │   │  api-zod          │   │
│  │                  │◄──│  (Zod schemas)    │   │
│  │                  │   │  api-client-react │   │
│  │                  │   │  (React Query)    │   │
│  │                  │   │  db               │   │
│  └─────────┬────────┘   │  (Drizzle ORM)   │   │
│            │             └───────────────────┘   │
│            ▼                                     │
│  ┌──────────────────┐                            │
│  │  PostgreSQL       │                            │
│  └──────────────────┘                            │
└─────────────────────────────────────────────────┘
```

**Design principles:**

- **OpenAPI-first** — `lib/api-spec/openapi.yaml` is the single source of truth for all API contracts. Changes to the spec trigger codegen that updates Zod validators and React Query hooks simultaneously.
- **Contract-driven codegen** — Orval generates type-safe React Query hooks and Zod schemas directly from the OpenAPI spec, eliminating hand-written client code.
- **Shared libraries over duplication** — Business logic lives in `lib/*` packages consumed by both the server and any future frontend artifact.
- **Supply-chain security** — pnpm workspace enforces a minimum 1-day package release age policy to defend against malicious npm releases.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 24 |
| Language | TypeScript 5.9 (strict mode) |
| Package Manager | pnpm workspaces |
| API Framework | Express 5 |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Validation | Zod v4 + drizzle-zod |
| API Contract | OpenAPI 3.1 |
| Code Generation | Orval (React Query hooks + Zod schemas) |
| Frontend Client | React Query (`@tanstack/react-query`) |
| Build Tool | esbuild (CJS bundle for server) |
| Frontend Build | Vite + React |
| Logging | pino + pino-http |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |

---

## 📁 Project Structure

```
zm-langAi/
├── artifacts/
│   └── api-server/           # Express 5 REST API server
│       ├── src/
│       │   ├── app.ts         # Express app setup (CORS, logging, routing)
│       │   ├── index.ts       # Server entry point
│       │   ├── lib/
│       │   │   └── logger.ts  # pino singleton logger
│       │   ├── middlewares/   # Custom Express middlewares
│       │   └── routes/        # Route handlers
│       │       ├── health.ts  # GET /api/healthz
│       │       └── index.ts   # Router composition
│       └── build.mjs          # esbuild bundler config
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml       # ★ Single source of truth for API contracts
│   ├── api-zod/
│   │   └── src/generated/     # Auto-generated Zod schemas
│   ├── api-client-react/
│   │   └── src/generated/     # Auto-generated React Query hooks
│   └── db/
│       ├── src/schema/        # Drizzle table definitions + insert schemas
│       └── drizzle.config.ts  # Database connection config
│
├── scripts/                   # Shared utility scripts
├── pnpm-workspace.yaml        # Workspace config, catalog pins, security policy
├── tsconfig.base.json         # Shared strict TypeScript defaults
└── tsconfig.json              # Root TS solution file (composite libs)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 24+
- pnpm 9+
- PostgreSQL 15+ (or a managed Postgres instance)

### Installation

```bash
# Install all workspace dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env and set DATABASE_URL=postgres://...

# Push the database schema
pnpm --filter @workspace/db run push

# Start the API server in development mode
pnpm --filter @workspace/api-server run dev
```

### Code Generation

Whenever you modify `lib/api-spec/openapi.yaml`, regenerate the client hooks and Zod schemas:

```bash
pnpm --filter @workspace/api-spec run codegen
```

### Type Checking

```bash
# Full workspace typecheck (libs + artifacts)
pnpm run typecheck

# Libs only (faster, for lib changes)
pnpm run typecheck:libs
```

### Schema Migrations

```bash
# Push schema changes to development database
pnpm --filter @workspace/db run push
```

---

## 📡 API Reference

All routes are served under the `/api` prefix.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/healthz` | Returns server health status `{ status: "ok" }` |

The OpenAPI specification is located at `lib/api-spec/openapi.yaml` and serves as the authoritative API contract.

---

## ✅ Current Features

- **Health check endpoint** — `GET /api/healthz` with Zod-validated response schema
- **OpenAPI contract** — Full OpenAPI 3.1 spec with type-safe code generation
- **Structured logging** — pino + pino-http with request/response serialization
- **CORS support** — Pre-configured for cross-origin frontend clients
- **Database layer** — Drizzle ORM with PostgreSQL, ready for schema definition
- **Type safety** — End-to-end TypeScript from DB schema → API contract → client hooks
- **Security-conscious dependencies** — Minimum 1-day release age policy in pnpm workspace

---

## 💡 Feature Recommendations

Based on the platform's architecture and the `zm-langAi` vision, the following features are recommended for immediate implementation:

### 🔐 Authentication & User Management
- **User registration / login** (email + password, OAuth via Google/GitHub)
- **Role-based access control** — learner, instructor, admin
- **Session management** with secure cookie-based tokens

### 🧠 AI-Powered Learning Core
- **Adaptive lesson engine** — AI adjusts difficulty based on performance history
- **Real-time pronunciation feedback** — Speech-to-text + phoneme scoring
- **AI conversation partner** — GPT/Claude-powered dialogue practice with contextual correction
- **Writing analysis** — Grammar and style suggestions with explanations in the learner's native language

### 📖 Content & Curriculum
- **Structured lesson tracks** — Beginner → Intermediate → Advanced per language
- **Vocabulary spaced-repetition system (SRS)** — Anki-style flashcard engine with interval scheduling
- **Dialect-aware content** — Separate content packs for Badini, Sorani, and Kurmanji Kurdish
- **Cultural context notes** — Embedded cultural explanations alongside language content

### 📊 Progress & Analytics
- **Learning streak tracking** — Daily engagement rewards
- **Proficiency heatmap** — Visualize mastery across vocabulary, grammar, and speaking
- **XP & achievement system** — Gamified milestone rewards
- **Detailed session reports** — Time on task, accuracy rate, improvement trends

### 🌍 Community & Social
- **Language exchange matching** — Pair native speakers for mutual practice
- **Community forums** per language/dialect
- **Peer review for writing submissions**
- **Leaderboards** — Weekly and all-time rankings by XP

### 🛠 Instructor Tools
- **Course builder UI** — Drag-and-drop lesson creation
- **Student progress dashboard** — Monitor cohort performance
- **Custom vocabulary lists** and assignment creation
- **Bulk content import** from CSV or structured documents

---

## 🗺 Roadmap

### Phase 1 — Foundation (Current)
- [x] Monorepo workspace setup (pnpm + TypeScript)
- [x] Express 5 API server with structured logging
- [x] OpenAPI 3.1 contract + Orval codegen pipeline
- [x] PostgreSQL + Drizzle ORM integration
- [x] Health check endpoint with Zod validation
- [ ] Database schema: users, lessons, progress, vocabulary
- [ ] Authentication (register, login, session)
- [ ] React frontend with routing and auth flows

### Phase 2 — Core Learning Loop (Q3 2025)
- [ ] Vocabulary SRS engine (spaced repetition)
- [ ] Lesson creation and structured curriculum
- [ ] Progress tracking and learning streaks
- [ ] Basic AI feedback on written exercises
- [ ] Kurdish (Badini) initial content pack

### Phase 3 — AI Integration (Q4 2025)
- [ ] AI conversation partner (GPT/Claude integration)
- [ ] Pronunciation analysis (speech-to-text + scoring)
- [ ] Adaptive difficulty engine
- [ ] Grammar correction with native-language explanations
- [ ] Dialect detection and routing

### Phase 4 — Community & Growth (Q1 2026)
- [ ] Language exchange matching system
- [ ] Community forums and discussion boards
- [ ] Instructor portal and course builder
- [ ] Mobile app (Expo / React Native)
- [ ] Leaderboards and achievement system

### Phase 5 — Scale & Expansion (Q2 2026+)
- [ ] Multi-tenant SaaS model for schools and institutions
- [ ] Offline mode for mobile (downloadable lesson packs)
- [ ] API for third-party integrations
- [ ] Analytics dashboard for instructors and admins
- [ ] Expansion to additional language pairs

---

## 🤝 Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and ensure all types pass: `pnpm run typecheck`
4. Commit with a descriptive message
5. Open a pull request against `main`

**Code style:**
- Never use `console.log` in server code — use `req.log` (in route handlers) or the `logger` singleton
- All API changes must start with updating `lib/api-spec/openapi.yaml`, followed by running codegen
- New database tables go in `lib/db/src/schema/` as individual files

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with precision for language learners everywhere. 🌍

</div>
