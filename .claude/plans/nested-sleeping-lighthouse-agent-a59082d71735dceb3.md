# Risk Catalog & Control/Procedure Library — Implementation Plan

## Overview

Add an org-level Risk/Control/Procedure library backed by COBIT 2019 and COSO ERM frameworks, with a settings management UI and "Add from Library" integration into the engagement-scoped RCM table.

---

## Phase 1: Schema Design (Prisma Models)

### 1A. New Catalog Models

The existing `RiskCatalogueItem` model is basic (flat, no framework ref, no control/procedure links). Rather than heavily modifying it (which would break `EntityRisk` references), we create **new** catalog models alongside it. The old model continues to serve the Universe/Entity risk assessment feature.

#### Model: `RiskCatalogDomain`
Grouping container for risk catalog items. Represents top-level domains (e.g., COBIT EDM, COSO Performance).

```prisma
model RiskCatalogDomain {
  id           String   @id @default(cuid())
  name         String                    // "EDM - Evaluate, Direct, Monitor"
  code         String   @unique          // "EDM"
  framework    String                    // "cobit2019" | "coso_erm" | "custom"
  description  String?  @db.Text
  sort_order   Int      @default(0)
  is_active    Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  categories   RiskCatalogCategory[]
  risks        RiskCatalogItem[]

  @@index([framework])
  @@index([is_active])
  @@map("risk_catalog_domain")
}
```

#### Model: `RiskCatalogCategory`
Sub-grouping within a domain (e.g., "EDM01 - Ensured Governance Framework Setting and Maintenance").

```prisma
model RiskCatalogCategory {
  id           String   @id @default(cuid())
  domain_id    String
  name         String                    // "EDM01 - Ensured Governance Framework Setting"
  code         String   @unique          // "EDM01"
  description  String?  @db.Text
  sort_order   Int      @default(0)
  is_active    Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt

  domain       RiskCatalogDomain     @relation(fields: [domain_id], references: [id], onDelete: Cascade)
  risks        RiskCatalogItem[]
  controls     ControlCatalogItem[]
  procedures   ProcedureCatalogItem[]

  @@index([domain_id])
  @@index([is_active])
  @@map("risk_catalog_category")
}
```

#### Model: `RiskCatalogItem`
Individual risk in the library.

```prisma
model RiskCatalogItem {
  id                 String   @id @default(cuid())
  domain_id          String
  category_id        String?
  name               String
  code               String?  @unique       // "EDM01-R01"
  description        String?  @db.Text
  risk_category      String?                // operational | financial | compliance | strategic | it | governance | reputational
  default_rating     String?                // low | medium | high | critical
  default_likelihood String?                // rare | unlikely | possible | likely | almost_certain
  default_impact     String?                // insignificant | minor | moderate | major | catastrophic
  framework_ref      String?                // "COBIT APO01.01", "COSO Performance"
  source             String   @default("system")  // "system" | "custom"
  is_active          Boolean  @default(true)
  sort_order         Int      @default(0)
  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt
  updated_by         String?

  domain             RiskCatalogDomain      @relation(fields: [domain_id], references: [id], onDelete: Cascade)
  category           RiskCatalogCategory?   @relation(fields: [category_id], references: [id], onDelete: SetNull)
  control_mappings   RiskControlCatalogRef[]
  engagement_risks   EngagementRisk[]       @relation("RiskFromCatalog")

  @@index([domain_id])
  @@index([category_id])
  @@index([risk_category])
  @@index([source])
  @@index([is_active])
  @@map("risk_catalog_item")
}
```

#### Model: `ControlCatalogItem`
Individual control in the library.

```prisma
model ControlCatalogItem {
  id                   String   @id @default(cuid())
  category_id          String?
  name                 String
  code                 String?  @unique       // "EDM01-C01"
  description          String?  @db.Text
  default_type         String?                // preventive | detective | corrective
  default_nature       String?                // manual | automated | it_dependent
  default_frequency    String?                // continuous | daily | weekly | monthly | quarterly | annually | event_driven
  framework_ref        String?                // "COBIT APO01.01"
  source               String   @default("system")
  is_active            Boolean  @default(true)
  sort_order           Int      @default(0)
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt
  updated_by           String?

  category             RiskCatalogCategory?   @relation(fields: [category_id], references: [id], onDelete: SetNull)
  risk_mappings        RiskControlCatalogRef[]
  procedure_mappings   ControlProcedureCatalogRef[]
  engagement_controls  EngagementControl[]    @relation("ControlFromCatalog")

  @@index([category_id])
  @@index([source])
  @@index([is_active])
  @@map("control_catalog_item")
}
```

