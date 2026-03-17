# Audit Engagement

> 🔲 **PLACEHOLDER** — This is a design document. Schema, routes, and components will be finalized during implementation.

> Manages the full audit lifecycle from planning through fieldwork, review, and report issuance.

---

## Schema (`prisma/schema.prisma`)

| Model              | Key Fields                                                                              | Notes                   |
| ------------------ | --------------------------------------------------------------------------------------- | ----------------------- |
| `Engagement`       | `id`, `title`, `entity_id`, `plan_item_id`, `status`, `scope`, `start_date`, `end_date` | Engagement header       |
| `EngagementMember` | `id`, `engagement_id`, `user_id`, `role`                                                | Assigned auditors       |
| `Section`          | `id`, `engagement_id`, `title`, `order`, `priority`                                     | Work program section    |
| `Objective`        | `id`, `section_id`, `title`, `order`, `priority`                                        | Objective under section |
| `Procedure`        | `id`, `objective_id`, `title`, `description`, `order`, `priority`, `status`             | Testing procedure       |
| `AuditNote`        | `id`, `engagement_id`, `content`, `created_by`                                          | Audit notes             |
| `DraftFinding`     | `id`, `engagement_id`, `procedure_id`, `title`, `description`, `status`                 | Draft before confirming |

**Evidence/documents:** Attached via `DocumentAttachment` (ref_type: `engagement` \| `section` \| `objective` \| `procedure`). See `docs/modules/document.md`.

**Filterable fields:** `status`, `entity_id`, `start_date`, `end_date`, `assigned_to`
**Searchable fields:** `title`, `scope`
**Sortable fields:** `title`, `start_date`, `status`, `createdAt`

`status` enum: `planning` | `fieldwork` | `review` | `reporting` | `closed`
`procedure.status` enum: `not_started` | `in_progress` | `completed` | `not_applicable`

---

## API Routes (`src/app/api/engagement/`)

| Method | Path                                                     | Permission          | Description                                  |
| ------ | -------------------------------------------------------- | ------------------- | -------------------------------------------- |
| GET    | `/api/engagement`                                        | `engagement:read`   | List engagements                             |
| GET    | `/api/engagement/:id`                                    | `engagement:read`   | Get with full work program                   |
| POST   | `/api/engagement`                                        | `engagement:create` | Create (manual/from plan/duplicate/template) |
| PUT    | `/api/engagement/:id`                                    | `engagement:update` | Update details                               |
| DELETE | `/api/engagement/:id`                                    | `engagement:delete` | Delete draft                                 |
| POST   | `/api/engagement/:id/submit`                             | `engagement:submit` | Advance workflow stage                       |
| GET    | `/api/engagement/:id/sections`                           | `engagement:read`   | List sections                                |
| POST   | `/api/engagement/:id/sections`                           | `engagement:update` | Add section                                  |
| PUT    | `/api/engagement/:id/sections/:sectionId`                | `engagement:update` | Update section                               |
| DELETE | `/api/engagement/:id/sections/:sectionId`                | `engagement:update` | Delete section                               |
| POST   | `/api/engagement/:id/sections/reorder`                   | `engagement:update` | Reorder sections                             |
| POST   | `/api/engagement/:id/sections/:sectionId/objectives`     | `engagement:update` | Add objective                                |
| POST   | `/api/engagement/:id/objectives/:objectiveId/procedures` | `engagement:update` | Add procedure                                |

---

## Actions (`src/server/actions/engagement.ts`)

| Function                                | Description                                     |
| --------------------------------------- | ----------------------------------------------- |
| `getAll(filters)`                       | List with filter/sort/pagination                |
| `getById(id)`                           | Get engagement with full work program tree      |
| `create(data)`                          | Create — handles manual/plan/duplicate/template |
| `duplicate(sourceId, data)`             | Clone engagement                                |
| `createFromTemplate(templateId, data)`  | Create from template                            |
| `update(id, data)`                      | Update engagement details                       |
| `advanceStatus(id)`                     | Move to next workflow stage                     |
| `reorderSections(id, order)`            | Save drag-drop order                            |
| `reorderObjectives(sectionId, order)`   | Save drag-drop order                            |
| `reorderProcedures(objectiveId, order)` | Save drag-drop order                            |
| `confirmFinding(draftFindingId)`        | Promote draft → confirmed finding               |

---

## Feature (`src/features/engagement/`)

| File                               | Purpose                                                       |
| ---------------------------------- | ------------------------------------------------------------- |
| `api.ts`                           | Fetch wrappers for engagement API routes                      |
| `hooks/useEngagements.ts`          | List query with filters                                       |
| `hooks/useEngagement.ts`           | Single engagement with work program                           |
| `hooks/useWorkProgram.ts`          | useReducer hook for work program state (drag-drop, reorder)   |
| `hooks/useEngagementMutations.ts`  | Create/update/delete mutations                                |
| `components/EngagementList.tsx`    | List page with filters                                        |
| `components/EngagementDetail.tsx`  | Detail with tabs                                              |
| `components/EngagementForm.tsx`    | Create/edit form (includes creation method selector)          |
| `components/WorkProgramEditor.tsx` | Drag-drop work program (Section→Objective→Procedure)          |
| `components/ProcedureCard.tsx`     | Individual procedure with status + `EvidenceAttachment` panel |
| `components/DraftFindingPanel.tsx` | Draft findings management                                     |
| `types.ts`                         | Engagement, Section, Objective, Procedure types               |

---

## Integrations

| Module     | Relationship                                                                       |
| ---------- | ---------------------------------------------------------------------------------- |
| `universe` | Links to auditable entity                                                          |
| `plan`     | Can be created from plan item                                                      |
| `finding`  | Confirmed draft findings go to Findings module                                     |
| `document` | Evidence via `DocumentAttachment` — upload new or reuse existing file at any level |
| `teams`    | Auditors assigned from Teams                                                       |

---

## Notes

- Work program reorder uses drag-drop; `order` field persists position
- `plan_item_id` is nullable (manual or template creation has no plan link)
- Draft findings require review before confirming to Findings module
- Duplicate copies work program structure but not evidence/notes
- Evidence uses `DocumentAttachment` — same file can be reused in a finding without re-uploading
- Use `EvidenceAttachment` component from `features/document` in ProcedureCard and DraftFindingPanel
