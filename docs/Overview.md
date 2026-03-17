# i-engage Architecture

## 1. System Overview

Internal Audit Management system following IIA standards. On-premises deployment.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Next.js Monolith                            │
├─────────┬───────────────────────────────────────────────────────────┤
│         │    ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│   UI    │───▶│   API   │───▶│ Action  │───▶│ Prisma  │───▶ DB (MySQL)│
│ (React) │    │ (Routes)│    │ (Logic) │    │  (ORM)  │              │
│         │    └─────────┘    └─────────┘    └─────────┘              │
│         │         │              │                                  │
│         │         ▼              ▼                                  │
│         │   ┌───────────┐  ┌───────────┐                            │
│         │   │ Middleware│  │ Service   │                            │
│         │   │(Auth+Access)│ │(External) │                           │
│         │   └───────────┘  └───────────┘                            │
│         │                   File Server / Sharepoint / Entra ID     │
└─────────┴───────────────────────────────────────────────────────────┘
```

**Rules:**

- UI calls API routes only. Never import Actions directly in client components.
- All routes protected by access middleware from day 1.

---

## 2. Guiding Principles

1. **Prefer established libraries** — Use standard, well-maintained packages over custom implementations. Avoid reinventing the wheel.
2. **Minimize customization** — Especially for auth, UI components, and infrastructure. Extend only when necessary.
3. **On-premises first** — No external API calls (Google, Firebase, etc.). All services run locally.
4. **Convention over configuration** — Follow Next.js, Prisma, and NextAuth conventions.

---

## 3. Core Modules

| Module       | Priority | Description                     |
| ------------ | -------- | ------------------------------- |
| `universe`   | Core     | Auditable entities registry     |
| `plan`       | Core     | Annual audit planning           |
| `engagement` | Core     | Audit execution & work programs |
| `finding`    | Core     | Findings & remediation tracking |
| `access`     | Support  | RBAC & permissions              |
| `document`   | Support  | File storage & evidence         |
| `settings`   | Support  | System configuration            |

**Implementation order:** Core flow first → Supporting modules.

---

## 4. Tech Stack

| Layer        | Technology                                 |
| ------------ | ------------------------------------------ |
| Framework    | Next.js 16 (App Router)                    |
| UI           | React, TypeScript, Shadcn/ui, TailwindCSS  |
| API          | Next.js API Routes                         |
| ORM          | Prisma                                     |
| Database     | MySQL                                      |
| Auth         | NextAuth.js (Credentials + Entra ID ready) |
| File Storage | Local file server (Sharepoint-ready)       |
| State        | TanStack Query + Zustand                   |
| Validation   | Zod                                        |

---

## 5. Folder Structure

```
i-engage/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (providers, fonts)
│   │   ├── (auth)/                # Auth route group
│   │   │   ├── layout.tsx         # Auth layout (centered, minimal)
│   │   │   └── login/page.tsx
│   │   ├── (main)/                # Main app route group
│   │   │   ├── layout.tsx         # Main layout (sidebar, header)
│   │   │   ├── universe/
│   │   │   ├── plan/
│   │   │   ├── engagement/
│   │   │   ├── finding/
│   │   │   ├── access/
│   │   │   ├── document/
│   │   │   └── settings/
│   │   └── api/                   # API Routes (same modules)
│   │
│   ├── components/
│   │   ├── ui/                    # Shadcn (DO NOT customize)
│   │   └── shared/                # Complex reusable components
│   │
│   ├── features/                  # Client-side feature modules
│   │   └── [module]/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── api.ts             # Fetch calls to API routes
│   │       └── types.ts
│   │
│   ├── server/
│   │   ├── actions/               # Business logic (uses Prisma)
│   │   ├── services/              # External integrations only
│   │   └── middleware/            # Auth & Access
│   │
│   ├── lib/                       # Utilities (prisma client, etc.)
│   ├── hooks/                     # Shared hooks
│   └── types/                     # Shared types
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── package.json
```

---

## 6. Layer Responsibilities

| Layer          | Location             | Responsibility                                                                             |
| -------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| **API**        | `/app/api`           | Route handlers, validation, response formatting. Must use middleware.                      |
| **Action**     | `/server/actions`    | Business logic, uses Prisma directly for DB, calls Services for external integrations.     |
| **Service**    | `/server/services`   | **External integrations only**: file storage, Sharepoint, Entra ID. Not for DB operations. |
| **Middleware** | `/server/middleware` | Auth (NextAuth) + Access control (permission checks).                                      |

---

## 7. Authentication

- **Library:** NextAuth.js (standard patterns, minimal customization)
- **Providers:** CredentialsProvider (DB auth) + AzureADProvider (Entra ID ready)
- **Session:** Database strategy (on-prem friendly)
- **Route protection:** `next-auth/middleware` for auth, custom wrapper for permissions

---

## 8. Access Control

- All API routes wrapped with `withAccess(permission, handler)` middleware
- Permission format: `module:action` (e.g., `engagement:create`, `finding:approve`)
- Every route calls `checkAccess(userId, permission)` from teams module
- **Initial scaffolding:** `checkAccess` returns `true` until teams module is implemented
- See `docs/modules/teams.md` for permission API design

---

## 9. File Storage

- **Default:** Local file server
- **Future:** Sharepoint integration via provider pattern
- **Path format:** `/storage/{module}/{entityId}/{filename}`
- This is a **Service** (external integration), not DB-related

---

## 10. Frontend Conventions

| Area               | Convention                                                         |
| ------------------ | ------------------------------------------------------------------ |
| UI components      | Shadcn only. No custom basic components.                           |
| Complex components | Use hooks + useReducer                                             |
| Server state       | TanStack Query                                                     |
| Global state       | Zustand (minimal)                                                  |
| Data fetching      | Client → API routes via fetch. Server components can call Actions. |

---

## 11. Database

- **ORM:** Prisma
- **Naming:** `snake_case` for tables/columns
- **Schema location:** `/prisma/schema.prisma`

**High-level entities:**

```
universe → plan → engagement → section → objective → procedure
                      ↓
                   finding
                   document
