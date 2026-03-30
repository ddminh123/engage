# Version History Redesign — Google Docs Style

> **Status**: Discussion draft
> **Date**: 2025-03-27

## Current State

| Feature | Current | Target (Google Docs) |
|---|---|---|
| **Version list** | Small popover | Full sidebar panel |
| **Version detail** | Raw JSON dump in modal | Rendered rich text document |
| **Grouping** | Flat list | Grouped by date |
| **Navigation** | Click "Xem" → modal | Click version → content updates in-place |
| **Diff / highlight changes** | ❌ | ✅ Checkbox toggle |
| **Layout** | Popover + modal overlay | Full-page split view |

## Data Available

Each `EntityVersion` snapshot already contains:
- `content` — full Tiptap JSON (can be rendered in a read-only editor)
- Metadata fields: title, description, status, observations, conclusion, effectiveness, sampleSize, exceptions, priority, procedureType, procedureCategory, reviewNotes, performedBy, reviewedBy
- `action_label` — e.g., "Bản thảo", "Gửi soát xét", "Phê duyệt"
- `comment` — transition comment (= version comment)
- `publisher` — user who triggered the transition
- `published_at` — timestamp

## Implementation Tiers

### ✅ Tier 1 — Easy (data already exists)

- **Render snapshot content as rich text** — feed `snapshot.content` to a read-only `EngageEditor`
- **Group versions by date** in the sidebar (simple date formatting)
- **Show "Hiện tại" badge + author colored dot** — partially done already

### 🔧 Tier 2 — Medium effort (new component, no new data)

- **Full-page `VersionHistoryView` component** with split layout:
  - **Left panel**: Read-only rendered document from selected version's `snapshot.content`
  - **Right sidebar**: Version list grouped by date
  - **Top bar**: Back arrow, version timestamp, prev/next navigation
- **Metadata summary card** above content showing changed fields (title, status, etc.) in a readable format instead of raw JSON
- **Prev/next version navigation** — simple index tracking

### 🔴 Tier 3 — Hard (significant new logic)

- **"Highlight changes" diff view** — requires:
  - Diffing two Tiptap JSON documents (previous version vs selected)
  - Rendering insertions (green highlight) and deletions (red strikethrough)
  - Options: `prosemirror-changeset` library (complex) or text-level diff (simpler but loses formatting context)
- **Version comparison picker** — select any two versions to compare

## Recommended Approach

1. Build Tier 1 + Tier 2 first (~1 session) — gets 80% of Google Docs feel
2. Tier 3 (diff) as a separate initiative — high effort, lower priority since transition-only versions are already meaningful snapshots

## Open Questions

- [ ] Should the version history be a new route (`/engagement/:id/procedure/:pid/versions`) or a full-screen overlay?
- [ ] Should metadata changes be shown inline or in a collapsible section?
- [ ] Is text-level diff sufficient, or do we need structural (node-level) diff?
- [ ] Should we support naming/labeling versions manually (beyond auto-generated action labels)?
