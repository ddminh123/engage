# Security

## 1. General Rules

- Zero high/critical npm vulnerabilities before deploy
- All secrets in `.env`, never in code
- Validate all inputs with Zod
- Prisma ORM only — no raw SQL
- All API routes use `withAccess(permission, handler)` middleware

---

## 2. Known Vulnerabilities

> **Last audited:** 2025-03-17 — Prisma v7.5.0 upgrade

### Summary

| # | Package              | Severity | Affects Production? | Status      |
|---|----------------------|----------|---------------------|-------------|
| 1 | `hono` ≤4.12.6      | High     | No (dev only)       | Monitoring  |
| 2 | `@hono/node-server` <1.19.10 | High | No (dev only)  | Monitoring  |
| 3 | `@prisma/dev`        | High     | No (dev only)       | Monitoring  |
| 4 | `prisma` ≥6.20.0-dev.1 | High  | No (dev only)       | Monitoring  |

**All 4 vulnerabilities are transitive dependencies of `prisma` CLI (devDependency).** They do not ship to production builds.

---

### 2.1 `hono` ≤4.12.6

**Dependency chain:** `prisma` → `@prisma/dev` → `hono`

| CVE / Advisory | Title | CVSS |
|---|---|---|
| [GHSA-q5qw-h33p-qvwr](https://github.com/advisories/GHSA-q5qw-h33p-qvwr) | Arbitrary file access via serveStatic | 7.5 (High) |
| [GHSA-5pq2-9x2x-5p6w](https://github.com/advisories/GHSA-5pq2-9x2x-5p6w) | Cookie Attribute Injection via setCookie() | 5.4 (Moderate) |
| [GHSA-p6xx-57qc-3wxr](https://github.com/advisories/GHSA-p6xx-57qc-3wxr) | SSE Control Field Injection via writeSSE() | 6.5 (Moderate) |
| [GHSA-9r54-q6cx-xmh5](https://github.com/advisories/GHSA-9r54-q6cx-xmh5) | XSS through ErrorBoundary component | 4.7 (Moderate) |
| [GHSA-6wqw-2p9w-4vw4](https://github.com/advisories/GHSA-6wqw-2p9w-4vw4) | Cache middleware ignores Cache-Control: private | 5.3 (Moderate) |
| [GHSA-r354-f388-2fhh](https://github.com/advisories/GHSA-r354-f388-2fhh) | IPv4 validation bypass in IP Restriction Middleware | 4.8 (Moderate) |
| [GHSA-w332-q679-j88p](https://github.com/advisories/GHSA-w332-q679-j88p) | Arbitrary Key Read in serveStatic (Cloudflare Workers) | 5.3 (Moderate) |
| [GHSA-v8w9-8mx6-g223](https://github.com/advisories/GHSA-v8w9-8mx6-g223) | Prototype Pollution via parseBody({ dot: true }) | 4.8 (Moderate) |
| [GHSA-gq3j-xvxp-8hrf](https://github.com/advisories/GHSA-gq3j-xvxp-8hrf) | Timing comparison hardening in basicAuth/bearerAuth | 3.7 (Low) |

**Why it's safe:** `hono` is used internally by Prisma Studio and dev tooling. It is never imported or bundled in our application code. Production builds (`next build`) do not include devDependencies.

---

### 2.2 `@hono/node-server` <1.19.10

**Dependency chain:** `prisma` → `@prisma/dev` → `@hono/node-server`

| CVE / Advisory | Title | CVSS |
|---|---|---|
| [GHSA-wc8c-qw6v-h7f6](https://github.com/advisories/GHSA-wc8c-qw6v-h7f6) | Authorization bypass for protected static paths via encoded slashes | 7.5 (High) |

**Why it's safe:** Same as `hono` — only used by Prisma Studio's local dev server.

---

### 2.3 `@prisma/dev`

**Dependency chain:** `prisma` → `@prisma/dev`

Rolls up the `hono` and `@hono/node-server` vulnerabilities above. No direct vulnerabilities of its own.

---

### 2.4 `prisma` ≥6.20.0-dev.1

**Direct devDependency.**

Inherits all vulnerabilities from `@prisma/dev`. The `prisma` package is installed as a devDependency and is used only for CLI operations (generate, migrate, studio).

---

## 3. Mitigation

- **No action required for production.** All affected packages are dev-only.
- **Do not run Prisma Studio in production** or expose it to untrusted networks.
- **Monitor** Prisma releases — these will be patched when `hono` updates its dependencies.
- Run `npm audit` periodically to check for new issues.

---

## 4. Audit Commands

```bash
# Full audit report
npm audit

# High/critical only
npm audit --audit-level=high

# JSON output for CI
npm audit --json
```
