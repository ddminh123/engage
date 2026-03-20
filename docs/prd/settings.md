# Settings & Configuration — Detailed PRD

## Overview

System-wide configuration and shared reference data used across all modules. Settings provides the lookup tables, org chart, and templates that other modules depend on.

**Design philosophy:** Admin-managed reference data. Simple CRUD with no complex workflows. Data here is consumed by other modules via dropdowns, filters, and pickers.

---

## System Settings (key-value config)

Generic key-value store for module-level configuration. Avoids creating singleton tables for single-record config.

| Field          | Type         | Required | Notes                                                      |
| -------------- | ------------ | -------- | ---------------------------------------------------------- |
| **Key**        | `string`     | Yes      | Unique key (e.g., `org_chart_meta`, `default_audit_cycle`) |
| **Value**      | `json`       | Yes      | Arbitrary JSON value                                       |
| **Updated at** | `datetime`   | Auto     | Last modification                                          |
| **Updated by** | `ref → User` | Auto     | Last modifier                                              |

**Org Chart metadata** is stored as:

```json
{
  "key": "org_chart_meta",
  "value": {
    "name": "Company Org Structure 2025",
    "description": "Official org chart"
  }
}
```

> Other modules can store their own config here (e.g., default risk score ranges, system name).

---

## Part I: Org Chart (OrgUnit)

A lightweight organizational hierarchy representing business units, departments, and divisions. **Not a full HR system** — just enough structure for audit ownership, entity assignment, and organizational context.

### Contact (shared entity)

Contacts represent people associated with an org unit (leader, contact point). They are stored as separate records so they can be **searched, reused, and managed independently**.

| #   | Field        | Type     | Required | Notes                     |
| --- | ------------ | -------- | -------- | ------------------------- |
| 1   | **Name**     | `string` | Yes      | Full name                 |
| 2   | **Position** | `string` | No       | Job title / role          |
| 3   | **Email**    | `string` | No       | Contact email (validated) |
| 4   | **Phone**    | `string` | No       | Phone number              |
| 5   | **Status**   | `enum`   | Yes      | `active` · `inactive`     |

### OrgUnit Fields

| #   | Field             | Type               | Required | Notes                                                    |
| --- | ----------------- | ------------------ | -------- | -------------------------------------------------------- |
| 1   | **Name**          | `string`           | Yes      | Unit name (e.g., "Finance Department", "IT Division")    |
| 2   | **Code**          | `string`           | No       | Short code (e.g., "FIN", "IT-OPS")                       |
| 3   | **Parent**        | `ref → OrgUnit`    | No       | Parent unit (null = top-level). Creates hierarchy.       |
| 4   | **Leader**        | `ref → Contact`    | No       | Unit leader — searchable autocomplete with "add new"     |
| 5   | **Contact Point** | `ref → Contact`    | No       | Primary contact — searchable autocomplete with "add new" |
| 6   | **Description**   | `text`             | No       | Responsibilities, scope                                  |
| 7   | **Status**        | `enum`             | Yes      | `active` · `inactive`                                    |
| 8   | **Established**   | `date`             | No       | Date the unit was created/established                    |
| 9   | **Discontinued**  | `date`             | No       | Date the unit ceased to function (null = still active)   |
| 10  | **Attachments**   | `ref[] → Document` | No       | Related documents via DocumentAttachment pattern         |
| 11  | **Updated at**    | `datetime`         | Auto     | Last modification timestamp                              |
| 12  | **Updated by**    | `ref → User`       | Auto     | Last user who modified this record                       |

> **All fields are searchable and filterable.**

### Derived Data (read-only, from other modules)

| Data                       | Source                          | Notes                                     |
| -------------------------- | ------------------------------- | ----------------------------------------- |
| **Owned entities**         | `AuditableEntity.owner_unit_id` | Entities this unit owns                   |
| **Participating entities** | `AuditableEntity` via join      | Entities this unit participates in        |
| **Entity count**           | Computed                        | Total entities (owned + participating)    |
| **Risk summary**           | Computed                        | Highest risk level among owned entities   |
| **Recent audits**          | Via entities → Engagement       | Engagements touching this unit's entities |
| **Open findings**          | Via entities → Finding          | Open findings on this unit's entities     |

### Features

**Tree View (primary UI):**

- Expandable/collapsible hierarchy via d3-org-chart
- Click node → opens detail panel
- Status badge (active/inactive)
- Entity count badge per unit
- Zoom, pan, expand/collapse all

**List View (alternate):**

