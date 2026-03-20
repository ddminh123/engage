# Audit Universe — Detailed PRD

## Overview

The Audit Universe is the master registry of all auditable entities in the organization. It provides a structured, risk-assessed view of what can be audited, serving as the foundation for audit planning.

Per IIA Global Internal Audit Standards 2024 (Standard 9.4), the internal audit plan must be based on a documented assessment of the organization's strategies, objectives, and risks — performed at least annually. The Audit Universe is where this assessment lives.

**Design philosophy:** Lightweight and practical. Simple risk scoring, minimal mandatory fields, configurable reference data. This is not an ERM system — it's an auditor's working registry.

---

## Part I: Auditable Entity

An auditable entity is any unit, process, system, or activity that could be the subject of an audit engagement.

### Fields

| #   | Field                   | Type                | Required | Notes                                                                                                                                                                                                                                                           |
| --- | ----------------------- | ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Name**                | `string`            | Yes      | Short identifying name (e.g., "Procurement Process", "Core Banking System")                                                                                                                                                                                     |
| 2   | **Code**                | `string`            | No       | Optional short code for reference (e.g., "PROC-001")                                                                                                                                                                                                            |
| 3   | **Description**         | `text`              | No       | Scope, boundaries, key activities                                                                                                                                                                                                                               |
| 4   | **Type**                | `ref → EntityType`  | Yes      | Configurable in Settings. Default values: `Process`, `System`, `Business Unit`, `Product`, `Project`, `Function`, `Third Party`                                                                                                                                 |
| 5   | **Areas**               | `ref[] → AuditArea` | Yes      | IIA audit subject categories. **Multi-select** — an entity can belong to multiple areas. Default values: `Financial`, `Operational`, `IT / Technology`, `Compliance / Regulatory`, `Strategic`, `Governance`, `Legal`, `HR / People`. Configurable in Settings. |
| 6   | **Owner Unit**          | `ref → OrgUnit`     | Yes      | Primary unit responsible for this entity                                                                                                                                                                                                                        |
| 7   | **Participating Units** | `ref[] → OrgUnit`   | No       | Other units involved (e.g., IT participates in ERP owned by Accounting)                                                                                                                                                                                         |
| 8   | **Status**              | `enum`              | Yes      | `active` · `inactive` · `archived`                                                                                                                                                                                                                              |
| 9   | **Audit Cycle**         | `ref → AuditCycle`  | No       | Recommended audit frequency. Configurable values: `Annual`, `Biennial`, `Triennial`, `Ad-hoc`, `Continuous`.                                                                                                                                                    |
| 10  | **Tags**                | `ref[] → Tag`       | No       | Centrally managed in Settings. Reusable across entities for consistent categorization.                                                                                                                                                                          |
| 11  | **Attachments**         | `ref[] → Document`  | No       | Via Document module (DocumentAttachment pattern)                                                                                                                                                                                                                |

> **All fields are searchable and filterable.** List views support search by text fields (Name, Code, Description) and filter by reference/enum fields (Type, Area, Owner Unit, Participating Units, Status, Audit Cycle, Tags, Risk Level).

### Key Contacts

Person-level contacts for each entity. Stored directly on the entity (not via Teams module — these are auditee-side contacts).

| Field             | Type     | Required | Notes                                              |
| ----------------- | -------- | -------- | -------------------------------------------------- |
| **Audit Sponsor** | `string` | No       | Senior management contact (name, role, email)      |
| **Process Owner** | `string` | No       | Day-to-day operational contact (name, role, email) |

> Keeps it simple: free-text fields, not linked to a user directory. Auditors just need to know who to call.

### Control Environment

Quick qualitative indicator of how well-controlled this entity is. Not a full control assessment — just a planning-level flag.

| Field       | Type         | Required | Notes                          |
| ----------- | ------------ | -------- | ------------------------------ |
| Level       | `enum`       | No       | `Weak` · `Adequate` · `Strong` |
| Comment     | `text`       | No       | One-line rationale             |
| Assessed by | `ref → User` | Auto     | Current user                   |
| Assessed at | `datetime`   | Auto     | Timestamp                      |

> Combined with inherent risk, gives a lightweight residual risk picture without formal calculation. History is maintained (same pattern as risk rating).

### Related Entities

Simple bidirectional links between entities to capture dependencies and scope boundaries.

| Field          | Type                    | Required | Notes                                                                    |
| -------------- | ----------------------- | -------- | ------------------------------------------------------------------------ |
| Related entity | `ref → AuditableEntity` | Yes      | The linked entity                                                        |
| Relationship   | `string`                | No       | Optional label (e.g., "depends on", "subprocess of", "shares data with") |

