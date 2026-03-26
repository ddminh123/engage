# Roles, Teams & Approval Workflow

> **Status:** 🚧 In Progress

---

## 1. Role System Overview

The application uses **two separate role concepts**:

| Concept | Scope | Purpose | Where stored |
|---|---|---|---|
| **System Role** (User Role) | Global, per user | Determines organisational position & approval authority | `user.role` column |
| **Engagement Role** | Per engagement, per user | Determines access & function within a specific engagement | `engagement_member.role` column |

These are **independent** — a user has exactly one system role, but can have different engagement roles across different engagements.

---

## 2. System Roles

Stored in `user.role`. Used by the approval engine to decide who can approve/reject.

| Value | Vietnamese Label | Fixed? | Description |
|---|---|---|---|
| `cae` | Trưởng KTNB | ✅ Fixed | Chief Audit Executive — full access, auto-added to all engagements |
| `admin` | Quản trị viên | ✅ Fixed | System admin — settings & user management |
| `audit_director` | Giám đốc kiểm toán | Configurable | Oversees audit engagements |
| `audit_manager` | Trưởng phòng kiểm toán | Configurable | Manages audit teams |
| `senior_auditor` | Kiểm toán viên chính | Configurable | Leads audit procedures |
| `auditor` | Kiểm toán viên | Configurable | Performs audit work (default for new users) |

**Source of truth:** `src/constants/labels/teams.ts` → `USER_ROLE_OPTIONS`

### System Role Rules
- `cae` and `admin` are fixed, cannot be removed
- `cae` always bypasses self-approval restrictions
- `cae` users are auto-added to every new engagement as `reviewer`
- Default role for new users: `auditor`
- Roles are validated via Zod enum in `src/server/actions/user.ts`

---

## 3. Engagement Roles

Stored in `engagement_member.role`. Used for **access control** and **task assignment** within an engagement.

| Value | Vietnamese Label | Description |
|---|---|---|
| `lead` | Trưởng nhóm | Engagement lead — manages the engagement team |
| `member` | Thành viên | Regular team member |
| `reviewer` | Soát xét | Reviewer within the engagement |
| `observer` | Quan sát | Read-only observer |

**Source of truth:** `src/components/shared/TeamAvatarManager.tsx` → `ENGAGEMENT_ROLE_OPTIONS`

### Engagement Team Rules
- When an engagement is created, the **creator** is auto-added as `lead`
- All active **CAE** users are auto-added as `reviewer`
- Members can be added/removed via the TeamAvatarManager popover
- Engagement roles are independent of system roles

---

## 4. Approval Workflow Engine

### How It Works

The approval engine is a **configurable state machine** per entity type (e.g., `procedure`).

1. Each entity type has an `ApprovalWorkflow` with ordered `ApprovalTransition` records
2. A transition defines: `from_status` → `to_status`, plus `allowedRoles` and `actionType`
3. When a user views an entity, the engine checks their **system role** (`user.role`) to determine available actions
4. The engine returns only transitions the user is permitted to execute

### Approval Statuses

| Value | Vietnamese | Description |
|---|---|---|
| `draft` | Bản nháp | Initial state |
| `waiting_review` | Chờ soát xét | Submitted for review |
| `needs_modification` | Cần chỉnh sửa | Returned for revision |
| `reviewed` | Đã soát xét | Review completed (intermediate for 3-step) |
| `waiting_approval` | Đợi phê duyệt | Submitted for final approval (3-step only) |
| `approved` | Đã phê duyệt | Final sign-off complete |

### 2-Step vs 3-Step Flows

**2-step** (standard procedures):
```
draft → waiting_review → reviewed (done)
                       → needs_modification → waiting_review (loop)
```

**3-step** (critical items like audit reports):
```
draft → waiting_review → reviewed → waiting_approval → approved (done)
                       → needs_modification (loop back)
                                    → needs_modification (loop back)
```

### Allowed Roles in Transitions

Transition `allowed_roles` reference **system roles** (user.role values):

- `*` — any authenticated user
- `cae` — CAE only
- `audit_director` — Audit Director
- `audit_manager` — Audit Manager
- `senior_auditor` — Senior Auditor
- `auditor` — Auditor

### Self-Approval Prevention

When `allow_self_approval = false` on a workflow:
- The user who published a version **cannot** approve it (for `action_type = "approve"`)
- Exception: CAE can always approve regardless

### Action Types

| Value | Behaviour |
|---|---|
| `submit` | Moves to next status, no special side-effects |
| `approve` | Stamps `approved_by`, `approved_at`, `approved_version` |
| `reject` | Moves back to `needs_modification` |
| `revise` | Moves back to `waiting_review` for re-review |

---

## 5. Key Files

| File | Purpose |
|---|---|
| `src/constants/labels/teams.ts` | System role labels & options |
| `src/server/actions/user.ts` | User CRUD with role validation |
| `src/server/actions/approvalEngine.ts` | Approval engine (transitions, execution) |
| `src/server/actions/approvalWorkflow.ts` | Workflow CRUD (settings) |
| `src/features/settings/components/ApprovalWorkflowList.tsx` | Settings UI for workflow config |
| `src/components/shared/TeamAvatarManager.tsx` | Engagement team management UI |
| `src/components/shared/MemberManager.tsx` | Alternative member manager |
| `prisma/schema.prisma` | `User.role`, `EngagementMember.role`, `ApprovalWorkflow`, `ApprovalTransition` |

---

## 6. Database Migration Notes

When migrating from the old role system:
- `team_owner` → map to `audit_manager` or `senior_auditor` as appropriate
- `member` → map to `auditor`
- Run `prisma db seed` to create new system Role records
- Existing `user.role` values need manual UPDATE query
