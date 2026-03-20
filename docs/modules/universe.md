# Audit Universe

> � **IN PROGRESS** — Core entity CRUD and risk assessment implemented. Some features pending.

> Registry of all auditable entities in the organization, providing risk overview and basis for audit planning.

---

## Schema (`prisma/schema.prisma`)

| Model                        | Key Fields                                                                                                                                                                                                                                                  | Notes                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `AuditableEntity`            | `id`, `name`, `code`, `description`, `entity_type_id`, `audit_cycle`, `status`, `risk_score`, `risk_level`, `inherent_risk_score`, `inherent_risk_level`                                                                                                    | Core entity record; risk fields denormalized from latest RA |
| `EntityType`                 | `id`, `name`, `description`, `is_active`                                                                                                                                                                                                                    | Configurable entity types (Settings → Universe)             |
| `AuditArea`                  | `id`, `name`, `description`, `is_active`                                                                                                                                                                                                                    | Configurable audit areas (Settings → Universe)              |
| `AuditableEntityArea`        | `entity_id`, `area_id`                                                                                                                                                                                                                                      | M:N join table for entity ↔ areas                           |
| `RiskAssessment`             | `id`, `entity_id`, `inherent_impact`, `inherent_likelihood`, `inherent_score`, `inherent_level`, `control_effectiveness`, `residual_score`, `residual_level`, `risk_factors`, `assessment_source`, `note`, `evaluated_by`, `approved_by`, `evaluation_date` | Full risk assessment record                                 |
| `AuditableEntityOwner`       | `entity_id`, `unit_id`                                                                                                                                                                                                                                      | M:N join table for entity ↔ owner units                     |
| `AuditableEntityParticipant` | `entity_id`, `unit_id`                                                                                                                                                                                                                                      | M:N join table for entity ↔ participating units             |

**Filterable fields:** `entity_type_id`, `areas`, `risk_level`, `audit_cycle`, `status`, `owner_units`
**Searchable fields:** `name`, `code`, `description`
**Sortable fields:** `name`, `risk_score`, `last_audited_at`, `created_at`

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

- `EntityType` and `AuditArea` are configurable reference data managed in Settings → Universe
- An entity can have multiple audit areas (M:N relationship via `AuditableEntityArea`)
- `audit_cycle` is the expected frequency (annual, bi-annual, etc.)
- Risk fields on entity are denormalized from the latest `RiskAssessment` record
- Audit coverage calculated from engagement history
