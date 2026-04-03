## Fix Instructions for Claude: `useWorkpaperShell.ts`

**Context:** 
We have reverted `src/components/shared/workpaper/useWorkpaperShell.ts` back to its state prior to the `d0736e6` (rcm table v2) merge. This was done because the previous attempt to manually re-introduce `templateSubType` caused a compilation error (`step is not defined`) in `PlanningWorkpaperOverlay.tsx`.

**Task for Claude:**
You need to enhance `useWorkpaperShell.ts` to fix a template-loading race condition, *without* breaking the `templateSubType` logic.

**Specific Requirements:**
1. **Retain `templateSubType`:** Ensure that `templateSubType` remains in the `UseWorkpaperShellParams` interface and is passed properly to the `useTemplateForEntity` hook. Do not delete it.
2. **Add `isLoadingTemplate`:** Destructure `isLoadingTemplate` from the `useTemplateForEntity` hook.
3. **Fix the Fallback Content Flash:** Update the `initialContent` `useMemo` block so that it **only** returns `fallbackContent` if `isLoadingTemplate` is explicitly `false`. If the template is still loading, it should return `null` instead of immediately falling back.
4. **Return State:** Ensure `isLoadingTemplate` is returned in the `UseWorkpaperShellReturn` interface.

**Important Warning:** Do not modify the parameters passed into the shell from `PlanningWorkpaperOverlay.tsx` unless you are absolutely sure variables like `step.key` are in scope. The previous error was caused by attempting to reference `step.key` where it did not exist.