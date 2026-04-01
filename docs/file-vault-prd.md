# PRD: File Vault (Evidence & Version Management)

## 1. Goal
Provide a centralized, hyper-fast, and compliant way for auditors to upload, version, and link evidence (Excel, Word, PDFs) to any entity in `i-engage`, without relying on an external Office Add-in.

## 2. Core Principles
1. **Polymorphic Links:** A file can be attached to an Engagement, a specific Procedure, or a Finding.
2. **Immutable Versioning:** Uploading a new version of an Excel file creates `v2`. The `v1` file is never physically deleted (crucial for audit trails).
3. **Sanitized Storage:** Files are saved on the disk/server using random UUIDs (preventing path traversal attacks). The original human-readable filename is stored only in MySQL.

## 3. Database Schema (Prisma Addition)
You need two new models. `FileNode` tracks the actual file history. `EntityAttachment` links the file to a specific part of your app.

```prisma
model FileNode {
  id              String   @id @default(cuid())
  original_name   String   // "Treasury_Testing_FINAL.xlsx"
  storage_path    String   // "/storage/engagements/123/abcd-1234.dat"
  mime_type       String   // "application/vnd.openxmlformats..."
  size_bytes      Int
  version         Int      @default(1)
  parent_file_id  String?  // If this is v2, it points to the v1 FileNode.id
  uploaded_by     String   // user_id
  created_at      DateTime @default(now())

  @@map("file_nodes")
}

// Polymorphic join table so a file can attach to anything
model EntityAttachment {
  id              String   @id @default(cuid())
  file_node_id    String
  entity_type     String   // "procedure", "finding", "engagement"
  entity_id       String   // The ID of the specific Procedure/Finding
  attached_by     String   
  created_at      DateTime @default(now())

  file_node       FileNode @relation(fields: [file_node_id], references: [id])

  @@index([entity_type, entity_id])
  @@map("entity_attachments")
}
```

## 4. The User Experience (UI Flow)

### A. The "Evidence Sidebar" (The Vault)
* **Location:** On the right side of any Procedure or Finding page (next to the Tiptap editor).
* **Action:** A Shadcn dropzone: `[Kéo thả file vào đây hoặc Chọn File]`.
* **Visual:** Displays a list of attached files with icons (🟢 Excel, 🔴 PDF). 
* **Action Buttons per File:** `Tải xuống` (Download), `Cập nhật phiên bản mới` (Upload New Version), `Hủy đính kèm` (Remove Link).

### B. The Versioning Flow (The "Excel Sync" Alternative)
1. **Auditor A** uploads `Loan_Sample.xlsx`. It appears in the Vault as `v1`.
2. **Reviewer** leaves an inline Tiptap comment: *"Fix calculation in row 5."*
3. **Auditor A** clicks `Tải xuống` (Download) on the file, fixes it in local desktop Excel, and saves it.
4. **Auditor A** clicks `Cập nhật phiên bản mới` on the file card in the UI and uploads the fixed file.
5. **The Result:** The UI now shows `Loan_Sample.xlsx (v2)`. If the Reviewer clicks it, they get the new file. If an admin looks at the history, they can still download `v1` to prove what the auditor originally submitted.

### C. Inline Linking (Tiptap Integration)
* **The Feature:** While typing in the Tiptap editor, if the auditor types `@`, a dropdown appears showing the files currently in the Evidence Vault for that specific Procedure.
* **The Output:** They select it, and a blue pill appears in the text: `(Xem Bằng chứng: 📄 Loan_Sample.xlsx)`. Clicking the pill triggers the file download instantly.

## 5. Technical Constraints & Security
* **File Renaming:** When the Next.js API receives `budget.pdf`, it must save it to the local file server as `cuid().dat` to prevent execution of malicious scripts.
* **Serve Securely:** When a user clicks download, the Next.js API must stream the file with `Content-Disposition: attachment; filename="budget.pdf"` to prevent the browser from rendering potentially malicious SVGs or HTML inline.
* **Access Control:** The API route serving the file MUST query the `EntityAttachment` table to verify if the user's session has permission to view the `entity_id` (the Procedure) before serving the bytes.