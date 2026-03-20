# Engage Product Requirements Document

## Overview

Internal Audit Management system supporting the full audit lifecycle according to Institute of Internal Auditors (IIA) standards.

The system is built around the standard audit process: identifying auditable entities (Audit Universe), planning audits (Audit Plan), executing audits (Audit Engagement), and managing findings with remediation tracking (Findings & Remediation).

**Audit Engagement** is the central module where auditors execute work through structured work programs (Section → Objective → Procedure), collect evidence, document findings, and generate reports.

---

## Core Workflow

```
Audit Universe → Audit Plan → Audit Engagement → Findings & Remediation
```

---

## Core Modules

### 1. Audit Universe

Registry of all auditable entities in the organization, providing risk overview and basis for audit planning.

> **Detailed PRD:** [`docs/prd/universe.md`](prd/universe.md)

**Key capabilities:** Entity registry with configurable types/areas, lightweight org chart, inherent risk rating (Impact × Likelihood with history), audit coverage dashboard, risk heatmap.

**Integrations:** Plan, Engagement, Finding, Document, Settings

---

### 2. Audit Plan

Flexible audit planning supporting multiple time horizons with risk-based entity selection.

**Planning Periods:**

- Annual plan (default)
- Multi-year strategic plan
- Quarterly rolling plan
- Monthly operational plan
- Custom period

**Features:**

- Plan creation by period (annual, quarterly, monthly, custom)
- Plan versioning and change history
- Risk-based entity selection from Universe
- Planning dashboard with capacity view
- Audit priority scoring
- Reserved capacity for emerging risks
- Plan approval workflow (draft → review → approved)
- Plan progress tracking
- Carryover of incomplete items to next period
- Plan comparison (planned vs actual)

**Integrations:**

- Pulls entities from Audit Universe
- Creates Audit Engagements
- Updates audit coverage in Universe
- Rolls forward incomplete items

---

### 3. Audit Engagement

Manages the full audit lifecycle from planning through fieldwork, review, and report issuance.

**Creation Methods:**

- From Audit Plan (linked to planned entity)
- Manual creation
- Duplicate from existing engagement
- Create from template

**Features:**

- Engagement setup (scope, objectives, timeline)
- Assigned auditors (from Teams)
- Work program management

**Work Program Structure:**

```
Section → Objective → Procedure
```

- Sections, Objectives, Procedures have priority and drag-drop reordering
- Procedure contains testing steps
- Evidence/working papers attachable at any level
- Audit notes
- Draft findings (review before confirming)
- Audit report generation

**Workflow:**

```
Planning → Fieldwork → Review → Reporting → Closed
```

**Integrations:**

- Links entity from Audit Universe
- Draft findings confirmed → Findings module
- Evidence stored in Document Management

---

### 4. Findings & Remediation

Manages confirmed audit findings and tracks remediation by auditee.

**Features:**

- Findings registry
- Root cause analysis
- Risk severity rating
- Recommendation management
- Management action plans
- Due date tracking
- Remediation status
- Follow-up verification
- Overdue findings dashboard

**Integrations:**

- Receives confirmed findings from Audit Engagement
- Links to Auditable Entity
- Remediation evidence in Document Management

---

## Supporting Modules

### 5. Teams & Members

Manages auditors, roles, and audit teams. Provides permission checking API used by all modules.

**Features:**

- Auditor profiles
- Audit team composition
- Role-based access control (RBAC)
- Role definitions and permissions
- Permission matrix
- **Permission check API** — generic `checkAccess(userId, permission)` called by all routes
- **Audit logging** — all Create, Update, Delete operations logged (user, action, entity, timestamp, changes)

**Integrations:**

- All modules call `checkAccess()` for permission verification
- All modules call `logAudit()` for CUD operations
- Engagement assigns auditors from Teams

---

### 6. Document Management

Stores and manages audit documents, evidence, and working papers.

**Features:**

- File upload and storage
- Evidence attachment
- Version control
- Document categorization
- Secure access controls

**Integrations:**

- Working papers in Audit Engagement
- Evidence in Findings & Remediation

---

### 7. Settings & Configuration

System configuration and shared data management.

> **Detailed PRD:** [`docs/prd/settings.md`](prd/settings.md)

**Key capabilities:** Org chart (OrgUnit hierarchy), lookup tables (EntityType, AuditArea, AuditCycle, Tag, FindingSeverity, RiskScoreConfig), engagement templates with 3-level work program structure.

**Integrations:** Provides configuration data to all modules
