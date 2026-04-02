# Migration PRD: Methodology Versioning (Immutable JSON)

## 1. Context & Problem Statement
Currently, `i-engage` relies on global configuration tables (`ApprovalWorkflow`, `ApprovalTransition`, `PlanningStepConfig`) connected via foreign keys to operational data (like `PlanningWorkpaper`). 

**The Enterprise Risk (The "Caseware Nightmare"):**
If a Chief Audit Executive (CAE) decides to update the global methodology (e.g., changing a review process from 2 steps to 3 steps, or deleting a planning step):
1. Because of foreign keys, all **Running** and **Closed (Historical)** engagements instantly break, change states illegitimately, or get their data cascade-deleted.
2. This violates IIA standards which require audit evidence to be locked under the methodology that was approved at the start of that specific engagement (The Grandfather Rule).

## 2. The Solution: Immutable Methodology Versions
Instead of snapshotting a JSON blob onto *every single engagement row* (which duplicates 50KB of data thousands of times), we create a centralized, immutable `MethodologyVersion` table. 

Engagements just hold a foreign key to the `methodology_id` they were created under. When a CAE changes the rules, the system creates a *new* row in `MethodologyVersion` and sets it as active, leaving the old version completely untouched for historical audits.

---

## 3. Database Changes (`schema.prisma`)

### A. The `MethodologyVersion` Table
This table acts as a time-capsule for the Audit Manual at any given point in time.

```prisma
model MethodologyVersion {
  id              String       @id @default(cuid())
  name            String       // "Sổ tay Kiểm toán 2024", "Sổ tay 2025 (5-point risk)"
  version         Int          @default(1)
  is_active       Boolean      @default(false) // Only ONE can be active at a time
  config          Json         @db.Json // The massive JSON blob containing workflows, risk scales, steps
  created_at      DateTime     @default(now())
  created_by      String?

  engagements     Engagement[]

  @@map("methodology_version")
}
```

### B. The `Engagement` Model
Add the foreign key pointing to the specific methodology version.

```prisma
model Engagement {
  // ... existing fields
  
  methodology_id  String
  methodology     MethodologyVersion @relation(fields: [methodology_id], references: [id])
  
  // ... existing relations
}
```

### C. Severing the Dangerous Foreign Key (`PlanningWorkpaper`)
Currently, `PlanningWorkpaper` has a hard foreign key to `PlanningStepConfig`. If an admin deletes a global config, the workpaper is either deleted or throws an error.
**Action:** Remove the foreign key. Store the `step_key` instead, referencing the key stored inside `Engagement.methodology.config`.

```prisma
model PlanningWorkpaper {
  id               String   @id @default(cuid())
  engagement_id    String
  step_key         String   // Replaces step_config_id. e.g., "scope", "risk_assessment"
  // ...
  
  // REMOVE: step_config PlanningStepConfig @relation(...)
}
```

---

## 4. The JSON Payload Structure (`config`)
The JSON stored inside the `MethodologyVersion` should look like this:

```json
{
  "planning_steps": [
    { "key": "scope", "title": "Phạm vi", "sort_order": 1 },
    { "key": "objectives", "title": "Mục tiêu", "sort_order": 2 }
  ],
  "workflows": {
    "procedure": {
      "name": "Quy trình 2 bước",
      "transitions": [
        { "from": "not_started", "to": "in_progress", "action": "start" },
        { "from": "in_progress", "to": "waiting_review", "action": "submit" }
      ]
    }
  },
  "risk_matrix": {
    "scale": 4,
    "ratings": ["low", "medium", "high", "critical"]
  }
}
```

---

## 5. API & Action Impact

### A. Admin Updates to Methodology
*   **Current:** Admin updates a row in `ApprovalWorkflow` directly.
*   **New:** Admin clicks "Publish New Methodology". The system serializes the current state into JSON, creates `MethodologyVersion v2.0`, sets `is_active=true`, and sets `v1.0` to `is_active=false`.

### B. Engagement Creation (`actions/engagement.ts`)
*   **New:** Before creating the engagement, query `prisma.methodologyVersion.findFirst({ where: { is_active: true }})`. Use that ID for the new engagement.

### C. The State Machine & UI Rendering
*   **New:** When fetching an engagement, always `include: { methodology: true }`. The UI and API logic will read from `engagement.methodology.config` to render tabs, risk dropdowns, and validate workflow transitions.

## 6. Why this Architecture Wins
- **Zero Duplication:** MySQL isn't bloated with duplicate JSON strings on 10,000 engagement rows.
- **Visual Version Control:** The CAE gets an "Audit Manual Versions" screen where they can see the exact date the methodology changed from v1.0 to v2.0.
- **Bulletproof History:** A 2024 audit will always reference the 2024 methodology row. Changes in 2025 cannot mathematically break historical data.
- **Performance Boost:** Loading an engagement requires joining just one extra table (`MethodologyVersion`) instead of querying 5 separate global configuration tables for risks, steps, and workflows.