#### Model: `ProcedureCatalogItem`
Individual audit procedure in the library.

```prisma
model ProcedureCatalogItem {
  id                   String   @id @default(cuid())
  category_id          String?
  name                 String
  code                 String?  @unique       // "EDM01-P01"
  description          String?  @db.Text
  instructions         String?  @db.Text      // detailed testing steps
  default_type         String?                // inquiry | observation | inspection | re_performance | analytical | walkthrough | other
  default_category     String?                // toc | substantive
  framework_ref        String?
  source               String   @default("system")
  is_active            Boolean  @default(true)
  sort_order           Int      @default(0)
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt
  updated_by           String?

  category             RiskCatalogCategory?       @relation(fields: [category_id], references: [id], onDelete: SetNull)
  control_mappings     ControlProcedureCatalogRef[]
  engagement_procedures EngagementProcedure[]      @relation("ProcedureFromCatalog")

  @@index([category_id])
  @@index([source])
  @@index([is_active])
  @@map("procedure_catalog_item")
}
```

#### Junction Tables

```prisma
model RiskControlCatalogRef {
  risk_id    String
  control_id String

  risk       RiskCatalogItem    @relation(fields: [risk_id], references: [id], onDelete: Cascade)
  control    ControlCatalogItem @relation(fields: [control_id], references: [id], onDelete: Cascade)

  @@id([risk_id, control_id])
  @@map("risk_control_catalog_ref")
}

model ControlProcedureCatalogRef {
  control_id   String
  procedure_id String

  control      ControlCatalogItem   @relation(fields: [control_id], references: [id], onDelete: Cascade)
  procedure    ProcedureCatalogItem @relation(fields: [procedure_id], references: [id], onDelete: Cascade)

  @@id([control_id, procedure_id])
  @@map("control_procedure_catalog_ref")
}
```

### 1B. Modify Existing Engagement Models (Add Traceability)

Add optional `catalog_item_id` FK to engagement-scoped entities:

**EngagementRisk** — add:
```
catalog_risk_id    String?
catalogRisk        RiskCatalogItem? @relation("RiskFromCatalog", fields: [catalog_risk_id], references: [id], onDelete: SetNull)
@@index([catalog_risk_id])
```

**EngagementControl** — add:
```
catalog_control_id   String?
catalogControl       ControlCatalogItem? @relation("ControlFromCatalog", fields: [catalog_control_id], references: [id], onDelete: SetNull)
@@index([catalog_control_id])
```

**EngagementProcedure** — add:
```
catalog_procedure_id  String?
catalogProcedure      ProcedureCatalogItem? @relation("ProcedureFromCatalog", fields: [catalog_procedure_id], references: [id], onDelete: SetNull)
@@index([catalog_procedure_id])
```

These are nullable FKs. When an item is added from the library, the catalog ID is stored. The engagement entity is a *copy* of catalog data (users can edit freely), but the FK provides traceability.

---

## Phase 2: Server Actions & API Routes

### 2A. Server Actions

**File: `src/server/actions/risk-catalog-library.ts`**

Handles all three catalog entity types. Functions:

- `listRiskCatalogDomains(framework?: string)` — returns domains with category counts
- `listRiskCatalogCategories(domainId?: string)` — returns categories with item counts
- `listRiskCatalogItems(filters: { domainId?, categoryId?, riskCategory?, source?, search?, isActive? })` — paginated list
- `getRiskCatalogItemById(id)` — single item with control mappings
- `createRiskCatalogItem(data)` / `updateRiskCatalogItem(id, data)` / `deleteRiskCatalogItem(id)`
- `listControlCatalogItems(filters: { categoryId?, source?, search?, isActive? })`
- `getControlCatalogItemById(id)` — single item with risk/procedure mappings
- `createControlCatalogItem(data)` / `updateControlCatalogItem(id, data)` / `deleteControlCatalogItem(id)`
- `listProcedureCatalogItems(filters: { categoryId?, source?, search?, isActive? })`
- `getProcedureCatalogItemById(id)`
- `createProcedureCatalogItem(data)` / `updateProcedureCatalogItem(id, data)` / `deleteProcedureCatalogItem(id)`
- `linkRiskControl(riskId, controlId)` / `unlinkRiskControl(riskId, controlId)`
- `linkControlProcedure(controlId, procedureId)` / `unlinkControlProcedure(controlId, procedureId)`
- `getCatalogTree(framework?: string)` — returns full domain→category→items hierarchy for tree navigation
- `searchCatalogItems(query: string, type: 'risk' | 'control' | 'procedure')` — full-text search across catalog

