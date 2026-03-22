# Teams & Members

> � **IN PROGRESS** — Implementation started. Schema, routes, and components below reflect current implementation.

> Manages auditors, audit teams, roles, and access permissions across the system.

> **Detailed PRD:** [`docs/prd/teams.md`](../prd/teams.md)

---

## Schema (`prisma/schema.prisma`)

| Model           | Key Fields                                                                                                                                | Notes                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `User`          | `id`, `name`, `email`, `password_hash`, `phone?`, `title?`, `role`, `status`, `provider`, `supervisor_id?`, `description?`, `avatar_url?` | Auditor account (NextAuth managed, SSO-ready) |
| `Team`          | `id`, `name`, `description?`, `owner_id`, `status`                                                                                        | 1-level team, 1 owner                         |
| `TeamMember`    | `team_id`, `user_id`, `role`, `joined_at`                                                                                                 | User membership in team                       |
| `Role`          | `id`, `name`, `description`, `is_system`                                                                                                  | System role definition (4 seeded)             |
| `UserRole`      | `user_id`, `role_id`                                                                                                                      | User role assignment                          |
| `Permission`    | `id`, `role_id`, `module`, `action`                                                                                                       | Permission matrix (format: `module:action`)   |
| `Expertise`     | `id`, `label`, `code?`, `description?`, `sort_order`, `is_active`                                                                         | Settings lookup (auditor expertise areas)     |
| `UserExpertise` | `user_id`, `expertise_id`                                                                                                                 | User ↔ Expertise many-to-many                 |
| `AuditLog`      | `id`, `user_id`, `user_name`, `action`, `entity_type`, `entity_id`, `changes`, `timestamp`                                                | Append-only CUD log (already implemented)     |

**Enums:**

- `user.status`: `active` | `locked` | `inactive`
- `user.role`: `cae` | `admin` | `team_owner` | `member`
- `user.provider`: `credentials` | `entra_id`
- `team_member.role`: `owner` | `member`
- `team.status`: `active` | `inactive`

**Filterable fields:** `status`, `role`, `team_id`
**Searchable fields:** `name`, `email`
**Sortable fields:** `name`, `email`, `createdAt`

---

## API Routes

### Teams (`src/app/api/teams/`)

| Method | Path                             | Permission     | Description           |
| ------ | -------------------------------- | -------------- | --------------------- |
| GET    | `/api/teams`                     | `teams:read`   | List teams            |
| POST   | `/api/teams`                     | `teams:create` | Create team           |
| GET    | `/api/teams/:id`                 | `teams:read`   | Get team with members |
| PATCH  | `/api/teams/:id`                 | `teams:update` | Update team           |
| DELETE | `/api/teams/:id`                 | `teams:delete` | Delete team           |
| POST   | `/api/teams/:id/members`         | `teams:update` | Add member to team    |
| PATCH  | `/api/teams/:id/members/:userId` | `teams:update` | Update member role    |
| DELETE | `/api/teams/:id/members/:userId` | `teams:update` | Remove member         |

### Users (`src/app/api/settings/users/`)

| Method | Path                             | Permission     | Description     |
| ------ | -------------------------------- | -------------- | --------------- |
| GET    | `/api/settings/users`            | `teams:read`   | List all users  |
| POST   | `/api/settings/users`            | `teams:create` | Create user     |
| GET    | `/api/settings/users/:id`        | `teams:read`   | Get user detail |
| PATCH  | `/api/settings/users/:id`        | `teams:update` | Update user     |
| POST   | `/api/settings/users/:id/lock`   | `teams:manage` | Lock user       |
| POST   | `/api/settings/users/:id/unlock` | `teams:manage` | Unlock user     |

### Expertise (`src/app/api/settings/expertise/`)

| Method | Path                          | Permission        | Description          |
| ------ | ----------------------------- | ----------------- | -------------------- |
| GET    | `/api/settings/expertise`     | `settings:read`   | List expertise items |
| POST   | `/api/settings/expertise`     | `settings:manage` | Create expertise     |
| PATCH  | `/api/settings/expertise/:id` | `settings:manage` | Update expertise     |
| DELETE | `/api/settings/expertise/:id` | `settings:manage` | Delete expertise     |

---

## Actions

### User Actions (`src/server/actions/user.ts`)

| Function                          | Description                               |
| --------------------------------- | ----------------------------------------- |
| `getUsers(filters)`               | List users (search, role, status, team)   |
| `getUserById(id)`                 | Single user with expertises, roles, teams |
| `createUser(data)`                | Hash password, create user + assign role  |
| `updateUser(id, data)`            | Update profile (password optional)        |
| `lockUser(id)` / `unlockUser(id)` | Toggle status active ↔ locked             |
| `deactivateUser(id)`              | Soft-deactivate (status=inactive)         |

