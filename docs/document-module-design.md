# Documents Module Design: Architecture & Workflow

## 1. Overview & Strategy
The Documents Module handles all file uploads, versioning, access control, and storage routing across `i-engage`. Since the system is 100% on-premise but must be ready for future Microsoft SharePoint/OneDrive integration, it requires a strict **Storage Provider Interface** and a robust **Database Meta-Layer**.

## 2. Storage Architecture (Provider Pattern)
We must decouple the *metadata* (stored in MySQL) from the *physical file* (stored on disk or cloud).

```typescript
// src/server/services/storage/StorageProvider.ts
export interface StorageProvider {
  upload(file: Buffer, path: string): Promise<string>; // returns storageKey
  download(storageKey: string): Promise<Buffer | ReadableStream>;
  delete(storageKey: string): Promise<void>;
}

// Implementations:
// 1. LocalDiskProvider (Saves to /storage/{engagementId}/{uuid})
// 2. SharePointProvider (Uses Microsoft Graph API, storageKey is the DriveItem ID)
```

### Ready-Made Solutions for Storage:
*   **MinIO (Highly Recommended):** Instead of writing directly to the Linux file system (which is hard to scale and backup), deploy the open-source **MinIO** Docker container. It gives you an enterprise-grade, S3-compatible local object store. If a client later wants cloud storage, you just change the API keys.
*   **Frontend Upload UI:** Use **Uppy** (open-source) or standard **React Dropzone**. Uppy handles resumable chunked uploads natively, which is critical if auditors upload 500MB Excel files.
*   **SharePoint Integration:** Use the official `@microsoft/microsoft-graph-client` (Node.js) for future OneDrive/SharePoint routing.

---

## 3. Database Meta-Layer (Prisma)
To handle versioning and polymorphic ownership (linking to any entity), the database must track files independently of where they are used.

```prisma
model Document {
  id              String   @id @default(cuid())
  engagement_id   String
  original_name   String   // "Q1_Testing.xlsx"
  mime_type       String
  current_version Int      @default(1)
  owner_id        String   // User who initially uploaded it
  created_at      DateTime @default(now())

  versions        DocumentVersion[]
  links           EntityDocumentLink[]
}

model DocumentVersion {
  id            String   @id @default(cuid())
  document_id   String
  version_num   Int      // 1, 2, 3
  storage_key   String   // The path on local disk OR the SharePoint Item ID
  size_bytes    Int
  uploaded_by   String
  created_at    DateTime @default(now())
}

// Polymorphic mapping to attach documents anywhere
model EntityDocumentLink {
  id            String   @id @default(cuid())
  document_id   String
  entity_type   String   // "procedure", "finding", "planning_step"
  entity_id     String   // e.g., the Procedure ID
  linked_by     String

  @@unique([document_id, entity_type, entity_id])
}
```

---

## 4. Interaction with Other Modules (Example: Procedure Workpapers)

### Scenario: Auditor uploads evidence to a Procedure
1.  **Upload:** Auditor drags `Loan_Sample.xlsx` into the Evidence Sidebar of the Procedure component.
2.  **API Call:** Frontend sends `FormData` to `/api/engagements/[id]/documents/upload`.
3.  **Storage:** `LocalDiskProvider` saves the file to `/storage/[eng_id]/[uuid].dat`.
4.  **Database:** 
    *   Creates a `Document` record.
    *   Creates a `DocumentVersion (v1)` record with the `storage_key`.
    *   Creates an `EntityDocumentLink` connecting the Document to the `entity_type: "procedure"` and `entity_id: [procedure_id]`.
5.  **Versioning:** If the Reviewer requests a change, the auditor uploads a fixed file. The API creates `DocumentVersion (v2)`, increments `Document.current_version`, but the `EntityDocumentLink` remains the same.

---

## 5. Tiptap Inline Attachments (The "Notion" Flow)

Tiptap is used across the platform. Auditors must be able to drop files directly into the rich text editor.

### What should happen when a user inserts a file into Tiptap?
1.  **Intercept the Drop/Paste:** Create a Tiptap extension (`FileAttachmentNode`) that intercepts file drops.
2.  **Background Upload:** While showing a loading spinner inline, the frontend uploads the file to the Document API.
3.  **The Database Link:** The API saves the file and returns the `Document.id`. The frontend automatically creates an `EntityDocumentLink` to whatever entity is currently open (e.g., the Finding).
4.  **The Tiptap Node:** Tiptap inserts a custom, non-editable inline block: 
    ```json
    {
      "type": "fileAttachment",
      "attrs": {
        "documentId": "cuid_123",
        "fileName": "Loan_Sample.xlsx",
        "version": 1
      }
    }
    ```
5.  **Rendering & Security:** When another user views the Tiptap document, the React component renders a clickable Pill: `📄 Loan_Sample.xlsx (v1)`. Clicking it calls `/api/documents/[id]/download`. The API checks the user's session against the engagement ID before streaming the file via the Storage Provider.

### Why this Tiptap architecture wins:
By storing only the `documentId` inside the Tiptap JSON (rather than a raw URL), you maintain strict **Access Control**. If the user doesn't have permission to view that specific engagement, the download API will reject them, even if they somehow copy-pasted the Tiptap JSON to another project.