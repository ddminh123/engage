# Engage Frontend Guidelines

Interaction style: **Jira-like**

---

## 1. Principles

1. **Shadcn only** — Never create custom basic components (Button, Input, Dialog, etc.)
2. **Shared components first** — Before creating any new component, **check `src/components/shared/`** for an existing solution. If one exists, use it. If you need to extend it, extend it — never duplicate.
3. **Self-sustained** — Components fetch their own data via hooks
4. **Hooks for logic** — Extract business logic into hooks. Components only render.
5. **API via routes** — Fetch through `/api` routes only. Never import server code.
6. **Tailwind only** — No custom CSS. Use Shadcn conventions.

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
├── constants/                 # App-wide constants
│   ├── index.ts               # Barrel export
│   ├── navigation.ts          # Nav items
│   └── routes.ts              # API & page routes
│
├── hooks/                     # Shared hooks
├── stores/                    # Zustand (minimal)
├── lib/                       # Utilities
└── types/                     # Shared types
```

---

## 3. Naming Conventions

### 3.1 File Names

| File Type             | Convention | Example                  |
| --------------------- | ---------- | ------------------------ |
| React components      | PascalCase | `OrgUnitList.tsx`        |
| Column definitions    | PascalCase | `OrgUnitColumns.tsx`     |
| Hooks                 | camelCase  | `useOrgUnits.ts`         |
| API client            | camelCase  | `api.ts`                 |
| Types                 | camelCase  | `types.ts`               |
| Utility / lib files   | camelCase  | `prisma.ts`, `utils.ts`  |
| Constants             | camelCase  | `routes.ts`              |
| Next.js special files | camelCase  | `page.tsx`, `layout.tsx` |

> **Rule: All `.tsx` files that export a React component use PascalCase. All other `.ts` files use camelCase. Never use kebab-case for source files.**

### 3.2 Identifiers

| Type               | Convention          | Example               |
| ------------------ | ------------------- | --------------------- |
| Components         | PascalCase          | `EngagementCard`      |
| Shared components  | `Engage` prefix     | `EngageDataTable`     |
| Hooks              | `use` prefix        | `useEngagement`       |
| Event handlers     | `handle` + Action   | `handleSubmit`        |
| Boolean props      | `is` / `has` prefix | `isLoading`           |
| Types / Interfaces | PascalCase          | `CreateEngagementDto` |
| Constants          | UPPER_SNAKE_CASE    | `MAX_DEPTH`           |

**Shared components** in `components/shared/` use the `Engage` prefix to distinguish them from Shadcn components. Examples:

- `EngageDataTable` — Custom data table wrapper
- `EngagePageHeader` — Reusable page header
- `EngageConfirmDialog` — Confirmation dialog wrapper

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

### Org Unit & Contact Badge Standard

All org unit and contact references across the application (universe, plan, engagement) **must** use the following pattern:

```tsx
{
  /* Org unit */
}
<Badge variant="secondary" className="text-xs font-normal">
  <OrgUnitCardPopover id={u.id}>
    <Building2 className="inline h-3 w-3 mr-1" />
    {u.name}
  </OrgUnitCardPopover>
</Badge>;

{
  /* Contact */
}
<Badge variant="secondary" className="text-xs font-normal">
  <ContactCardPopoverById id={c.id}>
    <User className="inline h-3 w-3 mr-1" />
    {c.name}
    {c.position && ` · ${c.position}`}
  </ContactCardPopoverById>
</Badge>;
```

- **Badge variant:** Always `"secondary"`.
- **Icons:** `Building2` for org units, `User` for contacts (from `lucide-react`).
- **Position separator:** Use middle dot `·` (not dash `—`) with same text color.
- **Popover:** Clicking the badge text opens a popover card with full details (fetched lazily by ID).
- **Components:** `OrgUnitCardPopover` from `settings/components/OrgUnitCard`, `ContactCardPopoverById` from `settings/components/ContactCard`.
- **Never** display org units or contacts as plain text or with `variant="outline"` / `variant="default"`.

---

### Base UI `render` Prop Pattern

Shadcn v2 uses **`@base-ui/react`**, not Radix UI. Base UI does **not** support the `asChild` prop. Instead, use the **`render`** prop to customize the rendered element.

**❌ Wrong (Radix pattern):**

```tsx
<DropdownMenuTrigger asChild>
  <Button variant="ghost">Open</Button>
