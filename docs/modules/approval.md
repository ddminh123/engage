# Approval Workflow Module

## Overview

The approval workflow system provides a **configurable state-machine** for reviewing and approving audit entities (procedures, work programs, planning workpapers, etc.). Workflows are defined centrally in Settings and bound to entity types. A **default workflow** is used as fallback when an entity type has no explicit binding.

---

## Data Model

### `ApprovalWorkflow`

| Column              | Type     | Description                                                                          |
| ------------------- | -------- | ------------------------------------------------------------------------------------ |
| id                  | cuid     | Primary key                                                                          |
| entity_type         | String?  | **DEPRECATED** — use `ApprovalEntityBinding` instead                                 |
| name                | String   | Display name, e.g. "Quy trình soát xét mặc định"                                     |
| allow_self_approval | Boolean  | If false, the submitter cannot approve their own work (CAE always exempt)            |
| is_active           | Boolean  | Inactive workflows are skipped by the engine                                         |
| is_default          | Boolean  | **Only one** workflow can be default at a time. Used when entity type has no binding |
| created_at          | DateTime | Auto-set                                                                             |
| updated_at          | DateTime | Auto-updated                                                                         |

**Relations:** `transitions[]`, `entity_bindings[]`

### `ApprovalEntityBinding`

Maps entity types → workflows. Each entity type has at most one binding (unique on `entity_type`).

| Column      | Type    | Description                                                   |
| ----------- | ------- | ------------------------------------------------------------- |
| id          | cuid    | Primary key                                                   |
| entity_type | String  | `"procedure"`, `"work_program"`, `"planning_workpaper"`, etc. |
| workflow_id | String  | FK → `ApprovalWorkflow.id`                                    |
| label       | String? | Display name for the entity type                              |

### `ApprovalStatus`

Dynamic status definitions with categories. Users can define custom statuses; 7 system statuses are protected.

| Column     | Type    | Description                                         |
| ---------- | ------- | --------------------------------------------------- |
| id         | cuid    | Primary key                                         |
| key        | String  | Unique slug: `"not_started"`, `"in_progress"`, etc. |
| label      | String  | Display name: `"Chưa bắt đầu"`                      |
| color      | String  | Hex from 15-color palette, default `"#94a3b8"`      |
| category   | String  | `"open"` / `"active"` / `"review"` / `"done"`       |
| is_system  | Boolean | `true` = can't delete or change key/category        |
| sort_order | Int     | Display ordering within category                    |

**Categories drive behavior:**

- `open` — Initial state, entity is editable
- `active` — In progress, entity is editable
- `review` — Under review, entity is **read-only**
- `done` — Complete, entity is **locked**

**System statuses (protected):**

| Key                  | Label          | Category | Color     |
| -------------------- | -------------- | -------- | --------- |
| `not_started`        | Chưa bắt đầu   | open     | `#94a3b8` |
| `in_progress`        | Đang thực hiện | active   | `#3b82f6` |
| `needs_modification` | Cần chỉnh sửa  | active   | `#ef4444` |
| `waiting_review`     | Chờ soát xét   | review   | `#f59e0b` |
| `reviewed`           | Đã soát xét    | review   | `#10b981` |
| `waiting_approval`   | Đợi phê duyệt  | review   | `#8b5cf6` |
| `approved`           | Đã phê duyệt   | done     | `#10b981` |

### `ApprovalTransition`

Defines allowed state transitions within a workflow.

| Column        | Type   | Description                                                       |
| ------------- | ------ | ----------------------------------------------------------------- |
| id            | cuid   | Primary key                                                       |
| workflow_id   | String | FK → `ApprovalWorkflow.id`                                        |
| from_status   | String | Status key, e.g. `"not_started"`, `"waiting_review"`              |
| to_status     | String | Status key, e.g. `"approved"`, `"needs_modification"`             |
| action_label  | String | UI button label, e.g. "Gửi soát xét", "Phê duyệt"                 |
| action_type   | String | Semantic type: `"submit"` / `"approve"` / `"reject"` / `"revise"` |
| allowed_roles | Json   | Array of role strings. `["*"]` = any user                         |
| sort_order    | Int    | Controls button display order                                     |

**Unique constraint:** `(workflow_id, from_status, to_status)`

---

## Status Flow (Default 2-Step Workflow)

```
not_started ──[Bắt đầu]──► in_progress ──[Gửi soát xét]──► waiting_review ──[Phê duyệt]──► approved
                                                                  │
                                                                  ├──[Yêu cầu chỉnh sửa]──► needs_modification
                                                                                                  │
                                                                                      [Gửi lại soát xét]──► waiting_review
```