- Uses standard **DataTable** component (see `docs/FE.md` §5)
- Columns: Name, Code, Parent, Head, Status, Entity Count, Established
- Bulk actions: update status

**Create / Edit Form (FormDialog — sticky header/footer, scrollable body):**

- Uses shared `FormDialog` component (see `docs/FE.md` §9.1)
- Basic info section: Name, Code, Status, Parent (searchable Select), Description
- Leader section: `ContactSearch` autocomplete with "Add new" option
- Contact Point section: `ContactSearch` autocomplete with "Add new" option
- "Add new" contact opens a separate `ContactForm` dialog — **no nested modals** (see `docs/FE.md` §9.2). Parent form is hidden while child form is open; state is preserved.
- Attachments section (upload / link documents) — deferred to Document module
- Validation: Name required, Code unique if provided

**Unit Detail Panel (side panel on click from tree/list):**

- Read view of all fields
- Owned entities list with risk levels
- Quick link to entity detail
- Recent audit summary
- Edit button → opens edit form

**Import from Excel:**

- Uses shared import/export service
- Upload CSV/Excel → map columns → preview → validate → confirm
- Required mapping: Name (required), Code, Parent (by name or code)
- Report: created count, skipped, errors

### Business Rules

| Rule     | Description                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------- |
| **OU-1** | Cannot delete a unit that has child units — must reparent or remove children first             |
| **OU-2** | Cannot delete a unit that is assigned as owner/participant of any entity — must reassign first |
| **OU-3** | Deactivating a unit does not affect existing entity assignments (historical data preserved)    |
| **OU-4** | Maximum hierarchy depth: 5 levels (configurable)                                               |
| **OU-5** | Unit code must be unique if provided                                                           |

---

## Part II: Lookup Tables

Configurable reference data used as dropdowns/pickers across modules. All lookup tables share a common pattern.

### Common Lookup Pattern

Each lookup table follows the same structure:

| Field           | Type      | Required | Notes                                                                       |
| --------------- | --------- | -------- | --------------------------------------------------------------------------- |
| **Label**       | `string`  | Yes      | Display name                                                                |
| **Code**        | `string`  | No       | Short code (unique if provided)                                             |
| **Description** | `text`    | No       | Help text / explanation                                                     |
| **Sort Order**  | `int`     | Yes      | Display order in dropdowns                                                  |
| **Is Active**   | `boolean` | Yes      | Inactive items hidden from new selections but preserved on existing records |

### Lookup Tables

| Table               | Default Values                                                                                              | Used By                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **EntityType**      | Process, System, Business Unit, Product, Project, Function, Third Party                                     | Universe: entity type                                   |
| **AuditArea**       | Financial, Operational, IT / Technology, Compliance / Regulatory, Strategic, Governance, Legal, HR / People | Universe: audit subject area                            |
| **AuditCycle**      | Annual, Biennial, Triennial, Ad-hoc, Continuous                                                             | Universe: recommended frequency                         |
| **Tag**             | _(user-defined)_                                                                                            | Universe: entity categorization. Shared across modules. |
| **FindingSeverity** | Critical, High, Medium, Low, Advisory                                                                       | Finding: severity levels                                |
| **RiskScoreConfig** | See below                                                                                                   | Universe: score-to-level mapping                        |

### Risk Score Configuration

Configures how numeric risk scores (1–25) map to risk levels. Stored as a lookup-style table.

| Field          | Type     | Required | Notes                                     |
| -------------- | -------- | -------- | ----------------------------------------- |
| **Level**      | `string` | Yes      | e.g., "Low", "Medium", "High", "Critical" |
| **Min Score**  | `int`    | Yes      | Minimum score for this level (inclusive)  |
| **Max Score**  | `int`    | Yes      | Maximum score for this level (inclusive)  |
| **Color**      | `string` | Yes      | Hex color code for badges/heatmap         |
| **Sort Order** | `int`    | Yes      | Display order                             |

**Default configuration:**

| Level    | Min | Max | Color              |
| -------- | --- | --- | ------------------ |
| Low      | 1   | 4   | `#22c55e` (green)  |
| Medium   | 5   | 9   | `#eab308` (yellow) |
| High     | 10  | 15  | `#f97316` (orange) |
| Critical | 16  | 25  | `#ef4444` (red)    |

### Lookup Management UI

Settings pages use a **Card → Sheet** pattern for managing reference data:

**Page Layout:**

- Page header with title and description
- List of `SettingsCard` components — one per lookup table
- Each card shows: icon, title, description, chevron indicator
- Clicking a card opens a `SettingsSheet` (50% viewport width) containing the DataTable

