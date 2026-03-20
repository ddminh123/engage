# Audit Plan — Detailed PRD

## Overview

The Audit Plan module manages periodic audit planning — selecting which auditable entities to audit, setting objectives and schedules, and tracking plan execution. It bridges the Audit Universe (what _can_ be audited) and Audit Engagement (what _is being_ audited).

Per IIA Standard 9.4, the Chief Audit Executive must develop a risk-based plan that determines the priorities of internal audit activity. This module provides the structured container for that plan.

**Design philosophy:** Practical planning tool. A plan is a time-bounded container holding planned audits. Each planned audit links to an entity from the Universe, has an objective, schedule, and status. Simple approval flow (draft → approved). Schedule visualization via Gantt chart.

---

## Data Model

### AuditPlan

The plan header — represents a planning period (e.g., "Kế hoạch kiểm toán năm 2026").

| #   | Field            | Type       | Required | Notes                                                    |
| --- | ---------------- | ---------- | -------- | -------------------------------------------------------- |
| 1   | **Title**        | `string`   | Yes      | e.g., "Kế hoạch kiểm toán năm 2026"                     |
| 2   | **Description**  | `text`     | No       | Scope, methodology, notes                                |
| 3   | **Period Type**  | `enum`     | Yes      | `annual` · `quarterly` · `monthly` · `custom`            |
| 4   | **Period Start** | `date`     | Yes      | Start of the planning period                             |
| 5   | **Period End**   | `date`     | Yes      | End of the planning period                               |
| 6   | **Status**       | `enum`     | Yes      | `draft` · `approved` · `in_progress` · `closed`          |
| 7   | **Created By**   | `string`   | Auto     | Placeholder — will link to User when Teams is built      |
| 8   | **Approved By**  | `string`   | No       | Placeholder — who approved the plan                      |
| 9   | **Approved At**  | `datetime` | No       | When the plan was approved                               |

**Status transitions:**
```
draft → approved → in_progress → closed
```

- `draft` — Plan is being built. Can add/remove/edit audits.
- `approved` — Plan is locked. Audits can be started (create engagements).
- `in_progress` — At least one audit has started.
- `closed` — Planning period is complete.

> Only `draft` plans can have structural changes (add/remove audits). Approved plans allow status changes on individual audits only.

### PlannedAudit

An individual audit within a plan — links an entity to a schedule and objective.

| #   | Field               | Type                    | Required | Notes                                                           |
| --- | ------------------- | ----------------------- | -------- | --------------------------------------------------------------- |
| 1   | **Plan**            | `ref → AuditPlan`       | Yes      | Parent plan                                                     |
| 2   | **Entity**          | `ref → AuditableEntity` | Yes      | Which entity to audit                                           |
| 3   | **Title**           | `string`                | No       | Override title (defaults to entity name if empty)               |
| 4   | **Objective**       | `text`                  | No       | What the audit aims to achieve                                  |
| 5   | **Scheduled Start** | `date`                  | Yes      | Planned start date                                              |
| 6   | **Scheduled End**   | `date`                  | Yes      | Planned end date                                                |
| 7   | **Status**          | `enum`                  | Yes      | `planned` · `in_progress` · `completed` · `deferred` · `cancelled` |
| 8   | **Priority**        | `enum`                  | No       | `high` · `medium` · `low`                                       |
| 9   | **Estimated Days**  | `int`                   | No       | Estimated effort in working days                                |
| 10  | **Notes**           | `text`                  | No       | Planning notes, rationale for inclusion                         |

**Status transitions:**
```
planned → in_progress → completed
planned → deferred
planned → cancelled
```

> Future: `engagement_id` will link to the created engagement when the Engagement module is implemented.

---

## Business Rules

| Rule     | Description                                                                    |
| -------- | ------------------------------------------------------------------------------ |
| **BR-1** | A plan must have at least a title, period type, and period dates               |
| **BR-2** | Period end must be after period start                                           |
| **BR-3** | Only `draft` plans can be edited (title, description, period)                  |
| **BR-4** | Only `draft` plans allow adding/removing planned audits                        |
| **BR-5** | An entity can appear in the same plan only once                                |
| **BR-6** | Planned audit scheduled dates should fall within the plan period (warning, not enforced) |
| **BR-7** | Deleting a plan deletes all its planned audits (cascade)                       |
| **BR-8** | All CUD operations logged to AuditLog                                          |
| **BR-9** | Planned audit status changes are allowed regardless of plan status             |

---

## Features & UI

### F1: Plan List

Main entry point — list of all audit plans.

**Table columns:** Title, Period Type, Period, Status, Audits Count, Progress, Updated

**Capabilities:**
- Filter by: Status, Period Type
- Search by: Title
- Sort by: Period Start, Status, Updated
- Create new plan

### F2: Plan Detail

View a single plan with its planned audits and schedule.

**Layout:**
- **Header** — Plan title, period, status badge, action buttons (Edit, Approve, etc.)
- **Audits Table** — List of planned audits with entity, schedule, status, priority
- **Schedule Chart** — Gantt-style horizontal bar chart showing audit timelines

### F3: Plan Form

Create/edit plan dialog.

**Fields:** Title, Description, Period Type, Period Start, Period End

### F4: Add Audit to Plan

Select entity from Universe and set schedule.

**Fields:** Entity (searchable picker from Universe), Objective, Scheduled Start, Scheduled End, Priority, Estimated Days, Notes

### F5: Schedule Chart

Horizontal timeline showing all planned audits within the plan period.

- X-axis: time (plan period)
- Y-axis: planned audits (entity names)
- Bars colored by status (planned=gray, in_progress=blue, completed=green, deferred=yellow, cancelled=red)
- Shows today marker

---

## Permissions

| Permission       | Description              |
| ---------------- | ------------------------ |
| `plan:read`      | View plans and audits    |
| `plan:create`    | Create new plan          |
| `plan:update`    | Edit plan and audits     |
| `plan:delete`    | Delete draft plan        |
| `plan:approve`   | Approve plan             |

---

## Integration Points

| Module         | Integration                                                   |
| -------------- | ------------------------------------------------------------- |
| **Universe**   | Entities are selected from Universe for planned audits        |
| **Engagement** | Future: approved planned audits create Engagements            |
| **Teams**      | Permission checks, audit log user tracking                    |

---

## Out of Scope (initial implementation)

- Plan versioning and change history
- Capacity planning / resource allocation
- Plan comparison (planned vs actual)
- Carryover of incomplete items
- Reserved capacity for emerging risks
- Approval workflow (submit → review → approve) — simplified to direct approve for now
- Engagement creation from planned audit — placeholder for future module
