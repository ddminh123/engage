# Teams & Members — Detailed PRD

## Overview

Manages auditors, audit teams, roles, and access permissions across the system. Provides the authentication layer (NextAuth.js), user profiles, team composition, and the permission-checking API consumed by all modules.

**Design philosophy:** Foundation-first. Simple credential-based auth with Entra ID SSO prepared. Flat team structure (1-level). Four fixed system roles with extensible RBAC. User profiles carry title, expertise, and supervisor for future approval workflows.

---

## Part I: Users

An auditor account in the system. Users authenticate, belong to teams, and carry roles that determine what they can access.

### User Fields

| #   | Field            | Type            | Required | Notes                                                        |
| --- | ---------------- | --------------- | -------- | ------------------------------------------------------------ |
| 1   | **Name**         | `string`        | Yes      | Full display name                                            |
| 2   | **Email**        | `string`        | Yes      | Unique login identifier, validated format                    |
| 3   | **Password**     | `string`        | Yes*     | Hashed with bcryptjs. *Not required for SSO users.           |
| 4   | **Phone**        | `string`        | No       | Contact phone number                                         |
| 5   | **Title**        | `string`        | No       | Job title (free text, e.g., "Senior Auditor"). Not tied to system role. Used in approval flow later. |
| 6   | **Role**         | `enum`          | Yes      | System role: `cae` · `admin` · `team_owner` · `member`      |
| 7   | **Supervisor**   | `ref → User`    | No       | Self-referencing. Default reviewer when requesting review.   |
| 8   | **Description**  | `text`          | No       | Personal note / self-description                             |
| 9   | **Expertise**    | `ref[] → Expertise` | No   | Multi-select from Expertise lookup table (Settings)          |
| 10  | **Avatar URL**   | `string`        | No       | Profile image URL (future file upload; initials-based for now) |
| 11  | **Status**       | `enum`          | Yes      | `active` · `locked` · `inactive`                             |
| 12  | **Provider**     | `enum`          | Yes      | `credentials` · `entra_id` (SSO-ready)                      |

**Filterable fields:** `status`, `role`, `team`
**Searchable fields:** `name`, `email`
**Sortable fields:** `name`, `email`, `createdAt`

### User Status Lifecycle

```
                  lock
  active ◄──────────────► locked
    │                        │
    │ deactivate             │ deactivate
    ▼                        ▼
  inactive               inactive
```

- **Active** — Can log in and perform actions per role
- **Locked** — Cannot log in. Account preserved. Can be unlocked by admin.
- **Inactive** — Soft-deleted. Hidden from pickers. Historical data preserved.

### Business Rules

| Rule     | Description                                                                               |
| -------- | ----------------------------------------------------------------------------------------- |
| **U-1**  | Email must be unique across all users                                                     |
| **U-2**  | Password is hashed with bcryptjs before storage — never stored in plain text              |
| **U-3**  | Locked users cannot authenticate but remain visible in historical data                    |
| **U-4**  | Inactive users are hidden from all pickers/dropdowns but preserved in existing records    |
| **U-5**  | Cannot deactivate the last CAE user                                                       |
| **U-6**  | Supervisor must be a different active user (no self-reference)                            |
| **U-7**  | SSO users (provider=entra_id) do not have a password_hash — login via Entra ID only      |
| **U-8**  | Title is independent of system role — used for business flow rules (prepare/review/approve)|

---

## Part II: Teams

A flat (1-level) grouping of auditors. Each team has one owner and multiple members.

### Team Fields

| #   | Field           | Type         | Required | Notes                              |
| --- | --------------- | ------------ | -------- | ---------------------------------- |
| 1   | **Name**        | `string`     | Yes      | Team display name                  |
| 2   | **Description** | `text`       | No       | Team purpose / scope               |
| 3   | **Owner**       | `ref → User` | Yes      | Team owner (exactly one)           |
| 4   | **Status**      | `enum`       | Yes      | `active` · `inactive`              |

### Team Member Fields

| #   | Field        | Type         | Required | Notes                      |
| --- | ------------ | ------------ | -------- | -------------------------- |
| 1   | **User**     | `ref → User` | Yes      | The team member            |
| 2   | **Role**     | `enum`       | Yes      | `owner` · `member`         |
| 3   | **Joined At**| `datetime`   | Auto     | When the member was added  |

### Member Operations

| Operation       | Description                                                                  |
| --------------- | ---------------------------------------------------------------------------- |
| **Add**         | Add an active user to a team                                                 |
| **Remove**      | Remove a member from team. Cannot remove the last owner.                     |
| **Move**        | Transfer a member from one team to another (atomic: remove + add)            |
| **Promote**     | Promote member → owner. Previous owner demoted to member automatically.      |
| **Demote**      | Demote owner → member. Team must still have at least one owner.              |

### Business Rules

| Rule     | Description                                                                  |
| -------- | ---------------------------------------------------------------------------- |
| **T-1**  | Team name must be unique                                                     |
| **T-2**  | A team must always have exactly one owner                                    |
| **T-3**  | A user can belong to multiple teams                                          |
| **T-4**  | Cannot delete a team that has members — must remove all members first        |
| **T-5**  | Inactive teams are preserved for historical data but hidden from new assignments |
| **T-6**  | Promoting a member to owner automatically demotes the current owner to member |

---

