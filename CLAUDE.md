# CLAUDE.md — i-engage

## Project Overview

Internal Audit Management system (IIA standards). On-premises deployment, Next.js monolith.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Shadcn/ui (Base UI, not Radix), Tailwind CSS 4 |
| ORM | Prisma v7 (`prisma-client` generator, `@prisma/adapter-mariadb`) |
| Database | MySQL |
| Auth | NextAuth.js (Credentials + Entra ID) |
| State | TanStack Query + Zustand (minimal) |
| Forms | React Hook Form + Zod |
| Rich Text | TipTap v2 (ProseMirror) |
| DnD | @dnd-kit |
| Icons | lucide-react |
| Charts | Recharts, @nivo |

## Key Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Run migrations
```

## Architecture

```
UI (React) → API Routes → Server Actions → Prisma → MySQL
```

- **UI calls API routes only.** Never import server actions in client components.
- All routes protected by access middleware.
- Import `PrismaClient` from `@/generated/prisma/client` (not `@prisma/client`).

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes
│   ├── (main)/             # Main app routes (universe, plan, engagement, finding, etc.)
│   └── api/                # API Routes
├── components/
│   ├── ui/                 # Shadcn (DO NOT MODIFY)
│   └── shared/             # Complex reusable (DataTable, FormDialog, DetailSheet, ConfirmDialog)
├── features/[module]/      # Client feature modules
│   ├── components/
│   ├── hooks/
│   ├── api.ts
│   └── types.ts
├── server/
│   ├── actions/            # Business logic (Prisma)
│   ├── services/           # External integrations only
│   └── middleware/          # Auth & Access
├── constants/              # Routes, labels, navigation
├── lib/                    # Utilities (prisma client, etc.)
├── hooks/                  # Shared hooks
└── types/                  # Shared types
```

## Coding Conventions

### File Naming
- React components: **PascalCase** (`OrgUnitList.tsx`)
- All other `.ts` files: **camelCase** (`api.ts`, `types.ts`)
- Never use kebab-case for source files

### Component Patterns
- **Shadcn only** — never create custom basic components
- **Check `src/components/shared/`** before creating new components
- Self-sustained: components fetch their own data via hooks
- Extract business logic into hooks; components only render
- Use `useReducer` for complex state

### Base UI (not Radix)
- Shadcn v2 uses `@base-ui/react` — no `asChild` prop
- Use `render` prop instead: `<DropdownMenuTrigger render={<Button />}>`

### SelectItem — Always Pass `label`
```tsx
<SelectItem value={item.id} label={item.name}>{item.name}</SelectItem>
```

### Data Fetching
- `useQuery` for reads, `useMutation` for writes
- Always invalidate related queries on mutation success
- API calls in `features/[module]/api.ts`

### Constants & Labels
- Never hardcode API routes, page paths, or UI text
- Use `API_ROUTES`, `PAGE_ROUTES` from `@/constants`
- All UI text from label constants (`COMMON_LABELS`, `[MODULE]_LABELS`)
- All labels in Vietnamese

### Forms
- React Hook Form + Zod + Shadcn Form components
- `>4 fields` → use `size="lg"` or larger on DialogContent
- Use `FormDialog` shared component (sticky header/footer)
- No nested modals — hide parent, show child, return

### Inline Forms
- Single-line input: `Enter` to save, `Escape` to cancel
- Multi-line (Textarea/Rich Text): `Ctrl+Enter`/`Cmd+Enter` to save

## Styling

- **Tailwind only** — no custom CSS files (except TipTap mark styles in globals.css)
- **Font:** Inter (Latin + Vietnamese)
- **Links/nav:** Use foreground (black) color, not muted
- Follow Shadcn conventions for component styling

## Shared Components

| Component | Purpose |
|-----------|---------|
| `DataTable` | List/table views (sort, filter, pagination) |
| `FormDialog` | Form dialog (sticky header/footer) |
| `DetailSheet` | Detail view sheet (sections, fields) |
| `ConfirmDialog` | Confirmation dialog (info/confirm/destructive) |
| `SortableList` | DnD-kit based reorderable list |
| `InlineInput` | Inline editable text field |
| `EngageEditor` | TipTap rich text editor wrapper |

## Workpaper System

Rich text workpapers use TipTap with custom mark extensions:
- **CommentMark** — inline comments/review notes (blue/orange)
- **FindingMark** — linked audit findings (violet)
- **ObjectiveMark** — linked audit objectives (teal)

Key components:
- `WorkpaperDocument` — full-screen edit mode overlay
- `WorkpaperViewer` — inline read-only view with floating popovers
- `WorkpaperEditor` — TipTap editor with mark extensions

## Core Modules

| Module | Description |
|--------|-------------|
| `universe` | Auditable entities registry |
| `plan` | Annual audit planning |
| `engagement` | Audit execution & work programs |
| `finding` | Findings & remediation tracking |
| `access` | RBAC & permissions |
| `document` | File storage & evidence |
| `settings` | System configuration |
