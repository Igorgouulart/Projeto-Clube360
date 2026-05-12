# Clube360 — Sistema de Gestão

Projeto refatorado: Supabase removido, backend local Node.js + PostgreSQL.

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL 15+ instalado localmente

---

## Configuração do Banco

```bash
# No psql ou pgAdmin, crie o banco e usuário:
CREATE DATABASE clube360_db;
CREATE USER clube360 WITH PASSWORD 'sua_senha_forte';
GRANT ALL PRIVILEGES ON DATABASE clube360_db TO clube360;
```

---

## Setup do Backend

```bash
cd backend

# 1. Instale as dependências
npm install

# 2. Copie e configure o .env
cp .env.example .env
# Edite .env com sua DATABASE_URL e JWT secrets

# 3. Rode as migrations (cria todas as tabelas)
npm run db:migrate

# 4. Crie o usuário admin inicial
npm run db:seed

# 5. Inicie o servidor
npm run dev
```

O backend rodará em http://localhost:3001

**Credenciais padrão após o seed:**
- Email: `admin@clube360.com`
- Senha: `admin123`
- ⚠️ Altere a senha após o primeiro login!

---

## Setup do Frontend

```bash
# Na raiz do projeto

# 1. Instale as dependências
npm install

# 2. Copie e configure o .env
cp .env.example .env
# VITE_API_URL=http://localhost:3001/api

# 3. Inicie o frontend
npm run dev
```

O frontend rodará em http://localhost:5173

---

## Gerar JWT Secrets seguros

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

Use dois valores diferentes para `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET`.

---

## Estrutura

```
clube360/
├── src/                    # Frontend React
│   ├── contexts/           # AuthContext (JWT, sem Supabase)
│   ├── services/           # Chamadas à API REST
│   │   └── api/client.ts   # Axios com refresh automático
│   ├── hooks/              # React Query hooks
│   ├── types/              # Tipos TypeScript centralizados
│   ├── components/shared/  # ConfirmDialog, etc.
│   └── pages/              # Dashboard, Socios, Sessoes, Bar, Produtos
│
└── backend/                # API Node.js + Express + Prisma
    ├── src/
    │   ├── routes/         # Endpoints REST
    │   ├── controllers/    # Recebem HTTP, chamam services
    │   ├── services/       # Regras de negócio
    │   ├── middlewares/    # auth, error, audit, rate-limit
    │   └── utils/          # jwt, logger, errors
    └── prisma/
        └── schema.prisma   # Schema completo do banco
```

---

## O que mudou

| Antes | Depois |
|---|---|
| Supabase SDK no frontend | API REST local (Express) |
| Chave exposta no bundle | JWT seguro, sem credenciais no client |
| `confirm()` nativo | `ConfirmDialog` do shadcn/ui |
| `useEffect` + fetch manual | React Query (cache, loading, refetch) |
| Tipos duplicados por página | `src/types/index.ts` centralizado |
| `catch (error: any)` | `catch (error: unknown)` tipado |
| Supabase Auth | JWT próprio com refresh token automático |
| Sem auditoria | Middleware de audit em toda mutação |
| Sem validação no backend | Zod em todas as rotas |
