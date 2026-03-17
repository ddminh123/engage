# Findings & Remediation

> 🔲 **PLACEHOLDER** — This is a design document. Schema, routes, and components will be finalized during implementation.

> Manages confirmed audit findings and tracks remediation by auditee.

---

## Schema (`prisma/schema.prisma`)

| Model                 | Key Fields                                                                                     | Notes                |
| --------------------- | ---------------------------------------------------------------------------------------------- | -------------------- |
| `Finding`             | `id`, `engagement_id`, `entity_id`, `title`, `description`, `root_cause`, `severity`, `status` | Confirmed finding    |
| `Recommendation`      | `id`, `finding_id`, `description`, `due_date`, `status`                                        | Recommended action   |
| `ActionPlan`          | `id`, `finding_id`, `description`, `owner`, `due_date`, `status`                               | Management response  |
| `RemediationEvidence` | `id`, `finding_id`, `document_id`, `submitted_by`, `submitted_at`                              | Evidence for closure |

**Filterable fields:** `severity`, `status`, `entity_id`, `engagement_id`, `due_date`, `owner`
**Searchable fields:** `title`, `description`
**Sortable fields:** `severity`, `due_date`, `status`, `createdAt`

`severity` enum: `critical` | `high` | `medium` | `low` (values from Settings)
`status` enum: `open` | `in_progress` | `resolved` | `verified` | `overdue` | `closed`

---

## API Routes (`src/app/api/finding/`)

| Method | Path                           | Permission       | Description                                       |
| ------ | ------------------------------ | ---------------- | ------------------------------------------------- |
| GET    | `/api/finding`                 | `finding:read`   | List findings with filters                        |
| GET    | `/api/finding/:id`             | `finding:read`   | Get finding with recommendations and action plans |
| POST   | `/api/finding`                 | `finding:create` | Create (from confirmed draft only)                |
| PUT    | `/api/finding/:id`             | `finding:update` | Update finding                                    |
| DELETE | `/api/finding/:id`             | `finding:delete` | Delete                                            |
| POST   | `/api/finding/:id/action-plan` | `finding:update` | Add/update management action plan                 |
| POST   | `/api/finding/:id/verify`      | `finding:verify` | Mark remediation as verified                      |
| POST   | `/api/finding/:id/close`       | `finding:close`  | Close finding                                     |

---

## Actions (`src/server/actions/finding.ts`)

| Function                          | Description                                              |
| --------------------------------- | -------------------------------------------------------- |
| `getAll(filters)`                 | List with filter/sort/pagination (includes overdue calc) |
| `getById(id)`                     | Get finding with full detail                             |
| `createFromDraft(draftFindingId)` | Promote draft finding to confirmed                       |
| `update(id, data)`                | Update finding details                                   |
| `addActionPlan(findingId, data)`  | Add management action plan                               |
| `updateActionPlan(id, data)`      | Update action plan status                                |
| `verify(id, data)`                | Mark remediation verified                                |
| `close(id)`                       | Close finding                                            |

---

## Feature (`src/features/finding/`)

| File                              | Purpose                                             |
| --------------------------------- | --------------------------------------------------- |
| `api.ts`                          | Fetch wrappers for finding API routes               |
| `hooks/useFindings.ts`            | List query with filters                             |
| `hooks/useFinding.ts`             | Single finding with full detail                     |
| `hooks/useFindingMutations.ts`    | Update/verify/close mutations                       |
| `components/FindingList.tsx`      | List page with filters, overdue highlight           |
| `components/FindingDetail.tsx`    | Detail with recommendations, action plans, evidence |
| `components/ActionPlanForm.tsx`   | Management response form                            |
| `components/OverdueDashboard.tsx` | Overdue findings summary                            |
| `types.ts`                        | Finding, Recommendation, ActionPlan types           |

---

## Integrations

| Module       | Relationship                                       |
| ------------ | -------------------------------------------------- |
| `engagement` | Findings created from confirmed draft findings     |
| `universe`   | Findings linked to auditable entity                |
| `document`   | Remediation evidence stored in Document Management |

---

## Notes

- Findings can only be created by confirming a draft finding from an Engagement
- `overdue` status is computed (due_date < today and not closed)
- Severity levels are configured in Settings module
