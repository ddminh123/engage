# Teams & Members

> 🔲 **PLACEHOLDER** — This is a design document. Schema, routes, and components will be finalized during implementation.

> Manages auditors, audit teams, roles, and access permissions across the system.

---

## Schema (`prisma/schema.prisma`)

| Model        | Key Fields                                                                                 | Notes                                       |
| ------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `User`       | `id`, `name`, `email`, `password_hash`, `status`                                           | Auditor account (NextAuth managed)          |
| `Team`       | `id`, `name`, `description`                                                                | Audit team grouping                         |
| `TeamMember` | `id`, `team_id`, `user_id`, `role`                                                         | User membership in team                     |
| `Role`       | `id`, `name`, `description`                                                                | System role definition                      |
| `UserRole`   | `id`, `user_id`, `role_id`                                                                 | User role assignment                        |
| `Permission` | `id`, `role_id`, `module`, `action`                                                        | Permission matrix (format: `module:action`) |
| `AuditLog`   | `id`, `user_id`, `user_name`, `action`, `entity_type`, `entity_id`, `changes`, `timestamp` | Append-only CUD log                         |

**Filterable fields:** `status`, `role`, `team_id`
**Searchable fields:** `name`, `email`
**Sortable fields:** `name`, `email`, `createdAt`

`user.status` enum: `active` | `inactive`
`team_member.role` enum: `lead` | `member`

---

## API Routes (`src/app/api/teams/`)

| Method | Path                               | Permission     | Description                |
| ------ | ---------------------------------- | -------------- | -------------------------- |
| GET    | `/api/teams`                       | `teams:read`   | List teams                 |
| GET    | `/api/teams/:id`                   | `teams:read`   | Get team with members      |
| POST   | `/api/teams`                       | `teams:create` | Create team                |
| PUT    | `/api/teams/:id`                   | `teams:update` | Update team                |
| DELETE | `/api/teams/:id`                   | `teams:delete` | Delete team                |
| POST   | `/api/teams/:id/members`           | `teams:update` | Add member to team         |
| DELETE | `/api/teams/:id/members/:userId`   | `teams:update` | Remove member              |
| GET    | `/api/teams/users`                 | `teams:read`   | List all users             |
| POST   | `/api/teams/users`                 | `teams:create` | Create user                |
| PUT    | `/api/teams/users/:id`             | `teams:update` | Update user                |
| GET    | `/api/teams/roles`                 | `teams:read`   | List roles and permissions |
| POST   | `/api/teams/roles`                 | `teams:manage` | Create role                |
| PUT    | `/api/teams/roles/:id/permissions` | `teams:manage` | Update permission matrix   |

---

## Actions (`src/server/actions/teams.ts`)

| Function                                 | Description                                       |
| ---------------------------------------- | ------------------------------------------------- |
| `getTeams(filters)`                      | List teams with members                           |
| `getTeamById(id)`                        | Get team detail                                   |
| `createTeam(data)`                       | Create team                                       |
| `addMember(teamId, userId, role)`        | Add user to team                                  |
| `removeMember(teamId, userId)`           | Remove from team                                  |
| `getUsers(filters)`                      | List users                                        |
| `createUser(data)`                       | Create auditor account                            |
| `updateUser(id, data)`                   | Update user                                       |
| `getRoles()`                             | Get all roles with permissions                    |
| `updatePermissions(roleId, permissions)` | Update permission matrix                          |
| `checkAccess(userId, permission)`        | Check if user has permission (used by all routes) |
| `logAudit(data)`                         | Log create/update/delete operation to AuditLog    |

---

## Feature (`src/features/teams/`)

| File                              | Purpose                                        |
| --------------------------------- | ---------------------------------------------- |
| `api.ts`                          | Fetch wrappers for teams API routes            |
| `hooks/useTeams.ts`               | Teams list query                               |
| `hooks/useUsers.ts`               | Users list for pickers (used by other modules) |
| `hooks/useRoles.ts`               | Roles and permissions query                    |
| `hooks/useTeamMutations.ts`       | Team create/update mutations                   |
| `components/TeamList.tsx`         | Teams list page                                |
| `components/TeamDetail.tsx`       | Team detail with member management             |
| `components/UserList.tsx`         | User management page                           |
| `components/UserForm.tsx`         | Create/edit user form                          |
| `components/PermissionMatrix.tsx` | Role permission management grid                |
| `types.ts`                        | User, Team, Role, Permission types             |

---

## Integrations

| Module        | Relationship                                           |
| ------------- | ------------------------------------------------------ |
| `engagement`  | Engagements assign auditors from Teams                 |
| `all modules` | All API routes check permissions via `checkPermission` |

---

## Notes

- Authentication is handled by NextAuth.js — `User` table aligns with NextAuth schema
- Permission format: `module:action` (e.g., `engagement:create`, `finding:approve`)

---

## Scaffolding (implement first)

Before other modules are built, create these scaffolding files. Uses **dev mock user** until NextAuth is integrated.

**Files to create:**

1. `prisma/schema.prisma` — Add `AuditLog` model
2. `src/server/actions/teams.ts` — `checkAccess()` + `logAudit()`
3. `src/server/middleware/withAccess.ts` — Route wrapper with mock user

---

### Dev Mock User

```typescript
// Used until NextAuth is integrated
export const DEV_USER = {
  id: "dev-user-001",
  name: "Dev User",
  email: "dev@localhost",
};
```

---

### Usage in any route

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

---

### Migration to NextAuth

When implementing full auth, replace `DEV_USER` with:

```typescript
import { getServerSession } from "next-auth";
const session = await getServerSession(authOptions);
```