```

---

## 12. API Conventions

| Method | Action  | Example                           |
| ------ | ------- | --------------------------------- |
| GET    | Read    | `GET /api/engagement/:id`         |
| POST   | Create  | `POST /api/engagement`            |
| PUT    | Update  | `PUT /api/engagement/:id`         |
| DELETE | Delete  | `DELETE /api/engagement/:id`      |
| POST   | Actions | `POST /api/engagement/:id/submit` |

**Response:** `{ data, meta? }` or `{ error: { code, message } }`

---

## 13. Security

### 13.1 Principles

- **On-premises isolation** — No external API calls. No internet-dependent services (Google, Firebase, AWS, etc.). All data stays on-prem.
- **Zero vulnerable dependencies** — Run `npm audit` before every release. Block deployment if high/critical vulnerabilities exist.
- **Defense in depth** — Multiple layers: auth → access control → input validation → ORM (no raw SQL)
- **Least privilege** — Users get minimum permissions needed. Default deny.
- **Secure defaults** — All routes protected. Auth + access check required.
- **No secrets in code** — All credentials in `.env`. Never commit secrets.

### 13.2 Requirements

| Area         | Requirement                                                    |
| ------------ | -------------------------------------------------------------- |
| Dependencies | Run `npm audit` regularly. Zero high/critical vulnerabilities. |
| Auth         | Secure session handling via NextAuth. HTTP-only cookies.       |
| Access       | All API routes must check permissions via middleware.          |
| Input        | Validate all inputs with Zod. Never trust client data.         |
| SQL          | Use Prisma ORM only. No raw SQL to prevent injection.          |
| Files        | Validate file types/sizes. Store outside web root.             |
| Secrets      | All secrets in `.env`. Never commit to git.                    |
| HTTPS        | Required in production.                                        |
| Headers      | Use Next.js security headers (CSP, X-Frame-Options, etc.)      |
| Audit trail  | Log all CUD operations to `AuditLog` table. See §13.4.         |

### 13.3 Dependency Management

```bash
# Check vulnerabilities
npm audit

# Fix automatically (safe fixes)
npm audit fix

# Fix all (may include breaking changes)
npm audit fix --force

# Check outdated packages
npm outdated
```

Run `npm audit` in CI pipeline. Block deployments with high/critical vulnerabilities.

### 13.4 Audit Logging

All Create, Update, Delete operations must be logged for compliance and traceability.

**Schema:**

```prisma
model AuditLog {
  id          String   @id @default(cuid())
  user_id     String
  user_name   String   // Denormalized for query performance
  action      String   // create | update | delete
  entity_type String   // e.g., "engagement", "finding"
  entity_id   String
  changes     Json?    // For updates: { field: { old, new } }
  timestamp   DateTime @default(now())

  @@index([entity_type, entity_id])
  @@index([user_id])
  @@index([timestamp])
}
```

**Usage in Actions:**

```typescript
// After successful create/update/delete
await logAudit({
  userId: session.user.id,
  userName: session.user.name,
  action: "create",
  entityType: "engagement",
  entityId: newEngagement.id,
  changes: null, // or { field: { old, new } } for updates
});
```

**Rules:**

- Log after successful operation (not before)
- For updates, capture changed fields only
- Never log sensitive data (passwords, tokens)
- `AuditLog` is append-only — no updates or deletes

---

## 14. Quick Reference

| Concern   | Solution                                |
| --------- | --------------------------------------- |
| Framework | Next.js 16 (App Router)                 |
| Auth      | NextAuth.js                             |
| Access    | Middleware on all routes                |
| ORM       | Prisma                                  |
| Files     | Local storage / Sharepoint              |
| UI        | Shadcn only                             |
| State     | TanStack Query + Zustand                |
| DB        | MySQL                                   |
| Principle | Prefer standard libs, avoid custom code |
