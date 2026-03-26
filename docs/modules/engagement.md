# Audit Engagement

> � **IN PROGRESS** — Core engagement workflow, work program, planning/execution phase separation, and approval are implemented.

> Manages the full audit lifecycle from planning through fieldwork, review, and report issuance.

---

## Schema (`prisma/schema.prisma`)

| Model                  | Key Fields                                                                                           | Notes                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `Engagement`           | `id`, `title`, `entity_id`, `planned_audit_id`, `status`, `scope`, `start_date`, `end_date`          | Engagement header                        |
| `Engagement` (WP appr) | `wp_approval_status`, `wp_approved_by`, `wp_approved_at`, `wp_approved_version`                      | WP-level approval fields                 |
| `EngagementMember`     | `id`, `engagement_id`, `user_id`, `role`                                                             | Assigned auditors                        |
| `EngagementSection`    | `id`, `engagement_id`, `title`, `phase`, `planning_ref_id`, `source`, `sort_order`                   | Work program section                     |
| `EngagementObjective`  | `id`, `section_id`, `title`, `phase`, `planning_ref_id`, `source`, `sort_order`                      | Objective under section or standalone    |
| `EngagementProcedure`  | `id`, `objective_id`, `section_id`, `title`, `phase`, `planning_ref_id`, `source`, `approval_status` | Testing procedure with workpaper         |
| `PlanningStepConfig`   | `id`, `key`, `title`, `icon`, `step_type`, `is_active`, `sort_order`                                 | System-level configurable planning steps |
| `PlanningWorkpaper`    | `id`, `engagement_id`, `step_config_id`, `content` (JSON), `approval_status`, `current_version`      | Custom workpaper for planning steps      |
| `DraftFinding`         | `id`, `engagement_id`, `procedure_id`, `title`, `description`, `status`                              | Draft before confirming                  |

### WP Phase Separation

- `phase`: `"planning"` | `"execution"` — separates planning-phase WP items from execution-phase
- `planning_ref_id`: links execution clone back to its planning original
- `source`: `"planned"` | `"rcm"` | `"manual"` — tracks how the item was created
- Sync API clones planning→execution items with idempotency checks

### WP Approval Statuses

`wp_approval_status` / `approval_status` enum: `draft` | `waiting_review` | `needs_modification` | `reviewed` | `waiting_approval` | `approved`

---

## API Routes (`src/app/api/engagement/`)

| Method | Path                                              | Permission          | Description                                  |
| ------ | ------------------------------------------------- | ------------------- | -------------------------------------------- |
| GET    | `/api/engagement`                                 | `engagement:read`   | List engagements                             |
| GET    | `/api/engagement/:id`                             | `engagement:read`   | Get with full work program + approval status |
| POST   | `/api/engagement`                                 | `engagement:create` | Create (manual/from plan/duplicate/template) |
| PATCH  | `/api/engagement/:id`                             | `engagement:update` | Update details                               |
| DELETE | `/api/engagement/:id`                             | `engagement:delete` | Delete draft                                 |
| POST   | `/api/engagement/:id/sync-planning-to-execution`  | `engagement:update` | Clone planning-phase WP items to execution   |
| POST   | `/api/engagement/:id/sync-rcm-to-wp`              | `engagement:update` | Create WP items from RCM                     |
| GET    | `/api/approval/:entityType/:entityId/transitions` | `engagement:read`   | Available approval transitions               |
| POST   | `/api/approval/:entityType/:entityId/execute`     | `engagement:update` | Execute an approval transition               |

**Entity types for approval:** `procedure`, `work_program`, `planning_workpaper`

---

## Actions (`src/server/actions/engagement.ts`)

| Function                                     | Description                                          |
| -------------------------------------------- | ---------------------------------------------------- |
| `getAll(filters)`                            | List with filter/sort/pagination                     |
| `getById(id)`                                | Get engagement with full work program tree           |
| `create(data)`                               | Create — handles manual/plan/duplicate/template      |
| `syncPlanningToExecution(engagementId, ...)` | Clone planning-phase WP items to execution with refs |
| `syncRcmToWorkProgram(engagementId, ...)`    | Create WP items from RCM objectives/controls         |