## Part III: Roles & Permissions

### System Roles (fixed)

| Role           | Code         | Access Level                                                  |
| -------------- | ------------ | ------------------------------------------------------------- |
| **CAE**        | `cae`        | Full system access (all modules, all actions). Not admin.     |
| **Admin**      | `admin`      | Settings management, user management. No audit data access.   |
| **Team Owner** | `team_owner` | Manage own team. Access audit data per team assignments.      |
| **Member**     | `member`     | Access audit data per team assignments. No team management.   |

> Roles are seeded as system roles (`is_system=true`). Custom roles can be added later (`is_system=false`).

### Permission Format

`module:action` — e.g., `engagement:create`, `finding:approve`, `teams:manage`

### Permission Check API

```typescript
checkAccess(userId: string, permission: string): Promise<boolean>
```

- CAE always returns `true`
- Others: query `UserRole` → `Role` → `Permission` table
- Initial implementation: permissive (returns `true`) until permission matrix is populated

---

## Part IV: Expertise (Settings Lookup)

Configurable reference data for auditor expertise areas. Follows the standard lookup pattern.

| Field           | Type      | Required | Notes                              |
| --------------- | --------- | -------- | ---------------------------------- |
| **Label**       | `string`  | Yes      | Display name (e.g., "IT Audit")    |
| **Code**        | `string`  | No       | Short code (unique if provided)    |
| **Description** | `text`    | No       | Help text                          |
| **Sort Order**  | `int`     | Yes      | Display order in dropdowns         |
| **Is Active**   | `boolean` | Yes      | Inactive items hidden from new selections |

---

## Part V: Authentication

### Credentials Provider (active)

- Email + password login
- Password hashed with bcryptjs
- Login blocked if user status is `locked` or `inactive`
- JWT session strategy
- Session contains: `user.id`, `user.name`, `user.email`, `user.role`, `user.title`

### Entra ID SSO (prepared, not activated)

- `AzureADProvider` configured but commented out
- Environment variables: `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`
- Callback URL: `/api/auth/callback/azure-ad`
- Account linking: if Entra ID email matches existing user, link to that account
- `User.provider` distinguishes `credentials` vs `entra_id`
- Login page includes disabled "Đăng nhập bằng Microsoft" button (enabled via env flag)

### Activation Steps (for later)

1. Register app in Azure Portal → get client ID, secret, tenant ID
2. Set env vars in `.env`
3. Uncomment `AzureADProvider` in `src/lib/auth.ts`
4. Set `NEXT_PUBLIC_ENABLE_SSO=true` to show SSO button on login page

---

## Part VI: UI Components

### User Management (Settings)

**User List** — DataTable with columns: Avatar, Name, Email, Title, Role, Status. Row actions: View, Edit, Lock/Unlock, Deactivate.

**User Form** (FormDialog, size `lg`) — Fields: Name, Email, Password (create only), Phone, Title, Role (select), Supervisor (UserSearch picker), Expertise (multi-select), Description (textarea), Status.

**User Detail** (DetailSheet) — Profile view with all fields, expertise tags, team memberships.

### Teams Page

**Team List** — DataTable with columns: Name, Owner (avatar + name), Member Count, Status.

**Team Form** (FormDialog) — Fields: Name, Description, Owner (UserSearch picker), Status.

**Team Detail** (DetailSheet) — Team info + member list with management actions (promote, demote, move, remove).

### Shared Components

| Component      | Usage                                                                   |
| -------------- | ----------------------------------------------------------------------- |
| **UserAvatar** | Initials-based avatar with deterministic color. Sizes: sm/md/lg.        |
| **UserBadge**  | Inline avatar + name. Used in document fields, table cells.             |
| **UserCard**   | Business-card popover (hover) + standalone card. Shows full profile.    |
| **UserSearch** | Combobox user picker. Used for team members, supervisor, assignments.   |

---

## Part VII: Permissions

| Permission     | Description                                       |
| -------------- | ------------------------------------------------- |
| `teams:read`   | View teams, users, roles                          |
| `teams:create` | Create teams, create users                        |
| `teams:update` | Update teams, manage members, update users        |
| `teams:delete` | Delete teams                                      |
| `teams:manage` | Manage roles and permissions (admin-level)        |

---

## Part VIII: Integration Points

| Module          | Relationship                                                    |
| --------------- | --------------------------------------------------------------- |
| **All modules** | `checkAccess()` called by every API route via `withAccess`      |
| **All modules** | `logAudit()` called on every CUD operation                      |
| **Engagement**  | Assigns auditors from teams (future)                            |
| **Engagement**  | Supervisor field used as default reviewer (future)              |
| **Settings**    | Expertise lookup managed in Settings reference data             |

---

## Seed Data

| Entity | Data                                                    |
| ------ | ------------------------------------------------------- |
| Users  | Admin (admin@engage.local / 123456), CAE (cae@engage.local / 123456) |
| Roles  | CAE, Admin, Team Owner, Team Member (all `is_system=true`) |

---

## Implementation Notes

- **Password security:** bcryptjs with default salt rounds (10). Never log or expose password hashes.
- **Audit logging:** All user CUD, team CUD, and member operations logged to `AuditLog`.
- **Soft delete only:** Users and teams use status toggle. No hard deletes.
- **Session caching:** User role/title cached in JWT. Refresh on user update via session callback.