> Bidirectional: if A links to B, B shows A. Helps auditors understand scope: "if we audit Procurement, should we also look at AP?"

### Notes Log

Chronological journal of observations, planning notes, and institutional knowledge.

| Field      | Type         | Required | Notes        |
| ---------- | ------------ | -------- | ------------ |
| Content    | `text`       | Yes      | The note     |
| Author     | `ref → User` | Auto     | Current user |
| Created at | `datetime`   | Auto     | Timestamp    |

**Rules:**

- Append-only — notes cannot be edited or deleted after creation
- Displayed newest-first
- Useful for: pre-audit observations, planning context, management intel, handover notes

### Risk Assessment

Each entity carries a risk assessment that drives audit planning priority. The approach follows IIA's risk-based methodology: assess **inherent risk**, evaluate **control effectiveness**, derive **residual risk**.

#### Score & Level Mapping

**Rating method:** Impact × Likelihood = Score

| Factor         | Scale | Values                                                               |
| -------------- | ----- | -------------------------------------------------------------------- |
| **Impact**     | 1–5   | 1 = Negligible, 2 = Low, 3 = Moderate, 4 = High, 5 = Critical        |
| **Likelihood** | 1–5   | 1 = Rare, 2 = Unlikely, 3 = Possible, 4 = Likely, 5 = Almost Certain |
| **Score**      | 1–25  | Computed: Impact × Likelihood                                        |

| Score Range | Level    | Color  |
| ----------- | -------- | ------ |
| 1–4         | Low      | Green  |
| 5–9         | Medium   | Yellow |
| 10–15       | High     | Orange |
| 16–25       | Critical | Red    |

> Score ranges and level labels are configurable in Settings.

#### Section 1 — Rủi ro tiềm tàng (Inherent Risk)

| Field                 | Type        | Required | Notes                                     |
| --------------------- | ----------- | -------- | ----------------------------------------- |
| `inherent_impact`     | `int (1-5)` | Yes      | Business impact if risk materializes      |
| `inherent_likelihood` | `int (1-5)` | Yes      | Probability of occurrence before controls |
| `inherent_score`      | `int`       | Computed | `inherent_impact × inherent_likelihood`   |
| `inherent_level`      | `enum`      | Computed | Derived from `inherent_score` range       |

#### Section 2 — Hiệu quả kiểm soát (Control Effectiveness)

| Field                   | Type   | Required | Notes                                                        |
| ----------------------- | ------ | -------- | ------------------------------------------------------------ |
| `control_effectiveness` | `enum` | No       | `Strong` · `Medium` · `Weak` — qualitative control indicator |

#### Section 3 — Rủi ro còn lại (Residual Risk)

| Field            | Type   | Required | Notes                                                                           |
| ---------------- | ------ | -------- | ------------------------------------------------------------------------------- |
| `residual_score` | `int`  | No       | Auto-calculated from inherent score + control effectiveness. User can override. |
| `residual_level` | `enum` | Computed | Derived from `residual_score` range                                             |

**Auto-calculation rules for `residual_score`:**

| Control Effectiveness | Multiplier | Example (inherent = 20) |
| --------------------- | ---------- | ----------------------- |
| Strong                | × 0.4      | 8 (Medium)              |
| Medium                | × 0.7      | 14 (High)               |
| Weak / None           | × 1.0      | 20 (Critical)           |

> `residual_score` is editable — auditor can override the auto-calculation. `residual_level` is always derived from the final `residual_score`.

#### Assessment Context

| Field               | Type       | Required | Notes                                                                                           |
| ------------------- | ---------- | -------- | ----------------------------------------------------------------------------------------------- |
| `risk_factors`      | `string[]` | No       | Multi-select tags: `high_volume` · `complexity` · `regulatory` · `fraud_risk` · `recent_change` |
| `assessment_source` | `enum`     | No       | `previous_audit` · `management_input` · `incident` · `analytics` · `regulatory`                 |
| `note`              | `text`     | No       | Optional free-text justification (replaces mandatory rationale)                                 |

#### Metadata (Placeholders)

| Field             | Type       | Required | Notes                                                            |
| ----------------- | ---------- | -------- | ---------------------------------------------------------------- |
| `evaluated_by`    | `string`   | No       | Placeholder — will link to User when Teams module is implemented |
| `approved_by`     | `string`   | No       | Placeholder — for future sitewide approval workflow              |
| `evaluation_date` | `datetime` | No       | Date of assessment; defaults to now but user-editable            |

