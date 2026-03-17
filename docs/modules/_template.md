# [Module Name]

> One-line description of what this module does.

---

## Schema (`prisma/schema.prisma`)

| Model | Key Fields | Notes |
|-------|------------|-------|
| `ModelName` | `field1`, `field2` | Notes |

**Filterable fields:** `field1`, `field2`
**Searchable fields:** `field1`
**Sortable fields:** `field1`, `createdAt`

---

## API Routes (`src/app/api/[module]/`)

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/[module]` | `module:read` | List with filters |
| GET | `/api/[module]/:id` | `module:read` | Get by ID |
| POST | `/api/[module]` | `module:create` | Create |
| PUT | `/api/[module]/:id` | `module:update` | Update |
| DELETE | `/api/[module]/:id` | `module:delete` | Delete |

---

## Actions (`src/server/actions/[module].ts`)

| Function | Description |
|----------|-------------|
| `getAll(filters)` | List with filter/sort/pagination |
| `getById(id)` | Get single record |
| `create(data)` | Create with validation |
| `update(id, data)` | Update with validation |
| `delete(id)` | Soft/hard delete |

---

## Feature (`src/features/[module]/`)

| File | Purpose |
|------|---------|
| `api.ts` | Fetch wrappers for all API routes |
| `hooks/use[Module]s.ts` | List query hook |
| `hooks/use[Module].ts` | Single record query hook |
| `hooks/use[Module]Mutations.ts` | Create/update/delete mutations |
| `components/[Module]List.tsx` | List page component |
| `components/[Module]Detail.tsx` | Detail page component |
| `components/[Module]Form.tsx` | Create/edit form |
| `types.ts` | TypeScript types |

---

## Integrations

| Module | Relationship |
|--------|-------------|
| `other-module` | Description |

---

## Notes

- Any special business rules or constraints
