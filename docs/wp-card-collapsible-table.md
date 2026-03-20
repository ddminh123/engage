# Work Program — Card + Collapsible Table Pattern

> Design document for the WP Table v2 component tree.  
> Location: `src/features/engagement/components/work-program/`

---

## 1. Overview

The Work Program (WP) uses a **Card + Collapsible** hierarchy instead of a flat DataTable.
This pattern suits deeply nested, heterogeneous data (sections → objectives → procedures)
where each level has different actions and inline editing capabilities.

**When to use this pattern:**
- 2–3 levels of nesting with different entity types per level
- Each level needs its own drag-and-drop reorder
- Inline editing + full-form editing coexist
- Batch selection spans multiple levels

**When NOT to use — prefer DataTable instead:**
- Flat or single-level data
- Homogeneous rows with uniform columns
- Heavy filtering / sorting / pagination needs

---

## 2. Component Tree

```
WorkProgramV2          ← Orchestrator: state, mutations, selection, expand/collapse
├── WpBatchBar         ← Floating bar for batch actions (delete, duplicate)
├── SortableList       ← Top-level DnD list (sections + standalone objectives)
│   ├── WpSectionCard  ← Card wrapper for a section
│   │   ├── SortableList → WpObjectiveItem  ← Nested objectives
│   │   │   └── SortableList → WpProcedureItem
│   │   ├── SortableList → WpProcedureItem   ← Direct section procedures
│   │   ├── WpInlineAdd
│   │   └── WpAddButton
│   └── WpObjectiveCard ← Standalone objective (top-level)
│       ├── SortableList → WpProcedureItem
│       ├── WpInlineAdd
│       └── WpAddButton
├── WpInlineAdd        ← Top-level inline add (section / objective)
├── WpAddButton        ← "+Add" trigger buttons
├── WpMoveMenu         ← MoveObjectiveMenu / MoveProcedureMenu dropdowns
├── WpStatusBadge      ← Status pill (presentational)
└── Detail/Form sheets ← ProcedureDetailSheet, ObjectiveDetailSheet, etc.
```

---

## 3. State Architecture

### 3.1 Editor State (`useWorkProgramEditor`)

A `useReducer`-based hook manages all transient UI state:

| State slice       | Purpose                                    |
|-------------------|--------------------------------------------|
| `editingId`       | Currently inline-editing item              |
| `editingType`     | Type of item being edited                  |
| `editingNodeId`   | Top-level card header being edited         |
| `addingTopType`   | Adding section or standalone objective     |
| `addingType`      | Adding objective or procedure (nested)     |
| `addingForId`     | Parent ID for nested add                   |
| `deleteTarget`    | Item pending delete confirmation           |
| `editingStatus`   | Procedure status during inline edit        |

The hook also exposes mutation handlers (`handleAddSection`, `handleUpdateProcedure`, etc.)
that call TanStack Query mutations from `useEngagements`.

### 3.2 Selection State (orchestrator)

- `selectedIds: Set<string>` — managed in `WorkProgramV2` with `useState`
- `toggleSelect(id)` / `toggleSelectAll(ids[], selected)` / `clearSelection()`
- IDs are validated against current data on every render (`validSelectedIds`)

### 3.3 Expand/Collapse State (orchestrator)

- `openCardIds: Set<string>` — tracks which cards/items are expanded
- `toggleCard(id, open)` — toggle single card
- `handleExpandCollapseAll()` — collects ALL collapsible IDs (including nested objectives inside sections) and toggles them together
- Each card receives `open` + `onOpenChange` as controlled props

---

## 4. Drag & Drop

Uses the shared `SortableList` component (wraps `@dnd-kit`).

| Level                | Reorder scope                    |
|----------------------|----------------------------------|
| Top-level            | Sections reorder among sections; standalone objectives among objectives |
| Objectives in section| Reorder within that section      |
| Procedures in obj    | Reorder within that objective    |
| Procedures in section| Reorder within that section      |

**Cross-parent moves** (objective → different section, procedure → different parent)
use a "Move to" dropdown (`WpMoveMenu`) instead of cross-container DnD:

- `MoveObjectiveMenu` — lists all sections + "Standalone" option
- `MoveProcedureMenu` — lists all sections (direct) + all objectives (indented)
- Triggers `PATCH` on the item's update endpoint with new `sectionId` / `objectiveId`

---

## 5. Inline Editing

Two modes:
1. **Inline title edit** — replaces the item row with an `InlineTableInput`
2. **Full form** — opens a Sheet (`ProcedureFormSheet`, etc.)

`WpInlineAdd` supports both: a text input for quick creation + a "Maximize" button
to open the full form. Enter saves; Escape cancels.

---

## 6. Batch Actions

- Manual checkbox implementation (plain `<button>` with `Check` icon) — avoids Base UI checkbox controlled-state bug
- `WpBatchBar` floats at top when ≥1 item selected
- Uses `useBatchAction` hook for server calls (delete, duplicate)
- Delete requires `ConfirmDialog` confirmation

---

## 7. Key Props Flow

```
WorkProgramV2 (orchestrator)
  → WpSectionCard / WpObjectiveCard
    Props: editor, section/objective, dragHandleProps,
           isSelected, selectedIds, onToggleSelect, onToggleSelectAll,
           onViewItem, onViewSection, onOpenForm,
           open, onOpenChange, openCardIds, onToggleCard,
           allSections, allStandaloneObjectives,
           onMoveObjective, onMoveProcedure

  → WpObjectiveItem (inside WpSectionCard)
    Props: same as above minus section-specific ones

  → WpProcedureItem (inside WpObjectiveItem / WpSectionCard / WpObjectiveCard)
    Props: procedure, editor, dragHandleProps,
           isSelected, onToggleSelect, onViewItem, onOpenForm,
           allSections, allStandaloneObjectives, onMoveProcedure
```

---

## 8. File Index

| File                | Role                                          |
|---------------------|-----------------------------------------------|
| `WorkProgramV2.tsx` | Orchestrator — state, mutations, layout        |
| `WpSectionCard.tsx` | Section card with collapsible body             |
| `WpObjectiveCard.tsx`| Standalone objective card                     |
| `WpObjectiveItem.tsx`| Nested objective row inside section            |
| `WpProcedureItem.tsx`| Procedure row (leaf)                           |
| `WpInlineAdd.tsx`   | Inline creation form                           |
| `WpAddButton.tsx`   | "+Add" trigger buttons                         |
| `WpBatchBar.tsx`    | Floating batch action bar                      |
| `WpMoveMenu.tsx`    | Cross-parent move dropdown menus               |
| `WpStatusBadge.tsx` | Status pill (presentational)                   |
| `index.ts`          | Barrel export                                  |

---

## 9. Extension Guide

**Adding a new nested level** (e.g., sub-procedures):
1. Create `WpSubProcedureItem.tsx` following `WpProcedureItem` pattern
2. Add a `SortableList` inside `WpProcedureItem`'s collapsible content
3. Add reorder handler in `useWorkProgramEditor`
4. Extend `openCardIds` to include sub-procedure IDs in expand/collapse-all

**Adding a new action to items:**
1. Add button in the `group-hover/row` action span
2. If it needs data, pass callback from orchestrator through props
3. If it's a mutation, add hook in `useEngagements.ts` + API route