**Risk assessment history:** Every assessment creates a new record. Previous assessments are preserved as history. The current assessment is the most recent.

**Denormalized on `AuditableEntity`:**

- `risk_score` / `risk_level` — effective (residual) risk for the entity
- `inherent_risk_score` / `inherent_risk_level` — inherent risk before controls

> **IIA alignment (Standard 9.4):** Captures inherent risk, control quality, and residual risk — sufficient for audit committee reporting. Approval is a placeholder for future workflow.

### Audit History

Audit history tracks which engagements have been conducted on this entity. This is **read-only** — populated automatically when an engagement is linked to the entity.

| Field             | Source                             | Notes                                  |
| ----------------- | ---------------------------------- | -------------------------------------- |
| Engagement title  | `Engagement.title`                 | Link to engagement                     |
| Period            | `Engagement.start_date – end_date` | When the audit was conducted           |
| Status            | `Engagement.status`                | Current engagement status              |
| Lead auditor      | `EngagementMember` (role = lead)   | Who led the audit                      |
| Rating/conclusion | `Engagement`                       | Overall engagement conclusion (if any) |
| Last audited      | Computed                           | Most recent completed engagement date  |

> This data comes from the Engagement module. No separate storage needed — query on `Engagement.entity_id`.

### Finding History

Findings linked to this entity, from the Finding module. **Read-only** — allows quick visibility into typical findings and their resolution status.

| Field         | Source                                       | Notes                                      |
| ------------- | -------------------------------------------- | ------------------------------------------ |
| Finding title | `Finding.title`                              | Link to finding detail                     |
| Severity      | `Finding.severity`                           | High / Medium / Low                        |
| Status        | `Finding.status`                             | Open · In Remediation · Closed             |
| Engagement    | `Finding.engagement_id` → `Engagement.title` | Which audit produced this finding          |
| Reported date | `Finding.created_at`                         | When the finding was raised                |
| Closed date   | `Finding.closed_at`                          | When remediation was completed (if closed) |

**Summary widgets on entity detail:**

- Open findings count (by severity)
- Closed findings count
- Recurring findings (same category across multiple engagements)

> Query on `Finding.entity_id`. No separate storage needed.

---

## Org Chart

Org chart (OrgUnit) is **managed in the Settings module** as shared reference data. It is used by Universe for entity ownership, by Engagement for team context, and by Finding for responsible units.

See `docs/prd/settings.md` for OrgUnit fields and management UI.

In the Universe module, org chart appears as:

- A **filter** in the entity registry (filter by Owner Unit / Participating Unit)
- An **Org Chart Browser** (F6) for navigating entities by organizational structure

---

## Features & UI

### F1: Entity Registry (List View)

Main working view for the audit universe.

**Table columns:** Name, Type, Area, Owner Unit, Risk Level, Last Audited, Audit Cycle, Status

**Capabilities:**

- Filter by: Type, Area, Owner Unit, Risk Level, Status, Tags, Audit Cycle
- Search by: Name, Description, Code
- Sort by: Name, Risk Score, Last Audited, Created
- Bulk actions: Update status, Assign audit cycle
- Export to CSV/Excel

### F2: Entity Detail View

Single entity view with full information.

**Tabs/sections:**

- **Overview** — All entity fields, key contacts, current risk rating with level badge, control environment
- **Risk History** — Timeline of all risk assessments with rationale, assessor, score changes
- **Audit History** — List of linked engagements with status and dates
- **Findings** — Open/closed findings with severity, status, summary widgets
- **Related Entities** — Linked entities with relationship labels
- **Notes** — Chronological note log (append-only)
- **Attachments** — Documents via DocumentAttachment component

### F3: Risk Assessment

Inline or dialog-based risk rating entry.

- Select Impact (1–5) and Likelihood (1–5) → auto-compute Score and Level
- Require Rationale (text field)
- Optional: mark as "Approved" by another user
- On save: previous rating becomes history, new rating becomes current

### F4: Risk Heatmap

Visual 5×5 matrix showing entity distribution by Impact vs Likelihood.

- Each cell shows count of entities
- Click cell → filtered list of entities in that risk zone
- Color-coded by risk level (green → red)
- Useful for audit committee presentations

### F5: Audit Coverage Dashboard

Overview of audit coverage across the universe.

**Widgets:**

