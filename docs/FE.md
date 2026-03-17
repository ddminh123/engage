# i-engage Frontend Guidelines

Interaction style: **Jira-like**

---

## 1. Principles

1. **Shadcn only** — Never create custom basic components (Button, Input, Dialog, etc.)
2. **Self-sustained** — Components fetch their own data via hooks
3. **Hooks for logic** — Extract business logic into hooks. Components only render.
4. **API via routes** — Fetch through `/api` routes only. Never import server code.
5. **Tailwind only** — No custom CSS. Use Shadcn conventions.

---

## 2. Folder Structure

```
src/
├── app/
│   ├── layout.tsx             # Root layout (providers, fonts)
│   ├── (auth)/
│   │   ├── layout.tsx         # Auth layout (centered, minimal)
│   │   └── login/page.tsx
│   └── (main)/
│       ├── layout.tsx         # Main layout (sidebar, header, nav)
│       └── [module]/          # universe, plan, engagement, etc.
│           ├── page.tsx       # List page
│           └── [id]/page.tsx  # Detail page
│
├── components/
│   ├── ui/                    # Shadcn (DO NOT MODIFY)
│   ├── shared/                # Complex reusable (DataTable, PageHeader)
│   └── layout/                # Layout components (Sidebar, Header, Nav)
│
├── features/[module]/         # Feature modules
│   ├── components/            # Feature-specific components
│   ├── hooks/                 # useEngagement, useEngagements
│   ├── api.ts                 # API calls to /api routes
│   └── types.ts
│
├── hooks/                     # Shared hooks
├── stores/                    # Zustand (minimal)
├── lib/                       # Utilities
└── types/                     # Shared types
```

---

## 3. Naming Conventions

| Type           | Convention          | Example               |
| -------------- | ------------------- | --------------------- |
| Components     | PascalCase          | `EngagementCard.tsx`  |
| Hooks          | `use` prefix        | `useEngagement.ts`    |
| Event handlers | `handle` + Action   | `handleSubmit`        |
| Boolean props  | `is` / `has` prefix | `isLoading`           |
| Types          | PascalCase          | `CreateEngagementDto` |

---

## 4. Component Patterns

| Pattern        | Rule                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| Self-sustained | Component calls its own hook for data. Parent doesn't pass data props. |
| Simple/small   | Small presentational components can receive props from parent.         |
| Complex state  | Use `useReducer` inside a custom hook. Component just renders.         |
| Composition    | Use children/slots, not prop drilling.                                 |

---

## 5. Shadcn Rules

- **Never modify** `components/ui/`
- **Never create** basic components — use Shadcn
- **Extend** by wrapping in `components/shared/`
- **Use variants** — leverage built-in Shadcn variants

| Need     | Component                      |
| -------- | ------------------------------ |
| Forms    | Form, Input, Select, Checkbox  |
| Dialogs  | Dialog, AlertDialog, Sheet     |
| Data     | Table, Card, Badge             |
| Nav      | Tabs, Breadcrumb, DropdownMenu |
| Feedback | Toast, Skeleton, Progress      |

### Standard DataTable (`components/shared/DataTable`)

All list/table views across the project use a single **DataTable** wrapper built on Shadcn Table + TanStack Table. Never build one-off table components.

**Built-in capabilities:**

- **Column definitions** — typed via TanStack `ColumnDef<T>[]`, passed per feature
- **Sorting** — click column headers, multi-sort support
- **Filtering** — per-column filters + global search input
- **Column selector** — toggle column visibility via dropdown
- **Pagination** — client-side or server-side, configurable page sizes
- **Row selection** — optional checkbox column for bulk actions
- **Empty state** — configurable empty message

**Usage pattern:**

```tsx
<DataTable
  columns={orgUnitColumns} // ColumnDef<OrgUnit>[]
  data={orgUnits} // OrgUnit[]
  searchKey="name" // field for global search
  filterableColumns={["status", "parentId"]} // columns with filter dropdowns
/>
```

**Files:**

- `src/components/shared/DataTable/DataTable.tsx` — main component
- `src/components/shared/DataTable/DataTablePagination.tsx` — pagination controls
- `src/components/shared/DataTable/DataTableColumnHeader.tsx` — sortable header
- `src/components/shared/DataTable/DataTableToolbar.tsx` — search + filters + column selector
- `src/components/shared/DataTable/DataTableFacetedFilter.tsx` — faceted filter dropdown
- `src/components/shared/DataTable/index.ts` — barrel export

> Each feature defines its own `columns.tsx` in `features/[module]/components/` — only column definitions, not table logic.

---

## 6. Data Fetching

| Layer     | Location                   | Purpose                                        |
| --------- | -------------------------- | ---------------------------------------------- |
| API       | `features/[module]/api.ts` | Fetch wrappers (getAll, getById, create, etc.) |
| Hooks     | `features/[module]/hooks/` | TanStack Query hooks wrapping API              |
| Mutations | Same hooks file            | `useMutation` with cache invalidation          |

**Pattern:** `useQuery` for reads, `useMutation` for writes. Always invalidate related queries on success.

---

## 7. State Management

| Type          | Solution              |
| ------------- | --------------------- |
| Server state  | TanStack Query        |
| Form state    | React Hook Form + Zod |
| Local UI      | useState              |
| Complex local | useReducer in hook    |
| Global UI     | Zustand (minimal)     |

---

## 8. Forms

- Use **React Hook Form** + **Zod** for validation
- Use **Shadcn Form** components
- Connect mutations to form submit

---

## 9. Page Layouts (Jira-like)

**List Page:**

- PageHeader with title + create button
- Standard DataTable (see §5 — shared component with sort, filter, column selector)
- Row actions via dropdown menu

**Detail Page:**

- Breadcrumb + title + status badge
- Tabs for sections
- Cards for content, inline editing

**Quick Edit:**

- Use Sheet (sidepanel) for edit/view without navigation

---

## 10. Quick Reference

| Concern       | Solution                      |
| ------------- | ----------------------------- |
| Components    | Shadcn only                   |
| Data fetching | TanStack Query                |
| Forms         | React Hook Form + Zod         |
| Styling       | Tailwind                      |
| Icons         | Lucide React                  |
| Complex state | useReducer in hook            |
| Global state  | Zustand (minimal)             |
| Tables        | Shadcn Table + TanStack Table |
| Toasts        | Shadcn Toast (sonner)         |