Statuses are **dynamic** — defined in the `ApprovalStatus` table. See Data Model above.

---

## Workflow Resolution Logic

When the approval engine needs to find the workflow for an entity:

1. **Check `ApprovalEntityBinding`** for the entity type
2. If found → use the bound workflow
3. If not found → **fallback to the default workflow** (`is_default = true`)
4. If no default exists → no transitions available (entity cannot be submitted)

This is implemented in `src/server/actions/approvalEngine.ts` → `getAvailableTransitions()`.

---

## Self-Approval Rules

- If `allow_self_approval = false` on a workflow, the user who submitted the entity **cannot** approve it
- This is checked by comparing `userId` with `lastPublishedBy` from the entity's version history
- **CAE role is always exempt** — can approve regardless
- Only applies to transitions with `action_type = "approve"`

---

## Role-Based Access

Each transition defines `allowed_roles` as a JSON array:

- `["*"]` — any authenticated user can perform this action
- `["reviewer", "lead", "cae"]` — only users with these engagement/system roles
- Roles are resolved from both:
  - **System role** (`user.role`) — e.g. `cae`, `admin`, `audit_director`
  - **Engagement member role** (`engagementMember.role`) — e.g. `lead`, `reviewer`, `member`

---

## API Routes

### Approval Engine (per-entity)

| Method | Route                                               | Description               |
| ------ | --------------------------------------------------- | ------------------------- |
| GET    | `/api/approval/[entityType]/[entityId]/transitions` | Get available transitions |
| POST   | `/api/approval/[entityType]/[entityId]/transitions` | Execute a transition      |

### Workflow Settings (admin)

| Method | Route                                                     | Description         |
| ------ | --------------------------------------------------------- | ------------------- |
| GET    | `/api/settings/approval-workflows`                        | List all workflows  |
| POST   | `/api/settings/approval-workflows`                        | Create a workflow   |
| GET    | `/api/settings/approval-workflows/[id]`                   | Get single workflow |
| PATCH  | `/api/settings/approval-workflows/[id]`                   | Update workflow     |
| DELETE | `/api/settings/approval-workflows/[id]`                   | Delete workflow     |
| POST   | `/api/settings/approval-workflows/[id]/transitions`       | Add transition      |
| PATCH  | `/api/settings/approval-workflows/[id]/transitions/[tid]` | Update transition   |
| DELETE | `/api/settings/approval-workflows/[id]/transitions/[tid]` | Delete transition   |

### Approval Status Settings (admin)

| Method | Route                                  | Description       |
| ------ | -------------------------------------- | ----------------- |
| GET    | `/api/settings/approval-statuses`      | List all statuses |
| POST   | `/api/settings/approval-statuses`      | Create a status   |
| GET    | `/api/settings/approval-statuses/[id]` | Get single status |
| PATCH  | `/api/settings/approval-statuses/[id]` | Update status     |
| DELETE | `/api/settings/approval-statuses/[id]` | Delete status     |

### Entity Binding Settings

| Method | Route                                                             | Description       |
| ------ | ----------------------------------------------------------------- | ----------------- |
| GET    | `/api/settings/approval-workflows/entity-bindings`                | List all bindings |
| POST   | `/api/settings/approval-workflows/entity-bindings`                | Upsert a binding  |
| DELETE | `/api/settings/approval-workflows/entity-bindings?entityType=...` | Delete a binding  |

All settings routes require `settings:manage` permission.

---

## Frontend Architecture

### Settings UI (`/settings/approval-workflows`)

The settings page has **three tabs**:

1. **Quản lý (Manage)** — Entity↔Workflow mapping table
   - Shows all entity bindings with their assigned workflow
   - Inline Select to change the workflow for each entity
   - Add/remove entity bindings
   - Displays which workflow is the default fallback
   - Component: `EntityMappingTable`

2. **Quy trình (Workflows)** — Workflow list + management
   - Collapsible cards for each workflow
   - Inline name editing (double-click)
   - Toggle switches: Kích hoạt (active), Tự phê duyệt (self-approval), Mặc định (default)
   - Expanded view shows transition table with add/edit/delete
   - Create new workflow via dialog
   - Component: `ApprovalWorkflowList`

