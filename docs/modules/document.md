# Document Management

> 🔲 **PLACEHOLDER** — This is a design document. Schema, routes, and components will be finalized during implementation.

> Stores audit documents, evidence, and working papers. Files are stored once and can be attached to multiple records across modules.

---

## Schema (`prisma/schema.prisma`)

| Model                | Key Fields                                                                 | Notes                          |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------ |
| `Document`           | `id`, `filename`, `path`, `mime_type`, `size`, `uploaded_by`, `created_at` | The file itself — stored once  |
| `DocumentAttachment` | `id`, `document_id`, `ref_type`, `ref_id`, `note`                          | Links a document to any record |

**Filterable fields:** `ref_type`, `ref_id`, `mime_type`
**Searchable fields:** `filename`
**Sortable fields:** `filename`, `size`, `created_at`

`ref_type` enum: `engagement` | `section` | `objective` | `procedure` | `finding`

**Storage path:** `/storage/documents/{documentId}/{filename}`

**Key pattern:** One document → many `DocumentAttachment` rows. Same file reusable across procedures, findings, etc. without re-uploading.

---

## API Routes (`src/app/api/document/`)

| Method | Path                                     | Permission        | Description                                      |
| ------ | ---------------------------------------- | ----------------- | ------------------------------------------------ |
| GET    | `/api/document`                          | `document:read`   | List documents (filter by `ref_type` + `ref_id`) |
| GET    | `/api/document/:id`                      | `document:read`   | Get document + all attachment references         |
| POST   | `/api/document`                          | `document:create` | Upload file + create first attachment            |
| DELETE | `/api/document/:id`                      | `document:delete` | Delete document + all attachments                |
| GET    | `/api/document/:id/download`             | `document:read`   | Download file                                    |
| POST   | `/api/document/:id/attach`               | `document:create` | Attach existing document to another record       |
| DELETE | `/api/document/:id/attach/:attachmentId` | `document:delete` | Remove one attachment (not the file)             |

---

## Actions (`src/server/actions/document.ts`)

| Function                                    | Description                                                         |
| ------------------------------------------- | ------------------------------------------------------------------- |
| `getByRef(refType, refId)`                  | List all documents attached to a record                             |
| `getById(id)`                               | Get document with all attachment references                         |
| `upload(file, refType, refId, note?)`       | Upload file via storage service, create Document + first Attachment |
| `attach(documentId, refType, refId, note?)` | Link existing document to another record                            |
| `detach(attachmentId)`                      | Remove one attachment (file remains)                                |
| `delete(id)`                                | Delete file via storage service + Document + all Attachments        |
| `getDownloadPath(id)`                       | Get file path for download                                          |

---

## Feature (`src/features/document/`)

| File                                | Purpose                                                |
| ----------------------------------- | ------------------------------------------------------ |
| `api.ts`                            | Fetch wrappers including multipart upload              |
| `hooks/useDocuments.ts`             | List documents for a given `refType` + `refId`         |
| `hooks/useDocumentMutations.ts`     | Upload/attach/detach/delete mutations                  |
| `components/DocumentList.tsx`       | File list with download + attachment info              |
| `components/FileUpload.tsx`         | Upload dropzone (wraps Shadcn)                         |
| `components/EvidenceAttachment.tsx` | Reusable panel: upload new or attach existing document |
| `types.ts`                          | Document, DocumentAttachment types                     |

---

## Integrations

| Module       | Relationship                                                      |
| ------------ | ----------------------------------------------------------------- |
| `engagement` | Evidence attached at `section`, `objective`, or `procedure` level |
| `finding`    | Remediation evidence attached to `finding`                        |

---

## Notes

- File I/O handled by `src/server/services/storage.ts` (Service layer, not Action)
- A document used in a walkthrough procedure can be reattached to a finding — no re-upload needed
- Deleting a `DocumentAttachment` does not delete the file; deleting the `Document` removes all attachments and the file
- Validate file types and sizes in the API route before passing to action