### Approval Engine (`src/server/actions/approvalEngine.ts`)

| Function                    | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `getAvailableTransitions()` | Returns allowed actions based on role + status      |
| `executeTransition()`       | Validate & execute status change with audit logging |

---

## Feature (`src/features/engagement/`)

| File                                             | Purpose                                                         |
| ------------------------------------------------ | --------------------------------------------------------------- |
| `api.ts`                                         | Fetch wrappers for engagement API routes                        |
| `hooks/useEngagements.ts`                        | List query, mutations, sync hooks, approval hooks               |
| `hooks/usePlanningEditor.ts`                     | useReducer for planning tab state                               |
| `hooks/usePlanningWorkpapers.ts`                 | React Query hooks for planning workpapers                       |
| `hooks/useWorkProgramEditor.ts`                  | useReducer for work program editor state                        |
| `components/tabs/PlanningTab.tsx`                | Dynamic planning step rendering with WpApprovalBar              |
| `components/tabs/ExecutionTab.tsx`               | Execution-phase WP with sync-from-planning button               |
| `components/tabs/WpApprovalBar.tsx`              | WP-level approval status + transition action buttons            |
| `components/tabs/PlanningWorkpaperCard.tsx`      | Rich text workpaper card for custom planning steps              |
| `components/work-program/WorkProgramV2.tsx`      | Drag-drop work program (Section→Objective→Procedure) + readOnly |
| `components/work-program/WpSectionCard.tsx`      | Section card with readOnly support                              |
| `components/work-program/WpObjectiveCard.tsx`    | Objective card with readOnly support                            |
| `components/work-program/ProcedureWorkpaper.tsx` | Full-screen workpaper editor with version history               |
| `types.ts`                                       | All engagement types including phase/approval fields            |

---

## Planning Review Mode

When `wpApprovalStatus` is `waiting_review` or `waiting_approval`:

- **PlanningTab** hides all add/edit/delete buttons for objectives, understanding, RCM sync, and work program
- **WorkProgramV2** hides toolbar (add section/objective), batch bar, and inline add forms
- **WpSectionCard / WpObjectiveCard** hide context menus (edit/delete/duplicate/move) and add buttons
- **WpApprovalBar** still shows transition buttons based on current user's role permissions

---

## Settings Dependencies

| Setting                 | Location                      | Purpose                                          |
| ----------------------- | ----------------------------- | ------------------------------------------------ |
| `PlanningStepConfig`    | Settings → Bước kế hoạch      | Configure planning tab steps (order, visibility) |
| `ApprovalWorkflow`      | Settings → Quy trình soát xét | Configure approval transitions per entity type   |
| `ApprovalEntityBinding` | Settings → Quy trình soát xét | Bind workflow to entity type                     |

---

## Integrations

| Module     | Relationship                                                                       |
| ---------- | ---------------------------------------------------------------------------------- |
| `universe` | Links to auditable entity                                                          |
| `plan`     | Can be created from plan item                                                      |
| `finding`  | Confirmed draft findings go to Findings module                                     |
| `document` | Evidence via `DocumentAttachment` — upload new or reuse existing file at any level |
| `teams`    | Auditors assigned from Teams; roles used for approval permission checks            |

---

## Notes

- Work program reorder uses drag-drop; `sort_order` field persists position
- `planned_audit_id` is nullable (manual or template creation has no plan link)
- Planning→execution sync is idempotent (checks `planning_ref_id` before cloning)
- WP approval uses the generic approval engine (`ApprovalWorkflow` + `ApprovalTransition`)
- `PlanningStepConfig` with `step_type: "fixed"` cannot be deleted, only hidden
- Custom steps (`step_type: "workpaper"`) store Tiptap JSON content in `PlanningWorkpaper`
