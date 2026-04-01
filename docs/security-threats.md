# i-engage Security Threat Model & Best Practices

As an Enterprise/Bank Internal Audit tool deployed on-premises, the primary threat vector is **Insider Threat** (e.g., unauthorized access to highly sensitive audits like payroll or fraud investigations) rather than external actors.

This document outlines the top critical security blind spots for the Next.js/MySQL architecture and how to mitigate them.

---

## 1. Authentication vs. Authorization (IDOR)
**The Risk:** 
Next.js Middleware is excellent for checking if a user is logged in (Authentication) but cannot query the database to check if they have access to a specific record (Authorization). If a user changes a URL or API payload from `workpaper_id=123` to `999`, they might access a confidential audit they aren't assigned to. This is called Insecure Direct Object Reference (IDOR).

**The Fix:**
Enforce strict **Row-Level Security** in every API Route or Server Action. Always verify ownership against the user's session before querying or mutating data.

```javascript
// Example check inside a Server Action or API Route
const session = await auth();
const workpaper = await prisma.workpaper.findUnique({ where: { id: req.id } });

if (workpaper.engagement_id !== session.user.assigned_engagement) {
  throw new Error("Unauthorized: User not assigned to this engagement.");
}
```

---

## 2. Rich Text & Tiptap (Stored XSS)
**The Risk:**
Tiptap saves rich text in JSON format, which eventually renders as HTML in the browser. A malicious insider or compromised account could intercept the save request and inject a malicious `<script>` tag into the payload. When a high-privileged user (like an Approver or Audit Director) opens that workpaper, the script executes in their browser.

**The Fix:**
Never trust the payload coming from the client. Before rendering Tiptap HTML output on the screen, always sanitize it using a library like **DOMPurify** to strip executable scripts.

---

## 3. Evidence Uploads (Malicious Files & Path Traversal)
**The Risk:**
Auditors upload significant amounts of evidence (PDFs, Excel, Word). If the system relies on the local file server and trusts user input:
- A user could upload `.xlsx` files with malicious macros.
- A user could rename a `.exe` to `.pdf` to bypass basic frontend checks.
- A user could use Path Traversal (`../../../etc/passwd`) as the filename to overwrite core server files.

**The Fix:**
- **Strict MIME-type validation:** Validate the file signature on the Next.js server, not just the `.ext` extension.
- **Abstract Filenames:** Never save the file using its original name. Save it as a random UUID (e.g., `123e4567-e89b-12d3-a456-426614174000.dat`) and store the original name in MySQL.
- **Secure Downloads:** When serving the file back to the UI, force it to download as an attachment rather than rendering inline to prevent SVG/HTML-based XSS.
  ```http
  Content-Disposition: attachment; filename="original_evidence.pdf"
  ```

---

## 4. Server Actions "Hidden" Endpoints
**The Risk:**
Next.js compiles Server Actions (`"use server"`) into hidden HTTP POST endpoints. Even if you don't expose them as traditional `/api/...` routes, anyone who inspects the network tab can find the endpoint name and trigger it manually via tools like Postman.

**The Fix:**
Treat every Server Action exactly like a public, unprotected API endpoint. **Never rely on UI state to hide buttons.**

```javascript
"use server";
import { auth } from "@/auth";

export async function deleteWorkpaper(id) {
   const session = await auth();
   
   // 1. Check Authentication
   if (!session) throw new Error("Not authenticated");
   
   // 2. Check Role Authorization
   if (session.user.role !== 'ADMIN') throw new Error("Forbidden");
   
   // ... proceed with deletion
}
```

---

## Summary
When building features for `i-engage`, always assume the client is compromised. 
1. Validate all inputs (using Zod).
2. Authorize every single database read/write.
3. Sanitize all outputs.
