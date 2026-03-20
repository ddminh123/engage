# Audit Plan

> � **IN PROGRESS** — Basic CRUD, entity selection, schedule chart. Approval is simplified (direct status change). No versioning, capacity planning, or engagement integration yet.

> Flexible audit planning supporting annual, quarterly, monthly, and custom periods with entity selection from Universe.

---

## Schema (`prisma/schema.prisma`)

| Model          | Key Fields                                                                                                                              | Notes                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `AuditPlan`    | `id`, `title`, `description`, `period_type`, `period_start`, `period_end`, `status`, `created_by`, `approved_by`, `approved_at`         | Plan header              |
| `PlannedAudit` | `id`, `plan_id`, `entity_id`, `title`, `objective`, `scheduled_start`, `scheduled_end`, `status`, `priority`, `estimated_days`, `notes` | Individual audit in plan |

**Filterable fields:** `period_type`, `status`
**Searchable fields:** `title`
**Sortable fields:** `period_start`, `status`, `created_at`

`period_type` enum: `annual` | `quarterly` | `monthly` | `custom`
`plan.status` enum: `draft` | `approved` | `in_progress` | `closed`
`audit.status` enum: `planned` | `in_progress` | `completed` | `deferred` | `cancelled`
`priority` enum: `high` | `medium` | `low`

---

## API Routes (`src/app/api/plan/`)

| Method | Path                            | Permission    | Description                  |
| ------ | ------------------------------- | ------------- | ---------------------------- |
| GET    | `/api/plan`                     | `plan:read`   | List plans                   |
| POST   | `/api/plan`                     | `plan:create` | Create plan                  |
| GET    | `/api/plan/:id`                 | `plan:read`   | Get plan with planned audits |
| PATCH  | `/api/plan/:id`                 | `plan:update` | Update plan                  |
| DELETE | `/api/plan/:id`                 | `plan:delete` | Delete draft plan            |
| POST   | `/api/plan/:id/audits`          | `plan:update` | Add planned audit            |
| PATCH  | `/api/plan/:id/audits/:auditId` | `plan:update` | Update planned audit         |
| DELETE | `/api/plan/:id/audits/:auditId` | `plan:update` | Remove planned audit         |

---

## Actions (`src/server/actions/plan.ts`)

| Function                                    | Description                         |
| ------------------------------------------- | ----------------------------------- |
| `getPlans()`                                | List all plans with audit counts    |
| `getPlanById(id)`                           | Get plan with all planned audits    |
| `createPlan(data)`                          | Create new plan (status=draft)      |
| `updatePlan(id, data)`                      | Update plan details (draft only)    |
| `deletePlan(id)`                            | Delete plan + cascade audits        |
| `addPlannedAudit(planId, data)`             | Add entity to plan as planned audit |
| `updatePlannedAudit(planId, auditId, data)` | Update planned audit details        |
| `removePlannedAudit(planId, auditId)`       | Remove planned audit from plan      |

---

## Feature (`src/features/plan/`)

| File                                 | Purpose                                        |
| ------------------------------------ | ---------------------------------------------- |
| `api.ts`                             | Fetch wrappers for plan API routes             |
| `types.ts`                           | AuditPlan, PlannedAudit, PlanInput types       |
| `constants.ts`                       | Period types, statuses, priorities             |
| `hooks/usePlans.ts`                  | List plans query + mutations                   |
| `hooks/usePlan.ts`                   | Single plan with audits + mutations            |
| `components/PlanPageView.tsx`        | Page orchestrator (list + detail + forms)      |
| `components/PlanList.tsx`            | Plans table (DataTable)                        |
| `components/PlanColumns.tsx`         | Column definitions for plan table              |
| `components/PlanForm.tsx`            | Create/edit plan form (FormSheet)              |
| `components/PlanDetail.tsx`          | Plan detail sheet with audits list             |
| `components/PlannedAuditForm.tsx`    | Add/edit planned audit (entity picker + dates) |
| `components/PlannedAuditColumns.tsx` | Column definitions for audits table            |
| `components/ScheduleChart.tsx`       | Gantt-style horizontal bar chart               |

---

## Integrations

| Module       | Relationship                                          |
| ------------ | ----------------------------------------------------- |
| `universe`   | Entities selected from Universe for planned audits    |
| `engagement` | Future: create engagement from approved planned audit |

---

## Notes

- Only `draft` plans can have structural edits (title, period, add/remove audits)
- An entity can only appear once per plan (unique constraint)
- Planned audit scheduled dates should be within plan period (UI warning, not DB constraint)
- Plan deletion cascades to all planned audits
- All CUD operations logged to AuditLog
- Future: plan versioning, capacity planning, carryover, engagement linking