Zod schemas follow existing pattern (e.g., `createRiskCatalogueSchema` in `risk-catalogue.ts`). Use `z` from `zod/v4` as observed in existing code.

### 2B. API Routes

**New routes to add to `API_ROUTES`:**
```ts
// Risk Catalog Library (Settings)
SETTINGS_RISK_CATALOG_DOMAINS: "/api/settings/risk-catalog/domains",
SETTINGS_RISK_CATALOG_DOMAINS_BY_ID: (id: string) => `/api/settings/risk-catalog/domains/${id}`,
SETTINGS_RISK_CATALOG_CATEGORIES: "/api/settings/risk-catalog/categories",
SETTINGS_RISK_CATALOG_CATEGORIES_BY_ID: (id: string) => `/api/settings/risk-catalog/categories/${id}`,
SETTINGS_RISK_CATALOG_RISKS: "/api/settings/risk-catalog/risks",
SETTINGS_RISK_CATALOG_RISKS_BY_ID: (id: string) => `/api/settings/risk-catalog/risks/${id}`,
SETTINGS_RISK_CATALOG_CONTROLS: "/api/settings/risk-catalog/controls",
SETTINGS_RISK_CATALOG_CONTROLS_BY_ID: (id: string) => `/api/settings/risk-catalog/controls/${id}`,
SETTINGS_RISK_CATALOG_PROCEDURES: "/api/settings/risk-catalog/procedures",
SETTINGS_RISK_CATALOG_PROCEDURES_BY_ID: (id: string) => `/api/settings/risk-catalog/procedures/${id}`,
SETTINGS_RISK_CATALOG_TREE: "/api/settings/risk-catalog/tree",
SETTINGS_RISK_CATALOG_SEARCH: "/api/settings/risk-catalog/search",
```

**New route files:**
```
src/app/api/settings/risk-catalog/domains/route.ts          — GET (list), POST (create)
src/app/api/settings/risk-catalog/domains/[id]/route.ts     — GET, PATCH, DELETE
src/app/api/settings/risk-catalog/categories/route.ts       — GET, POST
src/app/api/settings/risk-catalog/categories/[id]/route.ts  — GET, PATCH, DELETE
src/app/api/settings/risk-catalog/risks/route.ts            — GET, POST
src/app/api/settings/risk-catalog/risks/[id]/route.ts       — GET, PATCH, DELETE
src/app/api/settings/risk-catalog/controls/route.ts         — GET, POST
src/app/api/settings/risk-catalog/controls/[id]/route.ts    — GET, PATCH, DELETE
src/app/api/settings/risk-catalog/procedures/route.ts       — GET, POST
src/app/api/settings/risk-catalog/procedures/[id]/route.ts  — GET, PATCH, DELETE
src/app/api/settings/risk-catalog/tree/route.ts             — GET (hierarchical tree)
src/app/api/settings/risk-catalog/search/route.ts           — GET (cross-type search)
```

All routes use `withAccess('settings:manage', ...)` following existing template route pattern.

**Add `PAGE_ROUTES`:**
```ts
SETTINGS_RISK_CATALOG: "/settings/risk-catalog",
```

---

## Phase 3: Settings Page UI — Library Management

### 3A. Settings Navigation

**Modify: `src/constants/settings-nav.ts`**

Add entry after "Thư viện mẫu":
```ts
{ label: "Thư viện rủi ro & kiểm soát", href: "/settings/risk-catalog" },
```

### 3B. Labels

**New file: `src/constants/labels/risk-catalog.ts`**