**SettingsCard (`src/components/shared/SettingsCard.tsx`):**

```tsx
<SettingsCard
  icon={Layers}
  title="Loại đối tượng kiểm toán"
  description="Phân loại đối tượng kiểm toán theo bản chất..."
  onClick={() => setOpenSheet("entityType")}
  badge={<Badge>Mới</Badge>} // optional
/>
```

**SettingsSheet (`src/components/shared/SettingsSheet.tsx`):**

```tsx
<SettingsSheet
  open={openSheet === "entityType"}
  onOpenChange={(open) => !open && setOpenSheet(null)}
  title="Loại đối tượng kiểm toán"
  description="Phân loại đối tượng kiểm toán theo bản chất..."
>
  <EntityTypeList />
</SettingsSheet>
```

**Sheet Content:**

- Uses standard `DataTable` component with CRUD actions
- "Thêm mới" button in table toolbar
- Edit/Delete actions per row
- Create/Edit forms open as nested `FormDialog`

**Benefits:**

- Clean, scannable settings page (cards only)
- Full-width DataTable in sheet for better data visibility
- Consistent pattern across all lookup management
- No page navigation — all CRUD happens in sheets/dialogs

**Example implementation:** See `src/app/(main)/settings/universe/page.tsx`

---

## Part III: Engagement Templates

Reusable templates for structuring audit work programs. When creating a new engagement, the auditor can select a template to pre-populate sections, objectives, and procedures.

### Template Fields

| #   | Field           | Type               | Required | Notes                                                            |
| --- | --------------- | ------------------ | -------- | ---------------------------------------------------------------- |
| 1   | **Name**        | `string`           | Yes      | Template name (e.g., "IT General Controls", "Procurement Audit") |
| 2   | **Description** | `text`             | No       | When to use this template                                        |
| 3   | **Entity Type** | `ref → EntityType` | No       | Suggested entity type this template applies to                   |
| 4   | **Area**        | `ref → AuditArea`  | No       | Suggested audit area                                             |
| 5   | **Status**      | `enum`             | Yes      | `active` · `draft` · `archived`                                  |

### Template Structure

Templates define a 3-level hierarchy:

```
Template
└── Section (e.g., "Access Controls")
    └── Objective (e.g., "Verify access provisioning follows policy")
        └── Procedure (e.g., "Select sample of 25 new access requests")
```

| Model                 | Fields                          | Notes                                 |
| --------------------- | ------------------------------- | ------------------------------------- |
| **TemplateSection**   | `title`, `order`                | Top-level grouping                    |
| **TemplateObjective** | `title`, `order`                | What the audit section aims to verify |
| **TemplateProcedure** | `title`, `description`, `order` | Specific audit step                   |

### Template UI

- **Template List** — Browse templates, filter by entity type / area / status
- **Template Editor** — Drag-and-drop section/objective/procedure builder
- **Template Preview** — Read-only view of full work program structure

### Business Rules

| Rule     | Description                                                                              |
| -------- | ---------------------------------------------------------------------------------------- |
| **TM-1** | Templates are versioned copies — editing a template does not affect existing engagements |
| **TM-2** | Only `active` templates appear in the engagement creation picker                         |
| **TM-3** | Cannot delete a template that has been used by engagements — archive instead             |

---

## Permissions

| Permission        | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `settings:read`   | View all settings, lookup tables, org chart, templates |
| `settings:manage` | Create, edit, reorder, deactivate any settings data    |

> Settings is admin-level. Most users only need `settings:read` (consumed via dropdowns). Only admins get `settings:manage`.

---

## Integration Points

| Module          | What Settings Provides                                           |
| --------------- | ---------------------------------------------------------------- |
| **Universe**    | EntityType, AuditArea, AuditCycle, OrgUnit, Tag, RiskScoreConfig |
| **Engagement**  | EngagementTemplate (work program pre-population), OrgUnit        |
| **Finding**     | FindingSeverity                                                  |
| **Plan**        | OrgUnit, AuditCycle                                              |
| **All modules** | Tag (shared tagging system)                                      |

---

## Implementation Notes

- **Caching:** Reference data should be loaded once and cached client-side (TanStack Query with long `staleTime`). Invalidate on settings mutation.
- **Seeding:** Default values for all lookup tables should be seeded on first deployment via `prisma/seed.ts`.
- **Import/Export:** Lookup tables and org chart should support CSV import/export via the shared import/export service (see Universe PRD F7).
- **Soft delete only:** All settings data uses active/inactive toggle, never hard delete. This preserves referential integrity with existing records.
