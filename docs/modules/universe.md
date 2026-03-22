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
| `RiskCatalogueItem`          | `id`, `name`, `code`, `description`, `risk_type`, `risk_domain`, `is_active`, `sort_order`                                                                                                                                                                  | Master risk library managed in Settings → Reference Data    |
| `EntityRisk`                 | `id`, `entity_id`, `catalogue_item_id`, `name`, `code`, `description`, `risk_type`, `risk_domain`, `is_primary`, `sort_order`                                                                                                                               | Per-entity risks; copied from catalogue or ad-hoc           |
| `AuditableEntityOwner`       | `entity_id`, `unit_id`                                                                                                                                                                                                                                      | M:N join table for entity ↔ owner units                     |
| `AuditableEntityParticipant` | `entity_id`, `unit_id`                                                                                                                                                                                                                                      | M:N join table for entity ↔ participating units             |

**Filterable fields:** `entity_type_id`, `areas`, `risk_level`, `audit_cycle`, `status`, `owner_units`
**Searchable fields:** `name`, `code`, `description`
**Sortable fields:** `name`, `risk_score`, `last_audited_at`, `created_at`

---

## API Routes (`src/app/api/universe/`)

| Method | Path                               | Permission        | Description                              |
| ------ | ---------------------------------- | ----------------- | ---------------------------------------- |
| GET    | `/api/universe`                    | `universe:read`   | List with filters                        |
| GET    | `/api/universe/:id`                | `universe:read`   | Get by ID with history                   |
| POST   | `/api/universe`                    | `universe:create` | Create entity                            |
| PUT    | `/api/universe/:id`                | `universe:update` | Update entity                            |
| DELETE | `/api/universe/:id`                | `universe:delete` | Delete entity                            |
| GET    | `/api/universe/:id/risks`          | `universe:read`   | List entity risks                        |
| POST   | `/api/universe/:id/risks`          | `universe:update` | Create entity risk / copy from catalogue |
| PATCH  | `/api/universe/:id/risks/:riskId`  | `universe:update` | Update entity risk                       |
| DELETE | `/api/universe/:id/risks/:riskId`  | `universe:update` | Delete entity risk                       |
| GET    | `/api/settings/risk-catalogue`     | `settings:read`   | List risk catalogue items                |
| POST   | `/api/settings/risk-catalogue`     | `settings:manage` | Create risk catalogue item               |
| PATCH  | `/api/settings/risk-catalogue/:id` | `settings:manage` | Update risk catalogue item               |
| DELETE | `/api/settings/risk-catalogue/:id` | `settings:manage` | Delete risk catalogue item               |

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

| File                               | Purpose                                                             |
| ---------------------------------- | ------------------------------------------------------------------- |
| `api.ts`                           | Fetch wrappers for universe API routes                              |
| `hooks/useEntities.ts`             | List query with filters                                             |
| `hooks/useEntity.ts`               | Single entity query                                                 |
| `hooks/useEntityMutations.ts`      | Create/update/delete mutations                                      |
| `components/EntityList.tsx`        | List page with filters and risk heatmap                             |
| `components/EntityDetail.tsx`      | Detail view with audit history                                      |
| `components/EntityForm.tsx`        | Create/edit form                                                    |
| `components/RiskHeatmap.tsx`       | Risk visualization                                                  |
| `types.ts`                         | AuditableEntity, EntityFilters, RiskCatalogueItem, EntityRisk types |
| `hooks/useRiskCatalogue.ts`        | CRUD hooks for risk catalogue items                                 |
| `hooks/useEntityRisks.ts`          | CRUD + copy hooks for entity risks                                  |
| `components/RiskCatalogueList.tsx` | Settings list for risk library                                      |
| `components/RiskCatalogueForm.tsx` | Create/edit form for catalogue items                                |
| `components/EntityRiskPanel.tsx`   | Entity risk panel with copy-from-catalogue                          |
| `components/EntityRiskForm.tsx`    | Create/edit form for entity risks                                   |

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
- `RiskCatalogueItem` is the central risk library (Settings → Reference Data), classified by `risk_type` and `risk_domain`
- `EntityRisk` records are per-entity; they can be copied from the catalogue (keeping a reference via `catalogue_item_id`) or created ad-hoc
- Entity risks marked `is_primary` appear highlighted as primary risks for that entity
- risk_type values: operational, technology, credit, compliance, market, liquidity, strategic, reputational
- risk_domain values: ESG, financial_reporting, regulatory, IT, operations, fraud, other