```ts
export const RISK_CATALOG_LABELS = {
  page: {
    title: 'Thư viện rủi ro & kiểm soát',
    description: 'Quản lý danh mục rủi ro, kiểm soát và thủ tục kiểm toán theo chuẩn quốc tế.',
  },
  tab: {
    risks: 'Rủi ro',
    controls: 'Kiểm soát',
    procedures: 'Thủ tục',
  },
  domain: {
    title: 'Lĩnh vực',
    createTitle: 'Thêm lĩnh vực',
    editTitle: 'Chỉnh sửa lĩnh vực',
    deleteTitle: 'Xóa lĩnh vực',
    // ...
  },
  category: {
    title: 'Danh mục',
    createTitle: 'Thêm danh mục',
    // ...
  },
  risk: {
    createTitle: 'Thêm rủi ro vào thư viện',
    editTitle: 'Chỉnh sửa rủi ro thư viện',
    deleteTitle: 'Xóa rủi ro thư viện',
    // ...
  },
  control: {
    createTitle: 'Thêm kiểm soát vào thư viện',
    // ...
  },
  procedure: {
    createTitle: 'Thêm thủ tục vào thư viện',
    // ...
  },
  field: {
    name: 'Tên',
    code: 'Mã',
    description: 'Mô tả',
    framework: 'Khung chuẩn',
    frameworkRef: 'Tham chiếu khung chuẩn',
    source: 'Nguồn',
    domain: 'Lĩnh vực',
    category: 'Danh mục',
    riskCategory: 'Phân loại rủi ro',
    defaultRating: 'Đánh giá mặc định',
    status: 'Trạng thái',
    linkedControls: 'Kiểm soát liên quan',
    linkedRisks: 'Rủi ro liên quan',
    linkedProcedures: 'Thủ tục liên quan',
  },
  source: {
    system: 'Hệ thống',
    custom: 'Tùy chỉnh',
  },
  framework: {
    cobit2019: 'COBIT 2019',
    coso_erm: 'COSO ERM',
    custom: 'Tùy chỉnh',
  },
  action: {
    addFromLibrary: 'Thêm từ thư viện',
    searchLibrary: 'Tìm trong thư viện',
    importFramework: 'Nhập từ khung chuẩn',
  },
} as const;
```

Export from `src/constants/labels/index.ts`.

### 3C. Page Component

**New file: `src/app/(main)/settings/risk-catalog/page.tsx`**

Structure (follows `templates/page.tsx` pattern):
```tsx
<div>
  <h1 className="text-2xl font-bold">{RISK_CATALOG_LABELS.page.title}</h1>
  <p className="mt-2 text-muted-foreground">{RISK_CATALOG_LABELS.page.description}</p>
  <div className="mt-6">
    <Tabs defaultValue="risks" className="w-full">
      <TabsList>
        <TabsTrigger value="risks">{tab.risks}</TabsTrigger>
        <TabsTrigger value="controls">{tab.controls}</TabsTrigger>
        <TabsTrigger value="procedures">{tab.procedures}</TabsTrigger>
      </TabsList>
      <TabsContent value="risks"><RiskCatalogList /></TabsContent>
      <TabsContent value="controls"><ControlCatalogList /></TabsContent>
      <TabsContent value="procedures"><ProcedureCatalogList /></TabsContent>
    </Tabs>
  </div>
</div>
```

### 3D. Feature Components

**New directory: `src/features/settings/components/risk-catalog/`**

Components:

1. **`RiskCatalogList.tsx`** — Main risk catalog list
   - Left sidebar: Domain/Category tree navigation (collapsible)
   - Right panel: DataTable of `RiskCatalogItem` for selected domain/category
   - Toolbar: search input, framework filter dropdown, source filter, "Add" button
   - Row actions: edit (FormDialog), delete (ConfirmDialog), view linked controls
   - Layout: `flex` with `w-64` sidebar + `flex-1` table area

2. **`ControlCatalogList.tsx`** — Same pattern for controls
   - Shows linked risks as badges
   - Filter by category

3. **`ProcedureCatalogList.tsx`** — Same pattern for procedures
   - Shows linked controls as badges

4. **`CatalogDomainTree.tsx`** — Reusable tree navigation component
   - Renders domains → categories as collapsible tree
   - Highlights selected node
   - Shows item counts per category
   - "All" option at top
   - Used in both Settings page and RCM "Add from Library" dialog

5. **`RiskCatalogForm.tsx`** — FormDialog content for creating/editing risk catalog items
   - Fields: name, code, description (textarea), domain (select), category (select, filtered by domain), risk_category (select), default_rating, default_likelihood, default_impact, framework_ref, source (readonly for system items)
   - React Hook Form + Zod validation

6. **`ControlCatalogForm.tsx`** — FormDialog for control items
   - Fields: name, code, description, category, default_type, default_nature, default_frequency, framework_ref

7. **`ProcedureCatalogForm.tsx`** — FormDialog for procedure items
   - Fields: name, code, description, instructions, category, default_type, default_category, framework_ref

### 3E. Feature Hooks

**New file: `src/features/settings/hooks/useRiskCatalog.ts`**

Following `useTemplates.ts` pattern:
- `useRiskCatalogDomains(framework?)` — TanStack Query
- `useRiskCatalogCategories(domainId?)` — TanStack Query
- `useRiskCatalogItems(filters)` — TanStack Query
- `useRiskCatalogItem(id)` — TanStack Query
- `useCreateRiskCatalogItem()` — mutation
- `useUpdateRiskCatalogItem()` — mutation
- `useDeleteRiskCatalogItem()` — mutation
- `useControlCatalogItems(filters)` / create / update / delete mutations
- `useProcedureCatalogItems(filters)` / create / update / delete mutations
- `useCatalogTree(framework?)` — TanStack Query for tree data
- `useCatalogSearch(query, type)` — TanStack Query with debounce