</DropdownMenuTrigger>
```

**✅ Correct (Base UI pattern):**

```tsx
<DropdownMenuTrigger render={<Button variant="ghost" />}>
  Open
</DropdownMenuTrigger>
```

**Key differences:**

- No `asChild` prop — use `render={<Component />}` instead
- Children go inside the trigger, not as wrapper content
- The `render` prop accepts a JSX element that replaces the default rendered element

**Common use cases:**

- `DropdownMenuTrigger` with custom Button
- `DialogTrigger` with custom Button
- Any trigger/portal component that needs custom styling

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

**Stack:** React Hook Form + Zod + Shadcn `Form` components.

**Standard Shadcn Form structure** (verified — use exactly this pattern):

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{LABELS.module.entity.field}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Rules:**

- All `FormLabel` text must come from a label constant — never hardcode UI strings
- All validation messages must come from label constants
- Connect form `onSubmit` to the mutation's `mutate()` function

---

## 9. Dialog Sizes (UX Rule)

The `DialogContent` component accepts a `size` prop:

| Size           | Max Width | Use Case                       |
| -------------- | --------- | ------------------------------ |
| `sm` (default) | 384px     | Confirmations, 1–3 fields      |
| `md`           | 512px     | Standard forms, up to 4 fields |
| `lg`           | 672px     | Complex forms, **>4 fields**   |
| `xl`           | 896px     | Multi-section forms            |

> **Rule: Any form with more than 4 fields must use `size="lg"` or larger.**

```tsx
<DialogContent size="lg" className="max-h-[90vh] overflow-y-auto">
  {/* form with 5+ fields */}
</DialogContent>
```

### 9.1 FormDialog (Standard Form Pattern)

All form dialogs must use the shared `FormDialog` component (`src/components/shared/FormDialog`). It provides:

- **Sticky header** — title always visible
- **Scrollable body** — content scrolls independently
- **Sticky footer** — action buttons always visible

```tsx
import { FormDialog } from "@/components/shared/FormDialog";

<FormDialog
  open={open}
  onOpenChange={onOpenChange}
  title="Form Title"
  size="lg"
  footer={
    <>
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" form="my-form">
        Save
      </Button>
    </>
  }
>
  <Form {...form}>
    <form id="my-form" onSubmit={form.handleSubmit(onSubmit)}>
      {/* fields */}
    </form>
  </Form>
</FormDialog>;
```

> **Note:** The `<form>` must have an `id` and the submit `<Button>` must use `form="my-form"` so the footer button can trigger the form.

### 9.2 No Nested Modals (UX Rule)

**Never open a dialog/modal inside another dialog.** If a form needs to open a sub-form (e.g. "Add new contact" from an Org Unit form):

1. **Hide** the parent form dialog
2. **Show** the child form dialog
3. On child complete/cancel, **return** to the parent form with its state preserved

Implementation pattern:

- Manage both dialogs' `open` state in the parent hook via `useReducer`
- `OPEN_CHILD_FORM` action sets `parentOpen: false, childOpen: true`
- `CLOSE_CHILD_FORM` action sets `childOpen: false, parentOpen: true`
- Pass the created entity back to the parent form via static setter or callback

```tsx
// In useReducer:
case "OPEN_CONTACT_FORM":
  return { ...state, formOpen: false, contactFormOpen: true, contactRole: action.role };
case "CLOSE_CONTACT_FORM":
  return { ...state, contactFormOpen: false, formOpen: true };
