# Rich Text Editor – Technical Documentation

> **Status**: ✅ Implemented  
> **Location**: `src/components/shared/RichTextEditor/`  
> **Used by**: `WorkpaperEditor`, `TemplateEditor`, and any future editor instances

---

## 1. Architecture Overview

The editor is built on **[Tiptap v2](https://tiptap.dev)** (ProseMirror wrapper for React). Shared UI components are extracted into a reusable folder so any editor instance only needs to configure its Tiptap extensions and wire the shared toolbar/context menu.

```
src/components/shared/RichTextEditor/
├── EditorToolbar.tsx        # Shared formatting toolbar
├── EditorContextMenu.tsx    # Custom right-click context menu
├── TableGridPicker.tsx      # Row×Col grid selector for table creation
├── extensions/
│   └── LineHeight.ts        # Custom Tiptap extension for line spacing
└── index.ts                 # Barrel exports
```

### Consuming Editors

| Editor | Location | Notes |
|--------|----------|-------|
| `WorkpaperEditor` | `src/components/shared/workpaper/WorkpaperEditor.tsx` | Full editor with comments, review notes, BubbleMenu |
| `TemplateEditor` | `src/features/settings/components/TemplateEditor.tsx` | Template editing, no comments |

---

## 2. Tiptap Extensions Used

All editors share this common extension set:

```ts
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { Image } from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import { LineHeight } from "@/components/shared/RichTextEditor/extensions/LineHeight";
```

### Extension Configuration

```ts
StarterKit.configure({ heading: { levels: [1, 2, 3] } })
Highlight.configure({ multicolor: true })
Image.configure({ inline: false, allowBase64: true })
Table.configure({ resizable: true, allowTableNodeSelection: true })
Link.configure({
  openOnClick: false,
  HTMLAttributes: { class: "text-primary underline cursor-pointer" },
})
```

**Important**: `allowTableNodeSelection: true` is required for cell selection, merge/split operations to work correctly.

### Custom Extensions

#### LineHeight (`extensions/LineHeight.ts`)

A custom Tiptap extension that adds `line-height` support to paragraph and heading nodes.

**Commands**:
- `setLineHeight(height: string)` — e.g., `"1.0"`, `"1.5"`, `"2.0"`
- `unsetLineHeight()` — reset to default

**How it works**: Adds a `lineHeight` global attribute to `paragraph` and `heading` node types. Parses from `element.style.lineHeight` and renders as inline `style="line-height: X"`.

#### CommentMark (`workpaper/extensions/CommentMark.ts`)

WorkpaperEditor-only extension for inline comment/review note marks.

**Attributes**: `threadId`, `threadType`  
**Callbacks**: `onCommentActivated(threadId)`, `onCommentClicked(threadId)`  
**Commands**: `setComment(threadId, threadType)`, `highlightThread(threadId)`

---

## 3. Shared Components

### EditorToolbar

Full-featured formatting toolbar. Accepts:

```ts
interface Props {
  editor: Editor;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}
```

**Features**:
- Text style dropdown (paragraph, H1–H3)
- Font family selector
- Bold, Italic, Underline
- Text color picker (9 colors)
- Highlight color picker (7 colors)
- Ordered/unordered lists
- Line spacing selector (1.0, 1.15, 1.5, 2.0, 2.5, 3.0)
- Link insertion (URL input with insert/update/remove)
- **Table grid picker** (8×8 hover grid like Google Docs)
- Table management (add/remove rows/cols, delete table) — shown when cursor is inside a table
- Horizontal rule
- Image upload (base64)
- Undo/Redo

### EditorContextMenu

Custom portal-based right-click context menu that replaces the browser default within the editor.

```ts
interface Props {
  editor: Editor;
  onAddComment?: () => void;  // Optional — enables "Bình luận" item
}
```

**Menu structure** (top to bottom):
1. Cắt / Sao chép / Dán / Dán không định dạng
2. Bình luận *(if `onAddComment` provided and text is selected)*
3. Bảng ▸ *(expandable submenu, if cursor is inside a table)*
4. Xóa *(always at bottom)*

**Table submenu** (hover-expandable):
- Thêm cột trước/sau, Thêm hàng trên/dưới
- Gộp/Tách ô (`mergeOrSplit()` command)
- Xóa cột, Xóa hàng, Xóa bảng

#### Key Technical Details

**Selection preservation on right-click**:  
ProseMirror's table plugin processes `mousedown` and resets CellSelection before `contextmenu` fires. To fix this:

1. A **capturing-phase** `mousedown` listener saves the current selection to a ref when `e.button === 2` (right-click)
2. The `contextmenu` handler uses this pre-saved selection
3. After the menu mounts, the selection is **restored** via `editor.state.tr.setSelection(savedSelection)` and `editor.view.focus()` to re-render CellSelection decorations

```ts
// Capture phase runs BEFORE ProseMirror's handler
el.addEventListener("mousedown", handleMouseDown, true);
```

**Smart viewport positioning**:  
Both the main menu and submenu are clamped within the viewport using a `clamp()` utility + `requestAnimationFrame` to measure actual DOM size after render.

**Submenu positioning**:  
Computed via `useEffect` after `tableSubOpen` changes — tries right of main menu, falls back to left if insufficient space.

### TableGridPicker

Interactive 8×8 grid for table creation (like Google Docs / Confluence).

```ts
interface Props {
  onSelect: (rows: number, cols: number) => void;
}
```

Renders a grid of small buttons that highlight on hover, with a `"cols × rows"` label.

---

## 4. CSS / Styling

All editor styles are in `src/app/globals.css` under the `.tiptap` selector.

### Compact Editor Density

Overrides Tailwind Typography's `prose` defaults for a GDocs-like density:

| Property | Value | Notes |
|----------|-------|-------|
| Base font | `0.8125rem` (13px) | Close to GDocs 11pt at 100% |
| Line-height | `1.4` | Tighter than prose default |
| H1 | `1.25rem`, margin `0.5em / 0.15em` | |
| H2 | `1.1rem`, margin `0.4em / 0.1em` | |
| H3 | `0.95rem`, margin `0.35em / 0.1em` | |
| Paragraph margin | `0.15em` top/bottom | Minimal spacing |
| List margin | `0.15em`, padding-left `1.25em` | |

### Table Styles

```css
.tiptap table { margin: 0.35em 0; }
.tiptap table td, .tiptap table th {
  padding: 0.2rem 0.4rem;
  font-size: 0.8125rem;
  min-width: 80px;
}
.tiptap table th { background-color: var(--muted); font-weight: 600; }
.tiptap table .selectedCell::after {
  /* Blue overlay for selected cells */
  background: oklch(0.488 0.243 264.376 / 0.12);
}
.tiptap table .column-resize-handle {
  /* Blue resize bar on column borders */
  background-color: oklch(0.488 0.243 264.376);
}
```

### Image Styles

```css
.tiptap img { max-width: 100%; border-radius: 0.5rem; }
.tiptap img.ProseMirror-selectednode {
  outline: 2px solid oklch(0.488 0.243 264.376);
}
```

---

## 5. How to Create a New Editor Instance

```tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
// ... other extensions
import { EditorToolbar } from "@/components/shared/RichTextEditor/EditorToolbar";
import { EditorContextMenu } from "@/components/shared/RichTextEditor/EditorContextMenu";
import { LineHeight } from "@/components/shared/RichTextEditor/extensions/LineHeight";

export function MyEditor({ content, onChange }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      // ... TextStyle, FontFamily, Color, Highlight, Underline, Image
      Table.configure({ resizable: true, allowTableNodeSelection: true }),
      TableRow, TableCell, TableHeader,
      Link.configure({ openOnClick: false }),
      LineHeight,
    ],
    content,
    immediatelyRender: false,  // Required for SSR/hydration
    onUpdate: ({ editor: e }) => onChange(e.getJSON()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col">
      <EditorToolbar editor={editor} fileInputRef={fileInputRef} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={handleImageUpload} />
      <EditorContent editor={editor} className="flex-1" />
      <EditorContextMenu editor={editor} />
    </div>
  );
}
```

**Key points**:
- Always set `immediatelyRender: false` to avoid SSR hydration warnings
- Always set `allowTableNodeSelection: true` on Table extension
- Use `prose prose-sm max-w-none` class — the `.tiptap` CSS overrides handle density
- Pass `onAddComment` to `EditorContextMenu` only if your editor supports comments

---

## 6. npm Dependencies

```
@tiptap/react
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

1. **CellSelection vs TextSelection**: ProseMirror's table plugin uses `CellSelection` for multi-cell selection. Check `sel.toJSON().type === "cell"` to distinguish from regular `TextSelection`. BubbleMenu should hide for CellSelection but show for text selection within a cell.

2. **Right-click resets CellSelection**: ProseMirror processes `mousedown` before `contextmenu`. Use a **capture-phase** mousedown listener to save the selection before ProseMirror changes it.

3. **Merge/Split**: Use `mergeOrSplit()` — the smart command that auto-detects whether to merge (multiple cells selected) or split (single merged cell selected). Do NOT use separate `mergeCells()` / `splitCell()`.

4. **PopoverTrigger**: Base UI's `PopoverTrigger` expects a native `<button>` element in the `render` prop. Using `<div role="button">` will cause a console error.

5. **Barrel exports**: If TypeScript can't resolve barrel `index.ts` exports, use direct file imports instead (e.g., `import { EditorToolbar } from "@/components/shared/RichTextEditor/EditorToolbar"`).

6. **Editor focus after selection restore**: After restoring a selection via `editor.state.tr.setSelection()`, call `editor.view.focus()` to ensure ProseMirror redraws decorations (especially CellSelection highlights).
