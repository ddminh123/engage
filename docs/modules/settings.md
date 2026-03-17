# Settings & Configuration — Module Design

> 🚧 **IN PROGRESS** — Org Chart first. Other sections remain placeholder.

> Detailed PRD: `docs/prd/settings.md`

---

## Schema

```prisma
model SystemSetting {
  key         String   @id
  value       Json
  updated_at  DateTime @updatedAt
  updated_by  String?
  @@map("system_setting")
}

model OrgUnit {
  id             String    @id @default(cuid())
  name           String
  code           String?   @unique
  parent_id      String?
  head           String?
  contact_email  String?
  phone          String?
  description    String?   @db.Text
  status         String    @default("active") // active | inactive
  established    DateTime?
  discontinued   DateTime?
  updated_at     DateTime  @updatedAt
  updated_by     String?

  parent   OrgUnit?  @relation("OrgUnitHierarchy", fields: [parent_id], references: [id])
  children OrgUnit[] @relation("OrgUnitHierarchy")

  @@index([parent_id])
  @@index([status])
  @@map("org_unit")
}
```

**d3-org-chart:** Expects flat array with `id` + `parentId`. Map `parent_id → parentId` in action layer.

**Placeholders:** Attachments → Document module (🔲). `updated_by` → plain string until Teams module (🔲).

---

## API Routes — Org Chart

```
src/app/api/settings/org-units/
├── route.ts          # GET (list) + POST (create)
└── [id]/route.ts     # GET + PATCH + DELETE
```

| Method | Path                           | Permission        | Notes                               |
| ------ | ------------------------------ | ----------------- | ----------------------------------- |
| GET    | `/api/settings/org-units`      | `settings:read`   | Flat array, includes `_entityCount` |
| POST   | `/api/settings/org-units`      | `settings:manage` | Create                              |
| GET    | `/api/settings/org-units/[id]` | `settings:read`   | Single unit                         |
| PATCH  | `/api/settings/org-units/[id]` | `settings:manage` | Update                              |
| DELETE | `/api/settings/org-units/[id]` | `settings:manage` | Validates no children/entity refs   |

Response: camelCase. DB: snake_case. Map in action layer.

---

## Actions (`src/server/actions/orgUnit.ts`)

| Function                  | Notes                                                                |
| ------------------------- | -------------------------------------------------------------------- |
| `getOrgUnits(filters?)`   | Flat array. Filters: `status`, `search`. Includes `_entityCount`.    |
| `getOrgUnitById(id)`      | With parent name                                                     |
| `createOrgUnit(data)`     | Zod validation, code unique, parent exists, max depth 5. `logAudit`. |
| `updateOrgUnit(id, data)` | No circular parent, max depth. `logAudit`.                           |
| `deleteOrgUnit(id)`       | No children, no entity refs. `logAudit`.                             |

---

## Frontend (`src/features/settings/`)

| File                             | Purpose                                                  |
| -------------------------------- | -------------------------------------------------------- |
| `types.ts`                       | `OrgUnit`, `OrgUnitCreateInput`, `OrgUnitUpdateInput`    |
| `api.ts`                         | Fetch wrappers for all org-unit endpoints                |
| `hooks/useOrgUnits.ts`           | TanStack Query: `useOrgUnits()`, `useOrgUnit(id)`        |
| `hooks/useOrgUnitMutations.ts`   | Create / update / delete mutations                       |
| `components/OrgChartWrapper.tsx` | d3-org-chart React bridge (`useRef` + `useLayoutEffect`) |
| `components/OrgUnitTree.tsx`     | Tree view + toolbar (zoom, expand/collapse)              |
| `components/OrgUnitList.tsx`     | Shadcn DataTable (flat list, search, filters)            |
| `components/OrgUnitForm.tsx`     | Create/Edit form (React Hook Form + Zod)                 |
| `components/OrgUnitDetail.tsx`   | Detail side panel (Sheet)                                |

**Page:** `src/app/(main)/settings/org-chart/page.tsx` — toggle tree/list view, + New Unit, Import/Export.

---

## Third-Party Libraries

| Package               | Purpose                 | License |
| --------------------- | ----------------------- | ------- |
| `d3-org-chart` ^3.1   | Org chart visualization | MIT     |
| `d3` ^7               | Peer dependency         | ISC     |
| `@types/d3-org-chart` | TypeScript types        | MIT     |

---

## Layout Dependencies (create before feature)

| Path                                         | Notes                                        |
| -------------------------------------------- | -------------------------------------------- |
| `src/app/(main)/layout.tsx`                  | **Create** — sidebar + header + content area |
| `src/components/shared/Sidebar.tsx`          | **Create** — module nav links                |
| `src/app/(main)/settings/org-chart/page.tsx` | **Create** — feature page                    |
| `src/app/layout.tsx`                         | Exists — add `QueryClientProvider`           |

---

## Implementation Steps

| #   | What                                                    |
| --- | ------------------------------------------------------- |
| 1   | App layout + sidebar + QueryClientProvider              |
| 2   | Prisma schema (`SystemSetting` + `OrgUnit`) + migration |
| 3   | Actions CRUD (`orgUnit.ts`)                             |
| 4   | API routes                                              |
| 5   | Types + API client + hooks                              |
| 6   | Page + list view                                        |
| 7   | Create/Edit form                                        |
| 8   | Detail panel                                            |
| 9   | d3-org-chart tree view                                  |
| 10  | Import/Export (defer)                                   |
| 11  | Seed data                                               |

---

## Other Settings Sections (🔲 placeholder)

- **Lookup Tables** — See PRD Part II. Models: `EntityType`, `AuditArea`, `AuditCycle`, `Tag`, `FindingSeverity`, `RiskScoreConfig`.
- **Engagement Templates** — See PRD Part III. Models: `EngagementTemplate`, `TemplateSection`, `TemplateObjective`, `TemplateProcedure`.

---

## Integrations

| Module       | Relationship                                                                      |
| ------------ | --------------------------------------------------------------------------------- |
| `universe`   | Uses `OrgUnit`, `EntityType`, `AuditArea`, `AuditCycle`, `Tag`, `RiskScoreConfig` |
| `finding`    | Uses `FindingSeverity`                                                            |
| `engagement` | Uses `EngagementTemplate`                                                         |
| `plan`       | Uses `OrgUnit`, `AuditCycle`                                                      |
| `document`   | 🔲 Attachments for OrgUnit                                                        |
| `teams`      | 🔲 `updated_by` user reference                                                    |
