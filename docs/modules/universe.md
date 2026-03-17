# Audit Universe

> 🔲 **PLACEHOLDER** — This is a design document. Schema, routes, and components will be finalized during implementation.

> Registry of all auditable entities in the organization, providing risk overview and basis for audit planning.

---

## Schema (`prisma/schema.prisma`)

| Model             | Key Fields                                                                 | Notes                            |
| ----------------- | -------------------------------------------------------------------------- | -------------------------------- |
| `AuditableEntity` | `id`, `name`, `type`, `owner_unit`, `risk_rating`, `audit_cycle`, `status` | Core entity record               |
| `EntityTag`       | `id`, `entity_id`, `tag`                                                   | Tagging/categorization           |
| `AuditHistory`    | `id`, `entity_id`, `engagement_id`, `audited_at`                           | Manual or linked from engagement |

**Filterable fields:** `type`, `risk_rating`, `audit_cycle`, `status`, `owner_unit`
**Searchable fields:** `name`, `owner_unit`
**Sortable fields:** `name`, `risk_rating`, `last_audited_at`, `createdAt`

---

## API Routes (`src/app/api/universe/`)

| Method | Path                | Permission        | Description            |
| ------ | ------------------- | ----------------- | ---------------------- |
| GET    | `/api/universe`     | `universe:read`   | List with filters      |
| GET    | `/api/universe/:id` | `universe:read`   | Get by ID with history |
| POST   | `/api/universe`     | `universe:create` | Create entity          |
| PUT    | `/api/universe/:id` | `universe:update` | Update entity          |
| DELETE | `/api/universe/:id` | `universe:delete` | Delete entity          |

---

## Actions (`src/server/actions/universe.ts`)

| Function           | Description                               |
| ------------------ | ----------------------------------------- |
| `getAll(filters)`  | List entities with filter/sort/pagination |
| `getById(id)`      | Get entity with audit history             |
| `create(data)`     | Create auditable entity                   |
| `update(id, data)` | Update entity details                     |
| `delete(id)`       | Delete entity                             |

---

## Feature (`src/features/universe/`)

| File                          | Purpose                                 |
| ----------------------------- | --------------------------------------- |
| `api.ts`                      | Fetch wrappers for universe API routes  |
| `hooks/useEntities.ts`        | List query with filters                 |
| `hooks/useEntity.ts`          | Single entity query                     |
| `hooks/useEntityMutations.ts` | Create/update/delete mutations          |
| `components/EntityList.tsx`   | List page with filters and risk heatmap |
| `components/EntityDetail.tsx` | Detail view with audit history          |
| `components/EntityForm.tsx`   | Create/edit form                        |
| `components/RiskHeatmap.tsx`  | Risk visualization                      |
| `types.ts`                    | AuditableEntity, EntityFilters types    |

---

## Integrations

| Module       | Relationship                             |
| ------------ | ---------------------------------------- |
| `plan`       | Plan selects entities from Universe      |
| `engagement` | Engagement links to entity being audited |
| `finding`    | Findings reference related entities      |

---

## Notes

- `risk_rating` values defined in Settings module
- `audit_cycle` is the expected frequency (annual, bi-annual, etc.)
- Audit coverage calculated from engagement history