### Team Actions (`src/server/actions/teams.ts`)

| Function                               | Description                          |
| -------------------------------------- | ------------------------------------ |
| `getTeams(filters)`                    | List teams with members              |
| `getTeamById(id)`                      | Team + members detail                |
| `createTeam(data)`                     | Create team + set owner              |
| `updateTeam(id, data)`                 | Update team info                     |
| `deleteTeam(id)`                       | Delete team (must have no members)   |
| `addTeamMember(teamId, userId, role)`  | Add member to team                   |
| `removeTeamMember(teamId, userId)`     | Remove member from team              |
| `moveTeamMember(userId, fromId, toId)` | Move member between teams            |
| `promoteToOwner(teamId, userId)`       | Promote member → owner (demote prev) |
| `demoteToMember(teamId, userId)`       | Demote owner → member                |
| `checkAccess(userId, permission)`      | Check if user has permission         |
| `logAudit(data)`                       | Log CUD operation to AuditLog        |

### Expertise Actions (`src/server/actions/expertise.ts`)

Standard lookup CRUD (same pattern as `entity-types.ts`).

---

## Feature (`src/features/teams/`)

| File                            | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `types.ts`                      | User, Team, Role, Expertise types                 |
| `api.ts`                        | Fetch wrappers for all API routes                 |
| `hooks/useUsers.ts`             | Users list query + mutations                      |
| `hooks/useTeams.ts`             | Teams list query + mutations                      |
| `hooks/useExpertise.ts`         | Expertise lookup query                            |
| `components/UserColumns.tsx`    | Column definitions for user DataTable             |
| `components/UserList.tsx`       | DataTable of users                                |
| `components/UserForm.tsx`       | FormDialog: create/edit user (RHF + Zod)          |
| `components/UserDetail.tsx`     | DetailSheet: user profile view                    |
| `components/TeamColumns.tsx`    | Column definitions for team DataTable             |
| `components/TeamList.tsx`       | DataTable of teams                                |
| `components/TeamForm.tsx`       | FormDialog: create/edit team                      |
| `components/TeamDetail.tsx`     | Detail view with member list + management actions |
| `components/TeamMemberList.tsx` | Member list within team detail                    |

---

## Shared Components (`src/components/shared/`)

| Component        | Purpose                                                              |
| ---------------- | -------------------------------------------------------------------- |
| `UserAvatar.tsx` | Jira-like avatar (initials + deterministic color). Sizes: sm/md/lg.  |
| `UserBadge.tsx`  | Inline avatar + name badge. Click opens UserCard popover.            |
| `UserCard.tsx`   | Business-card component. Popover (hover) + standalone (embeddable).  |
| `UserSearch.tsx` | Combobox user search for pickers (team members, supervisor, assign). |

---

## Authentication (`src/lib/auth.ts`)

- **Library:** NextAuth.js v4
- **Active provider:** CredentialsProvider (email + bcryptjs password hash)
- **Prepared provider:** AzureADProvider (Entra ID — commented out, env vars documented)
- **Session strategy:** JWT
- **Session fields:** `user.id`, `user.name`, `user.email`, `user.role`, `user.title`
- **Login page:** `src/app/(auth)/login/page.tsx`
- **Middleware:** `src/middleware.ts` — redirects unauthenticated users to `/login`

### Entra ID SSO (prepared, not activated)

- `AzureADProvider` in auth config — commented out with enable instructions
- `.env.example` includes: `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`
- Callback URL: `/api/auth/callback/azure-ad`
- Account linking: Entra ID email → existing User match
- `User.provider` field: `credentials` | `entra_id`

---

## Integrations

| Module        | Relationship                                                 |
| ------------- | ------------------------------------------------------------ |
| `all modules` | All API routes check permissions via `withAccess` middleware |
| `all modules` | All CUD operations logged via `logAudit()`                   |
| `engagement`  | Assigns auditors from Teams (future)                         |
| `engagement`  | Supervisor field = default reviewer (future)                 |
| `settings`    | Expertise lookup managed in Settings reference data          |

---

## Seed Data (`prisma/seed.ts`)

| Entity | Data                                                                 |
| ------ | -------------------------------------------------------------------- |
| Users  | Admin (admin@engage.local / 123456), CAE (cae@engage.local / 123456) |
| Roles  | CAE, Admin, Team Owner, Team Member (all `is_system=true`)           |

---

## Usage in any route

```typescript
import { withAccess } from "@/server/middleware/withAccess";
import { logAudit } from "@/server/actions/teams";

export const POST = withAccess("universe:create", async (req, ctx, session) => {
  const data = await req.json();
  const entity = await createEntity(data);

  await logAudit({
    userId: session.user.id,
    userName: session.user.name,
    action: "create",
    entityType: "auditable_entity",
    entityId: entity.id,
  });

  return Response.json({ data: entity });
});
```
