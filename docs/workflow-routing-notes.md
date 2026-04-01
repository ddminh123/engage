# Workflow & Routing UX Notes

## 1. Dynamic Routing Labels (Forwarding Logic)
**Context:** When a reviewer completes their review, the routing popover needs to accurately reflect the next step in the configured methodology chain.

**The Problem:** 
If the UI statically asks for the "Người phê duyệt" (Approver) after "Soát xét 1" (Reviewer 1) signs off, it creates a risk where Reviewer 1 might accidentally skip "Soát xét 2" (Reviewer 2) and send the workpaper straight to final approval.

**The Fix:**
- The routing label and user selection list must be **dynamic** based on the engagement's specific workflow configuration.
- If `Soát xét 2` is required, the prompt should explicitly say: **"Chuyển cho Soát xét 2"** (Forward to Reviewer 2).
- The dropdown list of users must be strictly filtered to only show users assigned to that specific engagement *and* who hold the correct role for that next step.

---

## 2. The "GitHub-Style" Split Button for Rejections
**Context:** The UI uses a split button where the primary action is "Soát xét xong" (Review Complete), and the dropdown caret reveals "Yêu cầu chỉnh sửa" (Request Changes).

**UX Assessment:**
- **Pros:** This is an excellent, modern UI pattern (popularized by GitHub PRs and modern SaaS). It keeps the interface clean by defaulting to the "Happy Path" while hiding alternative actions neatly. It avoids the visual anxiety of having massive green and red buttons side-by-side.
- **Audit Requirement:** When "Yêu cầu chỉnh sửa" is clicked, it **must** trigger a modal or text area making the "Ghi chú/Lý do" (Review Note / Reason) **mandatory**. An auditor cannot return a workpaper without explicitly stating what needs to be fixed (e.g., "Missing invoice attachment" or "Sample size too small").

---

## 3. Mandatory Review Notes on Route-Back (Return / Reject)
**Context:** When a workpaper is rejected or returned to the Preparer (Người thực hiện) using the GitHub-style split button ("Yêu cầu chỉnh sửa"), the system must enforce communication.

**The Fix / Requirement:**
- **Mandatory Comments:** When routing a workpaper backwards in the chain, the UI must display a text area for "Ghi chú/Lý do" (Review Notes) and mark it as **mandatory**. The submit button to return the workpaper must be disabled until a note is entered.
- **Reference to UI Mockup:** As seen in the routing popover/modal, the "Ghi chú (Tùy chọn)" field is currently optional for a forward approval. However, if the action is *Reject/Return*, that exact same field must change from "(Tùy chọn)" to "(Bắt buộc)".
- **Audit Trail:** These review notes must be saved immutably to the audit trail/history log so there is a permanent record of why the workpaper was rejected and what the preparer was instructed to fix.

---

## 4. The "Gửi lại cho" (Send back to) Auto-Select
**Context:** When a reviewer chooses to return a workpaper, they can explicitly choose *who* in the previous chain they are returning it to (e.g., Reviewer 2 kicking it back to Reviewer 1 instead of the Junior Auditor).

**The Fix / Requirement:**
- **Auto-select Default:** The system must auto-select (default to) the exact person who most recently forwarded the workpaper to the current reviewer. This saves the reviewer an extra click in 90% of use cases.

---

## 5. Inline Review Notes: The Danger of the Trash Can (🗑️)
**Context:** Inline review notes are legal evidence of "Supervision and Review" under IIA Standards. Allowing unauthorized deletion is a major compliance failure.

**The Rule & Fix:**
- The "Người thực hiện" (Preparer) must **never** be able to delete a Reviewer's note.
- Only the **author** of the note (the Reviewer) can click the trash can (e.g., if they made a typo and want to delete their own comment).
- For the Preparer, the trash icon must be completely hidden. Their only options are `Trả lời` (Discuss/Explain) or `Xử lý` (Mark as Fixed).

---

## 6. Inline Review Notes: How "Xử lý" (Resolve) Should Work
**Context:** When the Preparer fixes the highlighted text and clicks `Xử lý` on the review note card.

**The Workflow Requirements:**
- **Never Delete:** Do not delete the note from the database upon resolution.
- **State Change:** Change the state of the note to `Resolved / Pending Verification`. The UI should reflect this (e.g., turn the card grey or green, and collapse it to save space).
- **Reviewer Closure:** When the workpaper goes back up the chain, the Reviewer sees the "Resolved" note, verifies the fixed text in the Tiptap editor, and *they* are the ones who officially "Close" or "Archive" the note.