### 3F. Feature API Functions

**Add to `src/features/settings/api.ts`** (or new file `src/features/settings/api-risk-catalog.ts`):

Fetch functions using `API_ROUTES.SETTINGS_RISK_CATALOG_*` following existing `handleResponse` pattern.

### 3G. Feature Types

**Add to `src/features/settings/types.ts`** (or new file):

```ts
export interface RiskCatalogDomain {
  id: string;
  name: string;
  code: string;
  framework: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  categoryCount?: number;
  riskCount?: number;
}

export interface RiskCatalogCategory {
  id: string;
  domainId: string;
  domainName?: string;
  name: string;
  code: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  riskCount?: number;
  controlCount?: number;
  procedureCount?: number;
}

export interface RiskCatalogItemType {
  id: string;
  domainId: string;
  categoryId: string | null;
  name: string;
  code: string | null;
  description: string | null;
  riskCategory: string | null;
  defaultRating: string | null;
  defaultLikelihood: string | null;
  defaultImpact: string | null;
  frameworkRef: string | null;
  source: 'system' | 'custom';
  isActive: boolean;
  sortOrder: number;
  domainName?: string;
  categoryName?: string;
  controlCount?: number;
}

export interface ControlCatalogItemType {
  id: string;
  categoryId: string | null;
  name: string;
  code: string | null;
  description: string | null;
  defaultType: string | null;
  defaultNature: string | null;
  defaultFrequency: string | null;
  frameworkRef: string | null;
  source: 'system' | 'custom';
  isActive: boolean;
  sortOrder: number;
  categoryName?: string;
  riskCount?: number;
  procedureCount?: number;
}

export interface ProcedureCatalogItemType {
  id: string;
  categoryId: string | null;
  name: string;
  code: string | null;
  description: string | null;
  instructions: string | null;
  defaultType: string | null;
  defaultCategory: string | null;
  frameworkRef: string | null;
  source: 'system' | 'custom';
  isActive: boolean;
  sortOrder: number;
  categoryName?: string;
  controlCount?: number;
}

// Tree structure for navigation
export interface CatalogTreeNode {
  id: string;
  name: string;
  code: string;
  type: 'domain' | 'category';
  framework?: string;
  children?: CatalogTreeNode[];
  itemCount: number;
}
```

---

## Phase 4: RCM Integration — "Add from Library"

### 4A. Modify Engagement Types

**Modify: `src/features/engagement/types.ts`**

Add `catalogRiskId` to `EngagementRisk`:
```ts
catalogRiskId: string | null;
```

Add `catalogControlId` to `EngagementControl`:
```ts
catalogControlId: string | null;
```

Add `catalogProcedureId` to `EngagementProcedure` type (if it exists in types.ts).

### 4B. New "Add from Library" Dialog

**New file: `src/features/engagement/components/tabs/CatalogPickerDialog.tsx`**

A large dialog component used from RcmTable for adding risks/controls/procedures from the library.

Props:
```ts
interface CatalogPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'risk' | 'control' | 'procedure';
  engagementId: string;
  /** For controls: pre-filter to controls linked to these risk catalog IDs */
  linkedCatalogRiskIds?: string[];
  onItemsSelected: (items: SelectedCatalogItem[]) => void;
}

interface SelectedCatalogItem {
  catalogId: string;
  name: string;
  description: string | null;
  // pre-filled defaults from catalog
  defaults: Record<string, unknown>;
}
```

Layout:
```
┌─────────────────────────────────────────────────────────┐
│  Thêm từ thư viện - Rủi ro                        [X]  │
├────────────┬────────────────────────────────────────────┤
│ Domain     │  🔍 Search...   [Framework ▼] [Category ▼]│
│  ├ EDM     │  ┌──────────────────────────────────────┐  │
│  │ ├ EDM01 │  │ ☐ EDM01-R01 Risk of inadequate...   │  │
│  │ ├ EDM02 │  │ ☐ EDM01-R02 Risk of misaligned...   │  │
│  ├ APO     │  │ ☑ EDM01-R03 Risk of insufficient... │  │
│  │ ├ APO01 │  │ ☐ EDM02-R01 Risk of...              │  │
│  │ ├ APO02 │  └──────────────────────────────────────┘  │
│  ...       │                                            │
├────────────┴────────────────────────────────────────────┤
│  Selected: 3 items                    [Cancel] [Add ✓]  │
└─────────────────────────────────────────────────────────┘
```