```

### 9.3 DetailSheet (Standard Detail View)

All record detail views must use the shared `DetailSheet` component (`src/components/shared/DetailSheet`). It provides:

- **Sticky header** — title + X close on top row; link-style action buttons (Edit, Delete) below title, inside header above the divider
- **Scrollable body** — content area with `DetailSection` + `DetailField`
- **No footer** — all actions are link buttons in the header
- **No badge in header** — status is a regular field in the body
- **3 sizes:** `sm` (400px), `md` (540px), `lg` (720px)

Sub-components:

| Component       | Purpose                                     |
| --------------- | ------------------------------------------- |
| `DetailSheet`   | Wrapper — manages Sheet, header, actions    |
| `DetailSection` | Divider + section title + 1 or 2-col layout |
| `DetailField`   | Label + value pair                          |

**Props:**

| Prop           | Type                      | Notes                                    |
| -------------- | ------------------------- | ---------------------------------------- |
| `open`         | `boolean`                 | Sheet visibility                         |
| `onOpenChange` | `(open: boolean) => void` | Toggle handler                           |
| `title`        | `string`                  | Header title                             |
| `size`         | `sm \| md \| lg`          | Default `md`                             |
| `onEdit`       | `() => void` (optional)   | Shows edit link button in header         |
| `onDelete`     | `() => void` (optional)   | Shows delete link button (red) in header |
| `editLabel`    | `string` (optional)       | Override edit button label               |
| `deleteLabel`  | `string` (optional)       | Override delete button label             |

**Layout rule:**

- ≤3 fields in a section → `columns={1}` (single column)
- \>3 fields in a section → `columns={2}` (two-column grid)

```tsx
import {
  DetailSheet,
  DetailSection,
  DetailField,
} from "@/components/shared/DetailSheet";

<DetailSheet
  open={open}
  onOpenChange={onOpenChange}
  title="Record Name"
  size="md"
  onEdit={handleEdit}
  onDelete={handleDelete}
>
  <DetailSection title="Basic Info" columns={2} hideDivider>
    <DetailField label="Name">{data.name}</DetailField>
    <DetailField label="Code">{data.code ?? "—"}</DetailField>
    <DetailField label="Status">
      <Badge>Active</Badge>
    </DetailField>
    <DetailField label="Parent">{data.parentName ?? "—"}</DetailField>
  </DetailSection>

  <DetailSection title="Contact" columns={2}>
    <DetailField label="Email">{data.email ?? "—"}</DetailField>
    <DetailField label="Phone">{data.phone ?? "—"}</DetailField>
  </DetailSection>
</DetailSheet>;
```

### 9.4 ConfirmDialog (Standard Confirmation)

All confirmations must use the shared `ConfirmDialog` component (`src/components/shared/ConfirmDialog`).

**3 Variants:**

| Variant       | Cancel button | Confirm button    | Default confirm label | Use case                          |
| ------------- | ------------- | ----------------- | --------------------- | --------------------------------- |
| `info`        | ❌ Hidden     | Default (primary) | "OK"                  | Information only                  |
| `confirm`     | ✅ Shown      | Default (primary) | "Xác nhận"            | Normal edit, non-critical actions |
| `destructive` | ✅ Shown      | Red (destructive) | "Xóa"                 | Delete, critical / irreversible   |

**Props:**

| Prop           | Type                             | Notes                                  |
| -------------- | -------------------------------- | -------------------------------------- |
| `open`         | `boolean`                        | Dialog visibility                      |
| `onOpenChange` | `(open: boolean) => void`        | Toggle handler                         |
| `title`        | `string`                         | Dialog title                           |
| `description`  | `string`                         | Confirmation message                   |
| `onConfirm`    | `() => void`                     | Confirm action handler                 |
| `variant`      | `info \| confirm \| destructive` | Default `destructive`                  |
| `isLoading`    | `boolean` (optional)             | Disables confirm + shows loading label |
| `confirmLabel` | `string` (optional)              | Override confirm button text           |
| `cancelLabel`  | `string` (optional)              | Override cancel button text            |

**Button order:** Cancel (left, outline) → Confirm (right, variant color). `info` variant hides cancel.

```tsx
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

// Delete confirmation (default variant)
<ConfirmDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  title="Xác nhận xóa"
  description={`Bạn có chắc chắn muốn xóa "${name}"?`}
  onConfirm={handleConfirmDelete}
  isLoading={isDeleting}
/>

// Normal confirmation
<ConfirmDialog
  variant="confirm"
  title="Xác nhận"
  description="Bạn có chắc chắn muốn thực hiện thay đổi này?"
  ...
/>

// Info dialog (single OK button)
<ConfirmDialog
  variant="info"
  title="Thông báo"
  description="Thao tác đã hoàn tất."
  ...
