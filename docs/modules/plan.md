# Audit Plan

> 🔲 **PLACEHOLDER** — This is a design document. Schema, routes, and components will be finalized during implementation.

> Flexible audit planning supporting annual, quarterly, monthly, and custom periods with risk-based entity selection.

---

## Schema (`prisma/schema.prisma`)

| Model          | Key Fields                                                                      | Notes                     |
| -------------- | ------------------------------------------------------------------------------- | ------------------------- |
| `AuditPlan`    | `id`, `title`, `period_type`, `period_start`, `period_end`, `status`, `version` | Plan header               |
| `PlanItem`     | `id`, `plan_id`, `entity_id`, `priority_score`, `status`, `notes`               | Selected entities in plan |
| `PlanApproval` | `id`, `plan_id`, `approved_by`, `approved_at`, `comment`                        | Approval trail            |

**Filterable fields:** `period_type`, `status`, `period_start`, `period_end`
**Searchable fields:** `title`
**Sortable fields:** `period_start`, `status`, `createdAt`

`period_type` enum: `annual` | `quarterly` | `monthly` | `custom`
`status` enum: `draft` | `review` | `approved` | `in_progress` | `closed`

---

## API Routes (`src/app/api/plan/`)

| Method | Path                          | Permission     | Description             |
| ------ | ----------------------------- | -------------- | ----------------------- |
| GET    | `/api/plan`                   | `plan:read`    | List plans              |
| GET    | `/api/plan/:id`               | `plan:read`    | Get plan with items     |
| POST   | `/api/plan`                   | `plan:create`  | Create plan             |
| PUT    | `/api/plan/:id`               | `plan:update`  | Update plan             |
| DELETE | `/api/plan/:id`               | `plan:delete`  | Delete draft plan       |
| POST   | `/api/plan/:id/submit`        | `plan:submit`  | Submit for approval     |
| POST   | `/api/plan/:id/approve`       | `plan:approve` | Approve plan            |
| POST   | `/api/plan/:id/items`         | `plan:update`  | Add entity to plan      |
| DELETE | `/api/plan/:id/items/:itemId` | `plan:update`  | Remove entity from plan |

---

## Actions (`src/server/actions/plan.ts`)

| Function                          | Description                          |
| --------------------------------- | ------------------------------------ |
| `getAll(filters)`                 | List plans with filter/pagination    |
| `getById(id)`                     | Get plan with all items and entities |
| `create(data)`                    | Create new plan                      |
| `update(id, data)`                | Update plan details                  |
| `delete(id)`                      | Delete draft plan                    |
| `submit(id)`                      | Submit plan for approval             |
| `approve(id, comment)`            | Approve plan                         |
| `addItem(planId, entityId, data)` | Add entity to plan                   |
| `removeItem(planId, itemId)`      | Remove entity from plan              |

---

## Feature (`src/features/plan/`)

| File                                   | Purpose                                   |
| -------------------------------------- | ----------------------------------------- |
| `api.ts`                               | Fetch wrappers for plan API routes        |
| `hooks/usePlans.ts`                    | List plans query                          |
| `hooks/usePlan.ts`                     | Single plan with items                    |
| `hooks/usePlanMutations.ts`            | Create/update/approve mutations           |
| `components/PlanList.tsx`              | List page                                 |
| `components/PlanDetail.tsx`            | Plan detail with items and progress       |
| `components/PlanForm.tsx`              | Create/edit form (period type selector)   |
| `components/EntityPicker.tsx`          | Risk-based entity selection from Universe |
| `components/PlanProgressDashboard.tsx` | Planned vs actual progress                |
| `types.ts`                             | AuditPlan, PlanItem, PlanFilters types    |

---

## Integrations

| Module       | Relationship                           |
| ------------ | -------------------------------------- |
| `universe`   | Entities are selected from Universe    |
| `engagement` | Approved plan items create Engagements |

---

## Notes

- Only `draft` plans can be edited
- Plan versioning tracks changes after approval
- Incomplete items can be carried forward to next period plan
- Reserved capacity field allows buffer for unplanned engagements