Features:
- Left: `CatalogDomainTree` (reused from settings)
- Right: Checkboxed list of items, filtered by tree selection + search
- Multi-select with "Selected: N items" counter
- On confirm: calls parent callback with selected items
- Keyboard: Enter to confirm, Escape to cancel

### 4C. Modify RcmTable Flow

**Modify: `src/features/engagement/components/tabs/RcmTable.tsx`**

When user clicks "+ Rủi ro" in a risk row area, change to show a small inline popover with two options:
1. **Inline text input** (current behavior) — type name, Enter to create
2. **"Thêm từ thư viện" button** — opens `CatalogPickerDialog` in risk mode

Similarly for controls: the existing `LinkControlPicker` gets a new button "Tìm trong thư viện" that opens `CatalogPickerDialog` in control mode.

**Modify: `src/features/engagement/components/tabs/useRcmTable.ts`**

Add new state and actions:
```ts
// State additions
catalogPickerType: 'risk' | 'control' | 'procedure' | null;
catalogPickerObjectiveId: string | null;  // for risk: which objective to add under
catalogPickerRiskId: string | null;       // for control: which risk to link to

// New actions
| { type: "OPEN_CATALOG_PICKER"; pickerType: 'risk' | 'control' | 'procedure'; objectiveId?: string; riskId?: string }
| { type: "CLOSE_CATALOG_PICKER" }
```

Add handler `handleAddFromCatalog(items: SelectedCatalogItem[])`:
- For risks: calls `createEngagementRisk` for each item with `catalog_risk_id` set, copies defaults
- For controls: calls `createEngagementControl` for each item with `catalog_control_id` set, then links to the current risk
- For procedures: calls `createEngagementProcedure` for each with `catalog_procedure_id` set

### 4D. Modify Server Actions for Engagement Entities

**Modify: `src/server/actions/engagement.ts`** (or wherever risk/control creation lives)

When creating `EngagementRisk`, accept optional `catalog_risk_id` field and store it.
When creating `EngagementControl`, accept optional `catalog_control_id` field.
When creating `EngagementProcedure`, accept optional `catalog_procedure_id` field.

Update Zod schemas to include the new optional field.

### 4E. Visual Indicator for Library-sourced Items

In `RcmTable`, when a risk/control has a `catalogRiskId`/`catalogControlId`, show a small library icon (📚 or `Library` from lucide) as a visual indicator that the item came from the catalog. This is purely cosmetic and informational.

---

## Phase 5: Seed Data

### 5A. Seed File Structure

```
prisma/
  seed.ts                         — main entry, imports and calls sub-seeds
  seeds/
    cobit2019.ts                  — COBIT 2019 domains, categories, risks, controls, procedures
    coso-erm.ts                   — COSO ERM components, risk categories, controls
    risk-catalog-common.ts        — shared utilities (e.g., upsert helpers)
```

### 5B. Main seed.ts Modifications

After existing seed sections, add:
```ts
import { seedCobit2019 } from './seeds/cobit2019';
import { seedCosoErm } from './seeds/coso-erm';

// ... at end of main():
await seedCobit2019(prisma);
console.log('✅ COBIT 2019 catalog seeded');
await seedCosoErm(prisma);
console.log('✅ COSO ERM catalog seeded');
```

### 5C. COBIT 2019 Seed (`prisma/seeds/cobit2019.ts`)

