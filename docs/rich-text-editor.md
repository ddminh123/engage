# Rich Text Editor – Technical Documentation

> **Status**: ✅ Implemented  
> **Location**: `src/components/shared/RichTextEditor/`  
> **Base component**: `EngageEditor` — generic Tiptap wrapper used by all editor instances

---

## 1. Architecture Overview

The editor is built on **[Tiptap v3](https://tiptap.dev)** (ProseMirror wrapper for React). A single `EngageEditor` base component encapsulates all shared Tiptap setup (extensions, toolbar, context menu, image upload). Consuming editors either use `EngageEditor` directly or wrap it with feature-specific logic.

```
src/components/shared/RichTextEditor/
├── EngageEditor.tsx         # ★ Base editor component (useEditor + toolbar + context menu)
├── EditorToolbar.tsx        # Shared formatting toolbar (uses useEditorState for sync)
├── EditorContextMenu.tsx    # Custom right-click context menu
├── TableGridPicker.tsx      # Row×Col grid selector for table creation
├── extensions/
│   └── LineHeight.ts        # Custom Tiptap extension for line spacing
└── index.ts                 # Barrel exports
```

### Component Hierarchy

```
EngageEditor (base)
├── EditorToolbar        — formatting controls, synced via useEditorState
├── EditorContent        — Tiptap content area
└── EditorContextMenu    — right-click menu with clipboard-aware paste

WorkpaperEditor (wrapper)
└── EngageEditor
    + CommentMark extension (via extraExtensions)
    + Comment/review note imperative handle
    + Pending comment highlight decoration

TemplateEditor (thin consumer)
└── EngageEditor (direct usage, no extra extensions)
```

### Consuming Editors

| Editor            | Location                                                | Role                                                                     |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `EngageEditor`    | `src/components/shared/RichTextEditor/EngageEditor.tsx` | Base component — all Tiptap setup, toolbar, context menu, image upload   |
| `WorkpaperEditor` | `src/components/shared/workpaper/WorkpaperEditor.tsx`   | Wraps EngageEditor + adds CommentMark, pending highlight, comment handle |
| `TemplateEditor`  | `src/features/settings/components/TemplateEditor.tsx`   | Uses EngageEditor directly — template editing, no comments               |

---

## 2. EngageEditor — Base Component

### Props

```ts
interface EngageEditorProps {
  content: JSONContent | null;
  onChange: (content: JSONContent) => void;
  readOnly?: boolean;
  className?: string;
  editorClassName?: string; // CSS class for the editor content area
  placeholder?: string; // Default: "Bắt đầu nhập nội dung..."
  extraExtensions?: AnyExtension[]; // Appended after the base extension set
  onAddComment?: (threadType: "comment" | "review_note") => void; // Enables Ý kiến / Review note in context menu
}

interface EngageEditorHandle {
  getEditor: () => Editor | null;
}
```

### Usage — Minimal

```tsx
import { EngageEditor } from "@/components/shared/RichTextEditor/EngageEditor";

<EngageEditor
  content={content}
  onChange={onChange}
  className="rounded-md border"
  placeholder="Nhập nội dung mẫu..."
/>;
```

### Usage — With Extra Extensions

```tsx
import { EngageEditor, type EngageEditorHandle } from "@/components/shared/RichTextEditor/EngageEditor";

const ref = useRef<EngageEditorHandle>(null);

<EngageEditor
  ref={ref}
  content={content}
  onChange={onChange}
  extraExtensions={[MyCustomExtension.configure({ ... })]}
  onAddComment={(threadType) => { /* handle comment creation */ }}
/>
```

### What EngageEditor Handles

- All base Tiptap extensions (StarterKit, Table, Image, Link, etc.)
- `EditorToolbar` with `useEditorState` for reactive formatting state
- `EditorContextMenu` with clipboard-aware paste and optional comment items
- Image upload (base64)
- Google Translate prevention (`notranslate` class + `translate="no"`)
- ReadOnly toggle
- SSR-safe (`immediatelyRender: false`)

---

## 3. Tiptap Extensions

### Base Extensions (built into EngageEditor)

| Extension   | Configuration                                    |
| ----------- | ------------------------------------------------ |
| StarterKit  | `heading: { levels: [1, 2, 3] }`                 |
| Placeholder | Configurable via `placeholder` prop              |
| TextStyle   | Default                                          |
| FontFamily  | Default                                          |
| Color       | Default                                          |
| Highlight   | `multicolor: true`                               |
| Underline   | Default                                          |
| Image       | `inline: false, allowBase64: true`               |
| Table       | `resizable: true, allowTableNodeSelection: true` |
| TableRow    | Default                                          |
| TableCell   | Default                                          |
| TableHeader | Default                                          |
| Link        | `openOnClick: false`, blue underline class       |
| LineHeight  | Custom extension (see below)                     |

**Important**: `allowTableNodeSelection: true` is required for cell selection, merge/split operations.

### Custom Extensions

#### LineHeight (`extensions/LineHeight.ts`)

Adds `line-height` support to paragraph and heading nodes.

- **Commands**: `setLineHeight(height)`, `unsetLineHeight()`
- **How it works**: Global attribute on `paragraph`/`heading` nodes, parsed from `element.style.lineHeight`

#### CommentMark (`workpaper/extensions/CommentMark.ts`)

WorkpaperEditor-only extension for inline comment/review note marks.

- **Attributes**: `threadId`, `threadType`, `resolved`
- **Callbacks**: `onCommentActivated(threadId)`, `onCommentClicked(threadId)`
- **Commands**:
  - `setComment(threadId, threadType)` — apply mark to selection
  - `unsetComment(threadId)` — remove mark by threadId
  - `highlightThread(threadId)` — add `.wp-comment-active` class to mark DOM elements
  - `setPendingCommentRange(from, to)` — apply temporary blue decoration (ProseMirror decoration, not a mark)
  - `clearPendingCommentRange()` — remove the pending decoration

**Pending comment highlight**: Uses a ProseMirror plugin with `DecorationSet` to show a blue dashed underline on the selected text while the comment is being composed. Persists even when editor loses focus. Cleared on commit (`applyCommentMark`) or cancel.

---

## 4. Shared Components

### EditorToolbar

Full-featured formatting toolbar. Uses `useEditorState` from `@tiptap/react` to subscribe to editor transactions — toolbar buttons (bold, italic, underline, etc.) reactively reflect the current selection's formatting.

**Features**: Text style dropdown, font family, B/I/U, text color (9 colors), highlight color (7 colors), lists, line spacing, link insertion, table grid picker (8×8), table management, horizontal rule, image upload, undo/redo.

### EditorContextMenu

Custom right-click context menu replacing the browser default.

```ts
interface Props {
  editor: Editor;
  onAddComment?: (threadType: "comment" | "review_note") => void;
}
```

**Menu structure**:

```
Cắt                  ⌘X
Sao chép             ⌘C
Dán                  ⌘V        ← only if clipboard has content
Dán không định dạng  ⌘⇧V       ← only if clipboard has content
──────────────────
Ý kiến                          ← neutral color (if onAddComment provided + text selected)
Review note                     ← red/destructive color
──────────────────
Bảng                ▸           ← expandable submenu (if in table)
──────────────────
Xóa
```

**Key behaviors**:

- **Clipboard-aware paste**: On right-click, `navigator.clipboard.readText()` is checked. If clipboard is empty or permission denied, Dán/Dán không định dạng are hidden.
- **Selection preservation**: Capture-phase mousedown listener saves selection before ProseMirror resets it. Restored after menu mounts.
- **Smart viewport positioning**: Menu and submenu clamped within viewport via `clamp()` + `requestAnimationFrame`.

### TableGridPicker

Interactive 8×8 grid for table creation (like Google Docs / Confluence). Renders hover-highlighted cells with a `"cols × rows"` label.

---

## 5. CSS / Styling

All editor styles in `src/app/globals.css` under `.tiptap`.

### Compact Editor Density

| Property         | Value                              | Notes                       |
| ---------------- | ---------------------------------- | --------------------------- |
| Base font        | `0.8125rem` (13px)                 | Close to GDocs 11pt at 100% |
| Line-height      | `1.4`                              | Tighter than prose default  |
| H1               | `1.25rem`, margin `0.5em / 0.15em` |                             |
| H2               | `1.1rem`, margin `0.4em / 0.1em`   |                             |
| H3               | `0.95rem`, margin `0.35em / 0.1em` |                             |
| Paragraph margin | `0.15em` top/bottom                | Minimal spacing             |
| List margin      | `0.15em`, padding-left `1.25em`    |                             |

### Comment Highlight Styles

```css
/* Committed comment — yellow */
.wp-comment-mark[data-thread-type="comment"] {
  background-color: #fef9c3;
  border-bottom: 2px solid #facc15;
}

/* Committed review note — orange */
.wp-comment-mark[data-thread-type="review_note"] {
  background-color: #ffedd5;
  border-bottom: 2px solid #f97316;
}

/* Pending comment (not yet committed) — blue dashed */
.wp-comment-pending {
  background-color: #dbeafe;
  border-bottom: 2px dashed #3b82f6;
}

/* Active (clicked/focused) — blue outline */
.wp-comment-mark.wp-comment-active {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

/* Resolved — faded + dashed underline */
.wp-comment-mark[data-resolved="true"] {
  opacity: 0.5;
  border-bottom-style: dashed;
}
```

---

## 6. npm Dependencies

```
@tiptap/react          (v3.20+)
@tiptap/pm
@tiptap/starter-kit
@tiptap/extension-placeholder
@tiptap/extension-text-style
@tiptap/extension-font-family
@tiptap/extension-color
@tiptap/extension-highlight
@tiptap/extension-underline
@tiptap/extension-image
@tiptap/extension-table
@tiptap/extension-table-row
@tiptap/extension-table-cell
@tiptap/extension-table-header
@tiptap/extension-link
```

---

## 7. Known Patterns & Gotchas

1. **Google Translate icon**: Prevent by adding **both** `notranslate` CSS class and `translate="no"` attribute to the editor element. EngageEditor does this automatically.

2. **Toolbar sync**: `EditorToolbar` uses `useEditorState` hook from `@tiptap/react` to subscribe to editor transactions. This ensures toolbar buttons reflect the current selection's formatting. Do NOT use raw `editor.isActive()` in JSX — it won't re-render.

3. **CellSelection vs TextSelection**: ProseMirror table plugin uses `CellSelection` for multi-cell selection. Check `sel.toJSON().type === "cell"` to distinguish.

4. **Empty-cell commenting**: Expand collapsed selection (`from === to`) inside a table cell to the cell's content boundaries via `$pos.start(d)` / `$pos.end(d)`. Use `"[empty cell]"` as fallback quote.

5. **Right-click resets CellSelection**: Use capture-phase mousedown listener to save selection before ProseMirror changes it. After restoring, call `editor.view.focus()`.

6. **Pending comment decoration**: Uses ProseMirror `DecorationSet` (not a mark) keyed by `pendingCommentKey`. This persists when editor loses focus. Must be cleared explicitly on commit or cancel.

7. **Merge/Split**: Use `mergeOrSplit()` — auto-detects merge vs split. Do NOT use separate `mergeCells()` / `splitCell()`.

8. **PopoverTrigger**: Base UI's `PopoverTrigger` requires a native `<button>` in the `render` prop.

9. **Barrel exports**: If TypeScript can't resolve barrel `index.ts` exports, use direct file imports.

10. **BubbleMenu**: Currently hidden (temporarily disabled). Comment/review note actions available via context menu only.

---

## 8. Naming Conventions (Vietnamese UI)

| English     | Vietnamese          | Usage                                |
| ----------- | ------------------- | ------------------------------------ |
| Comment     | Ý kiến              | Context menu item, comment tab label |
| Review Note | Review note         | Context menu item (red/destructive)  |
| Review tab  | Soát xét            | Sidebar tab name                     |
| Cut         | Cắt                 | Context menu                         |
| Copy        | Sao chép            | Context menu                         |
| Paste       | Dán                 | Context menu (clipboard-aware)       |
| Paste plain | Dán không định dạng | Context menu (clipboard-aware)       |
| Delete      | Xóa                 | Context menu (always at bottom)      |
| Table       | Bảng                | Context menu expandable trigger      |
