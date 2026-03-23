# PRD: Workpaper (WP) Document Component

## 1. Objective

Provide a unified, full-page document experience for Internal Audit workpapers that supports:

- Rich narrative documentation
- Structured audit fields
- Inline comments/review workflow
- Future versioning & approval

Target: Replace fragmented form-based UX with a **Confluence-style document + side pane model**

---

## 2. Page Structure

### URL

- View: /engagements/:engagementId/wp/:wpId
- Edit: same URL, controlled by mode
- Create: /engagements/:engagementId/wp/new?template=:templateId

---

## 3. Layout

### Full Page Layout

| Left (70%)                        | Right (30%)      |
| --------------------------------- | ---------------- |
| Title (inline edit, notion style) | Task pane (tabs) |
| Rich document editor              | - Fields         |
| (Tiptap-based)                    | - Comments       |

---

## 4. Core Components

### 4.1 Header (Sticky)

- WP Title (editable inline)
- Status (Draft / In Progress / Review / Approved)
- Assignee (Thực hiện)
- Reviewer (Soát xét)
- Actions:
  - Save
  - Submit for review
  - Approve (role-based) -> TODO later

---

### 4.2 Left: Document Editor

#### Title: notion style inline title editor

#### Type

- Tiptap-based rich text editor

#### Content Structure (example template)

- Section: Mô tả chi tiết
- Section: Thủ tục thực hiện
- Section: Quan sát / Kết quả
- Section: Kết luận

#### Behavior

- Supports:
  - Headings
  - Lists
  - Tables (later)
  - Attachments (via node or inline)
- Templates inserted as initial HTML/JSON

#### Modes

- Edit mode:
  - Editable
  - Bubble menu (comment primary)
- View mode:
  - Read-only
  - Comments visible
  - Clean display (Confluence-style)

---

### 4.3 Right: Task Pane

#### Tabs

##### Tab 1: Fields

Structured data (NOT configurable per WP type)

Example:

- Loại thủ tục
- Phân loại (TOC / Substantive)
- Ưu tiên
- Kiểm soát
- Kết quả đánh giá (Hiệu quả / Không hiệu quả)
- Phát hiện liên quan

Behavior:

- Always visible
- Independent from document content
- Changes auto-saved or saved with WP

---

##### Tab 2: Comments

#### Features

- Inline comment threads
- Linked to text selection
- Sidebar thread list

#### Behavior

- Click highlight → open thread
- Create via bubble menu
- Resolve / reopen
- Detached state supported

#### Rules

- Copy/paste → strip comment anchors
- Delete anchor → comment becomes "detached"
- No duplicate comment IDs

---

## 5. Templates

### Source

- Defined in Settings
- Stored as HTML or JSON

### Usage

- Applied at WP creation
- Injected into editor as initial content

### Scope

- Per WP type (e.g. Planning, Procedure, Risk Assessment)

---

## 6. Modes

### Edit Mode

- Default for preparer
- Full editing enabled
- Comments active

### View Mode

- Read-only
- Used by:
  - Reviewer
  - Approved state
- Clean UI (no editor chrome)

### Switch Logic

- Based on:
  - User role
  - WP status

---

## 7. State Model

### WP Status

- Draft
- In Progress
- In Review
- Approved

### Comment Status

- Open
- Resolved
- Detached

---

## 8. Data Model (Simplified)

### Workpaper

- id
- engagementId
- title
- content_json (Tiptap)
- templateId
- status
- assigneeId
- reviewerId

### Fields (structured)

- wpId
- type
- classification
- priority
- controlIds[]
- result
- findings[]

### Comments

- id
- wpId
- commentId (anchor reference)
- thread status
- messages[]

---

## 9. Key UX Decisions

- Bubble menu for comment (PRIMARY)
- Minimal top toolbar (secondary)
- Full-page editor (not modal)
- Right pane = persistent context

---

## 10. Future (Not in MVP)

- Versioning (diff, history)
- Approval log
- Mentions & notifications
- Real-time collaboration
- AI assist (summarize, suggest)

---

## 11. Success Criteria

- Reduce time to create WP
- Faster review cycles (comments)
- Cleaner UX vs current form
- High adoption by auditors