3. **Trạng thái (Statuses)** — Dynamic status management
   - Grouped by category (open, active, review, done)
   - Add custom statuses with label, key, color, and category
   - Edit label/color of any status (system statuses can't change key/category)
   - Delete custom statuses (blocked if used in transitions)
   - 15-color palette picker
   - Component: `ApprovalStatusList`

### Wrapper Component

`ApprovalWorkflowSettings` — wraps all three tabs using Shadcn `Tabs`.

### Hooks

| Hook                          | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `useApprovalWorkflows`        | Fetch all workflows                            |
| `useApprovalWorkflow`         | Fetch single workflow                          |
| `useCreateApprovalWorkflow`   | Create workflow mutation                       |
| `useUpdateApprovalWorkflow`   | Update workflow mutation                       |
| `useDeleteApprovalWorkflow`   | Delete workflow mutation                       |
| `useAddApprovalTransition`    | Add transition to workflow                     |
| `useUpdateApprovalTransition` | Update transition                              |
| `useDeleteApprovalTransition` | Delete transition                              |
| `useUpsertEntityBinding`      | Upsert entity binding mutation                 |
| `useDeleteEntityBinding`      | Delete entity binding mutation                 |
| `useApprovalStatuses`         | Fetch all statuses (staleTime: Infinity)       |
| `useStatusMap`                | `Map<key, ApprovalStatusItem>` for O(1) lookup |
| `useStatusCategory`           | Get category for a status key                  |
| `useIsReviewMode`             | `true` if status is review/done category       |
| `useCreateApprovalStatus`     | Create status mutation                         |
| `useUpdateApprovalStatus`     | Update status mutation                         |
| `useDeleteApprovalStatus`     | Delete status mutation                         |

### Engagement-Side Hooks

| Hook                      | Purpose                             |
| ------------------------- | ----------------------------------- |
| `useAvailableTransitions` | Fetch transitions for entity status |
| `useExecuteTransition`    | Execute a status transition         |

---

## Key Files

| File                                                            | Purpose                                   |
| --------------------------------------------------------------- | ----------------------------------------- |
| `prisma/schema.prisma`                                          | Data model (4 tables)                     |
| `prisma/seed.ts`                                                | Default + procedure workflows             |
| `src/server/actions/approvalEngine.ts`                          | Core engine (transitions + execution)     |
| `src/server/actions/approvalWorkflow.ts`                        | CRUD for workflows, transitions, bindings |
| `src/features/settings/components/ApprovalWorkflowSettings.tsx` | Tab wrapper                               |
| `src/features/settings/components/ApprovalWorkflowList.tsx`     | Workflow cards + transitions              |
| `src/features/settings/components/ApprovalStatusList.tsx`       | Dynamic status management UI              |
| `src/features/settings/components/EntityMappingTable.tsx`       | Entity↔Workflow mapping table             |
| `src/features/settings/hooks/useApprovalWorkflows.ts`           | React Query hooks (workflows)             |
| `src/features/settings/hooks/useApprovalStatuses.ts`            | React Query hooks (statuses + helpers)    |
| `src/features/settings/api.ts`                                  | API client functions                      |
| `src/features/settings/types.ts`                                | TypeScript interfaces                     |

---

## Default Workflow Constraint

**Only one workflow can be `is_default = true` at a time.** This is enforced in the server actions:

- `createWorkflow`: if `isDefault = true`, sets all existing workflows to `is_default = false` first
- `updateWorkflow`: if `isDefault = true`, unsets default on all other workflows (`id != current`)

The UI reflects this with a "Mặc định" toggle on each workflow card.

---

## Seed Data

The seed (`prisma/seed.ts`) creates two workflows:

1. **Quy trình soát xét mặc định** (`is_default = true`)
   - 4 transitions: draft → waiting_review → approved / needs_modification → waiting_review
   - Used for any entity type without explicit binding

2. **Soát xét thủ tục** (`is_default = false`)
   - Same transition structure
   - Explicitly bound to entity type `"procedure"` via `ApprovalEntityBinding`

---

## Adding a New Entity Type

To add approval support for a new entity type:

1. Add an `approval_status` column to the entity's DB table (default `"not_started"`)
2. Add a `case` in `getEntityStatus()` and `updateEntityStatus()` in `approvalEngine.ts`
3. Add the entity type to `ENTITY_TYPE_OPTIONS` in `EntityMappingTable.tsx`
4. Create an entity binding in Settings → Quản lý tab, or let it use the default workflow
5. Use `useAvailableTransitions(entityType, entityId)` and `useExecuteTransition()` in the entity's UI
