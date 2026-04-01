# Audit Engagement

> � **IN PROGRESS** — Core engagement workflow, work program, planning/execution phase separation, and approval are implemented.

> Manages the full audit lifecycle from planning through fieldwork, review, and report issuance.

---

## Schema (`prisma/schema.prisma`)

| Model                  | Key Fields                                                                                                                                                                                                   | Notes                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `Engagement`           | `id`, `title`, `entity_id`, `planned_audit_id`, `status`, `scope`, `start_date`, `end_date`                                                                                                                  | Engagement header                        |
| `Engagement` (WP appr) | `wp_approval_status`, `wp_approved_by`, `wp_approved_at`, `wp_approved_version`                                                                                                                              | WP-level approval fields                 |
| `EngagementMember`     | `id`, `engagement_id`, `user_id`, `role`                                                                                                                                                                     | Assigned auditors                        |
| `EngagementSection`    | `id`, `engagement_id`, `title`, `phase`, `planning_ref_id`, `source`, `sort_order`                                                                                                                           | Work program section                     |
| `EngagementObjective`  | `id`, `section_id`, `title`, `phase`, `planning_ref_id`, `source`, `sort_order`                                                                                                                              | Objective under section or standalone    |
| `EngagementProcedure`  | `id`, `objective_id`, `section_id`, `title`, `phase`, `planning_ref_id`, `source`, `approval_status`                                                                                                         | Testing procedure with workpaper         |
| `PlanningStepConfig`   | `id`, `key`, `title`, `icon`, `step_type`, `is_active`, `sort_order`                                                                                                                                         | System-level configurable planning steps |
| `PlanningWorkpaper`    | `id`, `engagement_id`, `step_config_id`, `content` (JSON), `approval_status`, `current_version`                                                                                                              | Custom workpaper for planning steps      |
| `DraftFinding`         | `id`, `engagement_id`, `procedure_id`, `title`, `description`, `status`                                                                                                                                      | Draft before confirming                  |
| `WpSignoff`            | `id`, `engagement_id`, `entity_type`, `entity_id`, `signoff_type`, `signoff_order`, `user_id`, `signed_at`, `version`, `transition_id`, `invalidated_at`, `invalidated_by`, `invalidation_reason`, `comment` | Append-only signoff records              |

### WP Phase Separation

- `phase`: `"planning"` | `"execution"` — separates planning-phase WP items from execution-phase
- `planning_ref_id`: links execution clone back to its planning original
- `source`: `"planned"` | `"rcm"` | `"manual"` — tracks how the item was created
- Sync API clones planning→execution items with idempotency checks

### WP Approval Statuses

`wp_approval_status` / `approval_status` enum: `draft` | `waiting_review` | `needs_modification` | `reviewed` | `waiting_approval` | `approved`

---

## API Routes (`src/app/api/engagement/`)

| Method | Path                                              | Permission          | Description                                   |
| ------ | ------------------------------------------------- | ------------------- | --------------------------------------------- |
| GET    | `/api/engagement`                                 | `engagement:read`   | List engagements                              |
| GET    | `/api/engagement/:id`                             | `engagement:read`   | Get with full work program + approval status  |
| POST   | `/api/engagement`                                 | `engagement:create` | Create (manual/from plan/duplicate/template)  |
| PATCH  | `/api/engagement/:id`                             | `engagement:update` | Update details                                |
| DELETE | `/api/engagement/:id`                             | `engagement:delete` | Delete draft                                  |
| POST   | `/api/engagement/:id/sync-planning-to-execution`  | `engagement:update` | Clone planning-phase WP items to execution    |
| POST   | `/api/engagement/:id/sync-rcm-to-wp`              | `engagement:update` | Create WP items from RCM                      |
| GET    | `/api/approval/:entityType/:entityId/transitions` | `engagement:read`   | Available approval transitions                |
| POST   | `/api/approval/:entityType/:entityId/execute`     | `engagement:update` | Execute an approval transition                |
| POST   | `/api/approval/:entityType/:entityId/sign`        | `engagement:update` | Manual signoff (respects sequential order)    |
| POST   | `/api/approval/:entityType/:entityId/unsign`      | `engagement:update` | Invalidate a signoff (ownership + lock check) |
| GET    | `/api/engagement/:id/wp-signoffs`                 | `engagement:read`   | All signoffs for an engagement                |
| GET    | `/api/engagement/:id/workflow-signoff-types`      | `engagement:read`   | Signoff slot config from workflow             |

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

| Function                    | Description                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| `getAvailableTransitions()` | Returns allowed actions based on role + status                        |
| `executeTransition()`       | Validate & execute status change with audit logging                   |
| `getWorkflowSignoffTypes()` | Counts signoff slots from transitions with `generates_signoff = true` |
| `manualSign()`              | Create signoff record with sequential order enforcement               |
| `unsignSignoff()`           | Invalidate signoff with ownership + lock checks                       |
| `deriveSignoffOrder()`      | Compute 1-based signoff order from workflow forward path              |

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

### Signoff System

- **Signoff slots** are determined by transitions with `generates_signoff = true` on `ApprovalTransition`
- **Signoff type** is explicit via `signoff_type` field on `ApprovalTransition` (`prepare` | `review` | `approve`). When `generates_signoff = true`, admin selects the signoff type in the form.
- **Sequential enforcement**: lower-level signoffs (prepare) must exist before higher-level (review/approve) can be signed
- **Unsign lock**: cannot unsign if a higher-level signoff is active on the same entity
- **Append-only**: signoffs are never deleted, only invalidated with `invalidated_at` + `invalidation_reason`
- **Manual sign**: `WpSignoffBar` provides sign/unsign buttons per slot; signoff type derived from workflow config
- **Auto-sign**: `executeTransition()` also creates signoff records when `generates_signoff = true` + `signoff_type` is set

### `action_type` Clarification

`action_type` on `ApprovalTransition` has **only two special behaviors**:

| `action_type`                                       | Special behavior                                               |
| --------------------------------------------------- | -------------------------------------------------------------- |
| `start`                                             | Creates "Bản thảo" version label + auto-assigns `WpAssignment` |
| `approve`                                           | Stamps `approved_by/at/version` fields + blocks self-approval  |
| All others (`submit`, `review`, `reject`, `revise`) | No special behavior — purely label/categorization              |

Signoff configuration is **fully decoupled** from `action_type` via the explicit `generates_signoff` + `signoff_type` fields.