/>
```

---

## 10. Page Layouts (Jira-like)

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

## 10. Constants

All app-wide constants live in `src/constants/`. Import via `@/constants`.

| File                 | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `navigation.ts`      | Nav items (`NAV_ITEMS`)                                 |
| `routes.ts`          | API routes (`API_ROUTES`) & page routes (`PAGE_ROUTES`) |
| `labels/common.ts`   | Shared UI text (`COMMON_LABELS`)                        |
| `labels/settings.ts` | Settings module text (`SETTINGS_LABELS`)                |
| `labels/[module].ts` | Per-module UI text — add as modules are implemented     |

**Rules:**

- **Never hardcode** API routes or page paths in components — use constants
- **Never hardcode UI text** in components — use label constants
- Use `API_ROUTES` in feature `api.ts` files
- Use `PAGE_ROUTES` for programmatic navigation
- Use `NAV_ITEMS` for navigation components

**Usage:**

```tsx
import { API_ROUTES, PAGE_ROUTES, NAV_ITEMS, COMMON_LABELS, SETTINGS_LABELS } from "@/constants";

// API calls
fetch(API_ROUTES.ENGAGEMENT);

// Labels (short alias pattern)
const L = SETTINGS_LABELS.orgUnit;
const C = COMMON_LABELS;

<FormLabel>{L.field.name}</FormLabel>
<Button>{C.action.save}</Button>
```

### 10.1 Label Key Naming Convention

Label files live in `src/constants/labels/[module].ts`. One file per module.

**Key structure:** `LABELS.[module].[entity].[category].[key]`

| Segment       | Purpose                      | Example                             |
| ------------- | ---------------------------- | ----------------------------------- |
| `module`      | Module name                  | `SETTINGS_LABELS`                   |
| `entity`      | Entity within module         | `.orgUnit`                          |
| `field`       | Field labels                 | `.field.name` → `"Tên đơn vị"`      |
| `placeholder` | Input placeholders           | `.placeholder.name`                 |
| `section`     | Section headings             | `.section.leader`                   |
| `action`      | Actions (on `COMMON_LABELS`) | `COMMON_LABELS.action.save`         |
| `validation`  | Validation messages          | `COMMON_LABELS.validation.required` |

**Rules:**

- `COMMON_LABELS` — shared across all modules (actions, status, field names, table text)
- `[MODULE]_LABELS` — module-specific (entities, fields, sections, placeholders)
- All keys use **camelCase**
- All values are in **Vietnamese** (i18n-ready — swap values for other locales without changing keys)
- Functions allowed for dynamic strings: `deleteDescription: (name: string) => \`Xóa "${name}"?\``

---

## 10.2 Inline Form Keyboard Rules

| Input Type                              | Save                       | Cancel   |
| --------------------------------------- | -------------------------- | -------- |
| **Single-line** (`Input`)               | `Enter`                    | `Escape` |
| **Multi-line** (`Textarea` / Rich Text) | `Ctrl+Enter` / `Cmd+Enter` | `Escape` |

> **Rule:** All inline forms (DataTable inline editing, inline add rows, audit objective list, work program, etc.) must follow this pattern. Both `InlineInput` and `InlineTableInput` already implement Enter→save. Ensure all usages wire `onSubmit` correctly.

---

## 11. Quick Reference

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

### 11.1 Shared Component Registry

> **Rule:** Always check this list before creating a new component.

| Component       | Path                                  | Purpose                                      |
| --------------- | ------------------------------------- | -------------------------------------------- |
| `DataTable`     | `src/components/shared/DataTable`     | List/table views (sort, filter, pagination)  |
| `FormDialog`    | `src/components/shared/FormDialog`    | Form dialog (sticky header/footer, scroll)   |
| `FormSection`   | `src/components/shared/FormSection`   | Divider + section header inside forms        |
| `DetailSheet`   | `src/components/shared/DetailSheet`   | Detail view sheet (header, sections, fields) |
| `DetailSection` | `src/components/shared/DetailSheet`   | Section with divider + 1/2-col layout        |
| `DetailField`   | `src/components/shared/DetailSheet`   | Label + value pair for detail views          |
| `ConfirmDialog` | `src/components/shared/ConfirmDialog` | Standard delete/destructive confirmation     |