```ts
import { PrismaClient } from '../../src/generated/prisma/client';

export async function seedCobit2019(prisma: PrismaClient) {
  const FRAMEWORK = 'cobit2019';

  // --- Domains ---
  const domains = [
    { code: 'EDM', name: 'EDM - Đánh giá, Chỉ đạo và Giám sát', sort_order: 1 },
    { code: 'APO', name: 'APO - Liên kết, Lập kế hoạch và Tổ chức', sort_order: 2 },
    { code: 'BAI', name: 'BAI - Xây dựng, Thu mua và Triển khai', sort_order: 3 },
    { code: 'DSS', name: 'DSS - Phân phối, Dịch vụ và Hỗ trợ', sort_order: 4 },
    { code: 'MEA', name: 'MEA - Giám sát, Đánh giá và Thẩm định', sort_order: 5 },
  ];

  for (const d of domains) {
    await prisma.riskCatalogDomain.upsert({
      where: { code: d.code },
      update: { name: d.name, sort_order: d.sort_order },
      create: { ...d, framework: FRAMEWORK },
    });
  }

  // --- Categories (objectives) ---
  // EDM01-EDM05
  const edmCategories = [
    { code: 'EDM01', name: 'EDM01 - Đảm bảo thiết lập và duy trì khung quản trị', domainCode: 'EDM', sort_order: 1 },
    { code: 'EDM02', name: 'EDM02 - Đảm bảo cung cấp lợi ích', domainCode: 'EDM', sort_order: 2 },
    { code: 'EDM03', name: 'EDM03 - Đảm bảo tối ưu hóa rủi ro', domainCode: 'EDM', sort_order: 3 },
    { code: 'EDM04', name: 'EDM04 - Đảm bảo tối ưu hóa nguồn lực', domainCode: 'EDM', sort_order: 4 },
    { code: 'EDM05', name: 'EDM05 - Đảm bảo sự minh bạch cho các bên liên quan', domainCode: 'EDM', sort_order: 5 },
  ];
  // APO01-APO14, BAI01-BAI11, DSS01-DSS06, MEA01-MEA04
  // ... (full list with Vietnamese names)

  // --- Risks per category ---
  // Each objective gets 2-4 representative risks
  // Example: EDM01
  // EDM01-R01: Rủi ro khung quản trị CNTT không đầy đủ hoặc lỗi thời
  // EDM01-R02: Rủi ro vai trò và trách nhiệm quản trị không rõ ràng

  // --- Controls per category ---
  // EDM01-C01: Xây dựng và ban hành chính sách quản trị CNTT
  // EDM01-C02: Định kỳ rà soát và cập nhật khung quản trị

  // --- Procedures per category ---
  // EDM01-P01: Kiểm tra tài liệu khung quản trị CNTT hiện hành
  // EDM01-P02: Phỏng vấn lãnh đạo về hiệu quả khung quản trị

  // --- Link risks ↔ controls, controls ↔ procedures ---
}
```

### 5D. COSO ERM Seed (`prisma/seeds/coso-erm.ts`)

Similar structure with 5 COSO ERM components as domains:
1. Quản trị & Văn hóa (Governance & Culture)
2. Chiến lược & Thiết lập Mục tiêu (Strategy & Objective Setting)
3. Hiệu suất (Performance)
4. Rà soát & Cập nhật (Review & Revision)
5. Thông tin, Truyền thông & Báo cáo (Information, Communication & Reporting)

Each with risk categories and mapped controls/procedures.

### 5E. Estimated Seed Data Volume

- COBIT 2019: 5 domains, 40 categories, ~120 risks, ~100 controls, ~80 procedures
- COSO ERM: 5 domains, ~20 categories, ~60 risks, ~50 controls, ~40 procedures
- Total: ~10 domains, ~60 categories, ~180 risks, ~150 controls, ~120 procedures
- Junction records: ~300 risk-control links, ~200 control-procedure links

---

## Phase 6: Complete File Listing

### New Files

```
prisma/seeds/                                             (new directory)
prisma/seeds/cobit2019.ts
prisma/seeds/coso-erm.ts
prisma/seeds/risk-catalog-common.ts

src/server/actions/risk-catalog-library.ts

src/app/api/settings/risk-catalog/domains/route.ts
src/app/api/settings/risk-catalog/domains/[id]/route.ts
src/app/api/settings/risk-catalog/categories/route.ts
src/app/api/settings/risk-catalog/categories/[id]/route.ts
src/app/api/settings/risk-catalog/risks/route.ts
src/app/api/settings/risk-catalog/risks/[id]/route.ts
src/app/api/settings/risk-catalog/controls/route.ts
src/app/api/settings/risk-catalog/controls/[id]/route.ts
src/app/api/settings/risk-catalog/procedures/route.ts
src/app/api/settings/risk-catalog/procedures/[id]/route.ts
src/app/api/settings/risk-catalog/tree/route.ts
src/app/api/settings/risk-catalog/search/route.ts

src/app/(main)/settings/risk-catalog/page.tsx

src/constants/labels/risk-catalog.ts

src/features/settings/components/risk-catalog/             (new directory)
src/features/settings/components/risk-catalog/RiskCatalogList.tsx
src/features/settings/components/risk-catalog/ControlCatalogList.tsx
src/features/settings/components/risk-catalog/ProcedureCatalogList.tsx
src/features/settings/components/risk-catalog/CatalogDomainTree.tsx
src/features/settings/components/risk-catalog/RiskCatalogForm.tsx
src/features/settings/components/risk-catalog/ControlCatalogForm.tsx
src/features/settings/components/risk-catalog/ProcedureCatalogForm.tsx

src/features/settings/hooks/useRiskCatalog.ts
src/features/settings/api-risk-catalog.ts                  (or add to api.ts)

src/features/engagement/components/tabs/CatalogPickerDialog.tsx
```

