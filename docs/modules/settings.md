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

model Contact {
  id         String    @id @default(cuid())
  name       String
  position   String?
  email      String?
  phone      String?
  status     String    @default("active")
  created_at DateTime  @default(now())
  updated_at DateTime  @updatedAt
  updated_by String?

  led_units      OrgUnit[] @relation("OrgUnitLeader")
  contact_units  OrgUnit[] @relation("OrgUnitContactPoint")

  @@index([name])
  @@map("contact")
}

model OrgUnit {
  id               String    @id @default(cuid())
  name             String
  code             String?   @unique
  parent_id        String?
  leader_id        String?
  contact_point_id String?
  description      String?   @db.Text
  status           String    @default("active")
  established      DateTime?
  discontinued     DateTime?
  updated_at       DateTime  @updatedAt
  updated_by       String?

  parent        OrgUnit?  @relation("OrgUnitHierarchy", fields: [parent_id], references: [id])
  children      OrgUnit[] @relation("OrgUnitHierarchy")
  leader        Contact?  @relation("OrgUnitLeader", fields: [leader_id], references: [id])
  contact_point Contact?  @relation("OrgUnitContactPoint", fields: [contact_point_id], references: [id])

  @@index([parent_id])
  @@index([status])
  @@index([leader_id])
  @@index([contact_point_id])
  @@map("org_unit")
}
```

**d3-org-chart:** Expects flat array with `id` + `parentId`. Map `parent_id → parentId` in action layer.

**Placeholders:** Attachments → Document module (🔲). `updated_by` → plain string until Teams module (🔲).

---

## API Routes

```
src/app/api/settings/
├── org-units/
│   ├── route.ts          # GET (list) + POST (create)
│   └── [id]/route.ts     # GET + PATCH + DELETE
└── contacts/
    └── route.ts          # GET (search) + POST (create)
```

| Method | Path                           | Permission        | Notes                               |
| ------ | ------------------------------ | ----------------- | ----------------------------------- |
| GET    | `/api/settings/org-units`      | `settings:read`   | Flat array, includes `_entityCount` |
| POST   | `/api/settings/org-units`      | `settings:manage` | Create (with nested Contact refs)   |
| GET    | `/api/settings/org-units/[id]` | `settings:read`   | Single unit + leader/contactPoint   |
| PATCH  | `/api/settings/org-units/[id]` | `settings:manage` | Update                              |
| DELETE | `/api/settings/org-units/[id]` | `settings:manage` | Validates no children/entity refs   |
| GET    | `/api/settings/contacts?q=`    | `settings:read`   | Search contacts by name/email/phone |
| POST   | `/api/settings/contacts`       | `settings:manage` | Create new contact                  |

Response: camelCase. DB: snake_case. Map in action layer.

---

## Actions

### `src/server/actions/orgUnit.ts`

| Function                  | Notes                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `getOrgUnits(filters?)`   | Flat array. Filters: `status`, `search`. Includes leader, contactPoint.                                              |
| `getOrgUnitById(id)`      | With parent name, leader, contactPoint.                                                                              |
| `createOrgUnit(data)`     | Zod validation, code unique, parent exists, max depth 5. `$transaction` to create contacts then OrgUnit. `logAudit`. |
| `updateOrgUnit(id, data)` | No circular parent, max depth. `$transaction` to update/create/delete contacts. `logAudit`.                          |
| `deleteOrgUnit(id)`       | No children, no entity refs. `logAudit`.                                                                             |

### `src/server/actions/contact.ts`

| Function                      | Notes                                         |
| ----------------------------- | --------------------------------------------- |
| `searchContacts(query)`       | Search by name, email, phone. Returns top 20. |
| `createContact(data, userId)` | Zod validation. `logAudit`.                   |

---

## Frontend (`src/features/settings/`)

| File                            | Purpose                                                       |
| ------------------------------- | ------------------------------------------------------------- |
| `types.ts`                      | `Contact`, `ContactInput`, `OrgUnit`, `OrgUnitCreateInput`    |
| `api.ts`                        | Fetch wrappers for org-unit + contact endpoints               |
| `hooks/useOrgUnits.ts`          | TanStack Query: `useOrgUnits()`, `useOrgUnit(id)`             |
| `hooks/useOrgUnitMutations.ts`  | Create / update / delete mutations                            |
| `hooks/useOrgChartState.ts`     | `useReducer` for all dialog/form state (incl. form switching) |
| `hooks/useContacts.ts`          | `useContactSearch(query)`, `useCreateContact()`               |
| `components/OrgChartView.tsx`   | Orchestrator — tabs, detail, form, contact form, delete       |
| `components/OrgUnitList.tsx`    | Shadcn DataTable (flat list, search, filters)                 |
| `components/OrgUnitColumns.tsx` | Column definitions (uses label constants)                     |
| `components/OrgUnitForm.tsx`    | Create/Edit form (FormDialog + ContactSearch)                 |
| `components/OrgUnitDetail.tsx`  | Detail side panel (Sheet)                                     |
| `components/ContactSearch.tsx`  | Autocomplete with "Add new" option                            |
| `components/ContactForm.tsx`    | Standalone contact creation form (FormDialog)                 |

### Shared Components Used

| Component    | Path                               | Notes                                 |
| ------------ | ---------------------------------- | ------------------------------------- |
| `FormDialog` | `src/components/shared/FormDialog` | Sticky header/footer, scrollable body |
| `DataTable`  | `src/components/shared/DataTable`  | Standard list table                   |

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
