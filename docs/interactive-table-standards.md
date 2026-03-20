# Interactive Table Standards

Standards for tree/hierarchical tables with inline editing, reordering, and detail views.
Applied in: Work Program table (Planning & Execution tabs). Reuse for any similar feature.

---

## 1. Component Stack

| Layer | Component | Notes |
|-------|-----------|-------|
| Table engine | `DataTable` (`src/components/shared/DataTable`) | Wraps TanStack Table + Shadcn Table |
| Columns | Feature-specific `useXxxColumns` hook | Returns `ColumnDef[]` via `useMemo` |
| State | Feature-specific `useXxxEditor` hook | `useReducer` + mutations, exports dispatch + handlers |
| Top-level cards | Custom card component per feature | For grouped items (e.g. sections containing a DataTable) |

---

## 2. Tree / Expand-Collapse

- Use `DataTable` with `getSubRows` for tree data.
- **Default collapsed**: pass `defaultExpanded={false}` to DataTable.
- Expanding a node shows **immediate children only** — user must expand deeper levels manually.
- `autoResetExpanded: false` is set in DataTable to prevent expanded state from resetting on data changes (e.g. editing a row).
- **Click target for expand/collapse**:
  - Top-level cards: clicking the **card header** (excluding buttons) toggles collapse.
  - DataTable rows: clicking **empty cell area** toggles expand. Clicking the title text opens the detail sheet (see §4).

---

## 3. Title Cell

The title column renders differently based on row type and editing state.

### Normal mode

```
[expand chevron?] [type icon] [title text]
```

- **Expand chevron**: only for rows with children (objectives). Rendered as a ghost icon-button.
- **Type icon**: visual indicator (e.g. Target for objective, ClipboardList for procedure).
- **Title text**: plain `<span>` with `cursor-pointer hover:underline`. **No `flex-1`** — the click target must be the text itself, not the whole cell width.
- Clicking the title text calls `onViewItem(type, id)` to open a detail sheet.
- Clicking empty cell area (outside the text span) toggles expand/collapse for expandable rows, or does nothing for leaf rows.

### Inline-edit mode

```
[expand chevron?] [type icon] [InlineTableInput] [status select?] [open form] [save] [cancel]
```

- `InlineTableInput`: single-line input, Enter saves, Escape cancels.
- Save/cancel are icon buttons (Check / X).
- Status select shown only for items with a status field.
- "Open form" button opens the full FormSheet for advanced editing.

---

## 4. Detail Sheets

- **Trigger**: clicking the title text (not the cell background).
- Types: `SectionDetailSheet`, `ObjectiveDetailSheet`, `ProcedureDetailSheet`.
- Pattern: parent manages `selectedItem` state + `open/onOpenChange`. Detail sheet is read-only by default, with Edit/Delete buttons that open the FormSheet or ConfirmDialog internally (per `docs/FE.md §9.7`).

---

## 5. Actions Column (`_actions`)

A single right-aligned column at the far right of the DataTable. Contains **edit/delete + reorder** buttons.

### Layout

```
[edit] [delete] | [↑↑] [↑] [↓] [↓↓]
```

- Vertical separator (`bg-border`, 1px wide) between edit/delete and reorder groups.
- Reorder buttons only shown when siblings > 1.
- **All buttons are hover-only**: `opacity-0 group-hover/row:opacity-100 transition-opacity`.
- Column `size: 160`.

### Top-level cards

Same layout but rendered inside the card header:
```
[title text] ··· [edit] [delete] | [↑↑] [↑] [↓] [↓↓]
```
- Edit/delete use `ml-auto` to push right.
- Hover-only via `group-hover/header:opacity-100`.

---

## 6. Status Badge

- **Always visible** for items with a status (e.g. procedures).
- In **planning mode**: rendered as a read-only `StatusBadge`.
- In **execution mode**: rendered as a `LabeledSelect` dropdown for inline status changes.
- Hidden during inline editing of that row.

---

## 7. Reorder

### Mechanism

- No drag-and-drop. Explicit directional buttons: **first** (↑↑), **up** (↑), **down** (↓), **last** (↓↓).
- Buttons disabled at boundaries (first/last item).
- Reorder calls `reorderItems.mutate()` with new `sortOrder` values.
- Uses optimistic updates via `onMutate` in the mutation hook.

### Sibling detection

- **Top-level cards**: all top nodes (sections + standalone objectives) form one ordered list. Cross-type reordering is allowed.
- **DataTable rows**: siblings are determined by `row.getParentRow()?.subRows` (or root rows if no parent), filtered by same `type`.

### Scroll after move (TODO)

- Goal: after reorder, keep the moved item at the same viewport position (under cursor).
- Approach: `prepareScrollLock(id, kind)` captures `getBoundingClientRect().top` before mutation, then adjusts `window.scrollBy` after re-render via double `requestAnimationFrame`.
- Status: implemented but needs debugging for timing issues.

---

## 8. Page Layout

- WP table wrapper: `min-h-[60vh] pb-40` to ensure enough scroll room for reordering items near the bottom.
- Applied to both Planning and Execution tabs.

---

## 9. Data Attributes

For scroll targeting and testing:

| Attribute | Element | Value |
|-----------|---------|-------|
| `data-node-id` | Top-level card wrapper `<div>` | Entity UUID |
| `data-row-id` | DataTable `<tr>` (TableRow) | Entity UUID (via `getRowId`) |

---

## 10. Checklist for New Interactive Tables

1. [ ] Use `DataTable` with `getSubRows` for tree data
2. [ ] Pass `defaultExpanded={false}` and `hideToolbar`
3. [ ] Title text click → detail sheet (no `flex-1` on span)
4. [ ] Empty cell click → expand/collapse
5. [ ] `_actions` column: edit/delete + reorder, hover-only, right-aligned
6. [ ] Status badge always visible, hidden during inline edit
7. [ ] Reorder buttons with boundary detection
8. [ ] Top-level cards with `data-node-id`, hover-only buttons
9. [ ] `min-h-[60vh] pb-40` on wrapper for scroll room
10. [ ] `autoResetExpanded: false` to preserve expand state across data changes