### Modified Files

```
prisma/schema.prisma                                       — new models + engagement FK additions
prisma/seed.ts                                             — import and call sub-seeds

src/constants/routes.ts                                    — new API_ROUTES + PAGE_ROUTES entries
src/constants/settings-nav.ts                              — new nav item
src/constants/labels/index.ts                              — export RISK_CATALOG_LABELS

src/features/settings/types.ts                             — new catalog type interfaces

src/features/engagement/types.ts                           — add catalogRiskId, catalogControlId, catalogProcedureId
src/features/engagement/components/tabs/RcmTable.tsx       — "Add from Library" button + CatalogPickerDialog integration
src/features/engagement/components/tabs/useRcmTable.ts     — new state/actions for catalog picker
src/features/engagement/api.ts                             — new API calls for catalog search (if needed from engagement context)
```

---

## Phase 7: Implementation Order

### Step 1 — Schema & Migration
1. Add all new models to `prisma/schema.prisma`
2. Add FK fields to `EngagementRisk`, `EngagementControl`, `EngagementProcedure`
3. Run `npx prisma migrate dev --name add_risk_catalog_library`
4. Verify generated client in `src/generated/prisma/`

### Step 2 — Server Actions
1. Create `src/server/actions/risk-catalog-library.ts`
2. Implement all CRUD + query functions
3. Write Zod validation schemas

### Step 3 — API Routes
1. Create all route files under `src/app/api/settings/risk-catalog/`
2. Update `src/constants/routes.ts` with new routes
3. Test endpoints with manual API calls

### Step 4 — Seed Data
1. Create `prisma/seeds/` directory
2. Implement `risk-catalog-common.ts` with shared helpers
3. Implement `cobit2019.ts` with full COBIT 2019 data
4. Implement `coso-erm.ts` with COSO ERM data
5. Update `prisma/seed.ts` to call sub-seeds
6. Run `npx prisma db seed` and verify data

### Step 5 — Labels & Constants
1. Create `src/constants/labels/risk-catalog.ts`
2. Update `src/constants/labels/index.ts` to export it
3. Update `src/constants/settings-nav.ts` with new nav item
4. Update `src/constants/routes.ts` with PAGE_ROUTES

### Step 6 — Settings Page UI
1. Create `src/features/settings/hooks/useRiskCatalog.ts`
2. Create `src/features/settings/api-risk-catalog.ts`
3. Add types to `src/features/settings/types.ts`
4. Create `CatalogDomainTree.tsx` (reusable)
5. Create `RiskCatalogList.tsx` with DataTable + tree nav
6. Create `RiskCatalogForm.tsx` with FormDialog
7. Create `ControlCatalogList.tsx` + `ControlCatalogForm.tsx`
8. Create `ProcedureCatalogList.tsx` + `ProcedureCatalogForm.tsx`
9. Create settings page `src/app/(main)/settings/risk-catalog/page.tsx`

### Step 7 — RCM Integration
1. Update `src/features/engagement/types.ts` with catalog FK fields
2. Create `CatalogPickerDialog.tsx`
3. Modify `useRcmTable.ts` to add catalog picker state/actions
4. Modify `RcmTable.tsx` to add "Thêm từ thư viện" buttons
5. Update engagement server actions to accept catalog FK fields

---

## Key Design Decisions

1. **Separate from existing `RiskCatalogueItem`**: The existing model is flat, tied to entity-level risk assessment (`EntityRisk`), and has no framework/hierarchy support. Creating new models avoids breaking the Universe feature and enables the richer hierarchy needed for the library.

2. **Copy-on-use, not reference**: When adding from library to engagement, data is *copied* into engagement-scoped entities. The `catalog_*_id` FK is for traceability only. Users can freely edit the engagement copy without affecting the library.

3. **Domain → Category → Item hierarchy**: Three-level hierarchy provides enough depth for frameworks (COBIT domain → objective → risk/control/procedure) without over-engineering. The tree is reusable across settings page and RCM picker.

4. **`source` field**: Distinguishes system-seeded items from user-created ones. System items can be edited but not deleted (soft-archive via `is_active`). Custom items can be fully managed.

5. **Shared `CatalogDomainTree`**: One tree component used in both the settings page sidebar and the "Add from Library" dialog in RCM, keeping navigation consistent.

6. **Tabs pattern**: Following the `templates/page.tsx` pattern with tabs for Risks/Controls/Procedures keeps the settings page manageable and consistent with existing UI.