- **Coverage rate** — % of entities audited within their defined audit cycle
- **Overdue audits** — Entities past their audit cycle with no recent engagement
- **Risk distribution** — Pie/bar chart of entities by risk level
- **Recently assessed** — Entities with recent risk rating changes
- **Unrated entities** — Entities with no risk assessment

### F6: Org Chart Browser

Tree view of organizational units (data from Settings).

- Expandable/collapsible hierarchy
- Click unit → shows linked entities in a side panel
- Risk summary badge per unit (highest risk among owned entities)
- Used as a navigation/filter tool, not a standalone management page

### F7: Import / Export (Shared Service)

Import and export is a **generalized shared service** usable by any module, not specific to Universe.

**Import:**

- Upload CSV/Excel file
- Map columns to entity fields (auto-detect common headers)
- Preview → validate → confirm
- Report: created count, skipped count, errors

**Export:**

- Export current filtered list to CSV/Excel
- Includes all visible columns + risk rating

**Shared service design (`src/server/services/importExport.ts`):**

- Generic `importRecords(config)` and `exportRecords(config)` functions
- Config defines: target model, field mapping, validation rules (Zod schema)
- Universe is the first consumer; other modules reuse the same service
- See `docs/Overview.md` for service layer conventions

> This belongs in the **Service** layer (not Actions) because it's a reusable utility, not business logic tied to a single module.

---

## Business Rules

| Rule      | Description                                                                            |
| --------- | -------------------------------------------------------------------------------------- |
| **BR-1**  | An entity must have at least one owner unit                                            |
| **BR-2**  | Risk rating requires both Impact, Likelihood, and Rationale                            |
| **BR-3**  | Deleting an entity with linked engagements: soft-delete only (set status = `archived`) |
| **BR-4**  | Entity Type, Area, and Audit Cycle values are managed in Settings (configurable)       |
| **BR-5**  | Risk score ranges and level labels are configurable in Settings                        |
| **BR-6**  | Audit history is read-only — populated from Engagement module                          |
| **BR-7**  | Org chart changes do not affect historical entity ownership records                    |
| **BR-8**  | All CUD operations logged to AuditLog                                                  |
| **BR-9**  | Notes are append-only — cannot be edited or deleted after creation                     |
| **BR-10** | Related entity links are bidirectional — creating A→B also shows B→A                   |
| **BR-11** | Control environment history is maintained (same pattern as risk rating)                |
| **BR-12** | Import validates all required fields before creating records                           |

---

## Permissions

| Permission                    | Description                                |
| ----------------------------- | ------------------------------------------ |
| `universe:read`               | View entities, risk ratings, audit history |
| `universe:create`             | Create new entity                          |
| `universe:update`             | Edit entity details                        |
| `universe:delete`             | Archive/delete entity                      |
| `universe:assess`             | Create/update risk ratings                 |
| `universe:approve_assessment` | Approve risk ratings (optional)            |
| `universe:import`             | Import entities from CSV/Excel             |
| `universe:export`             | Export entities to CSV/Excel               |

---

## Integration Points

| Module         | Integration                                                                  |
| -------------- | ---------------------------------------------------------------------------- |
| **Settings**   | Provides: EntityType, AuditArea, AuditCycle, OrgUnit, Tag, RiskScoreConfig   |
| **Engagement** | Engagement links to entity via `entity_id`. Audit history derived from this. |
| **Plan**       | Plan items reference entities from Universe                                  |
| **Finding**    | Findings can link to auditable entity                                        |
| **Document**   | Attachments via DocumentAttachment (ref_type: `auditable_entity`)            |
| **Teams**      | Permission checks, audit log user tracking                                   |

---

## Out of Scope (for this module)

- Full HR / people management
- Detailed control assessments (belongs in Engagement)
- Risk treatment / mitigation tracking (belongs in ERM, not IA)
- Formal residual risk calculation (control environment indicator is qualitative only)
- Complex risk models (COSO, ISO 31000 frameworks — can be added later)
- Org chart management UI (belongs in Settings)

---

## IIA Standards Alignment

| Standard                                           | How This Module Supports It                              |
| -------------------------------------------------- | -------------------------------------------------------- |
| **9.4** — Plan based on documented risk assessment | Risk ratings with rationale, history, and assessor       |
| **9.5** — Coordinate assurance providers           | Audit history shows coverage, helps identify gaps        |
| **14.3** — Findings prioritized by significance    | Risk levels feed into finding severity context           |
| **Domain IV** — Managing the IA function           | Universe provides the master list for strategic planning |
