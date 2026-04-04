# Branch `202620403-w-bug-fix` — Change Summary

## Feature: Invalid Session → Auto Kickout

**Problem:** After a DB reset, stale JWT sessions reference non-existent users, causing silent failures (e.g. missing transition buttons).

**Solution:** Two-layer defense — backend rejects stale sessions with 401, frontend catches 401 globally and signs out.

| File | Change |
|---|---|
| `src/lib/api-error.ts` | **NEW** — Custom `ApiError` class that preserves HTTP `status` and `code` from API responses |
| `src/server/middleware/withAccess.ts` | Added DB lookup after JWT check — if user doesn't exist or `status !== 'active'`, returns 401 `SESSION_INVALID` |
| `src/server/actions/teams.ts` | `checkAccess` now returns `false` if user not found (was skipping check) |
| `src/features/engagement/api.ts` | `handleResponse` throws `ApiError` instead of plain `Error` |
| `src/features/settings/api.ts` | Same `handleResponse` → `ApiError` change |
| `src/features/settings/api/riskCatalog.ts` | Same |
| `src/features/plan/api.ts` | Same |
| `src/features/teams/api.ts` | Same |
| `src/features/universe/api.ts` | Same |
| `src/features/engagement/hooks/usePlanningWorkpapers.ts` | Same |
| `src/components/layout/QueryProvider.tsx` | Added `QueryCache` + `MutationCache` `onError` — catches `ApiError` with `status === 401` → calls `signOut()`. Also disables retry on 401. |

---

## Bug Fix: Status badge not updating after transition

**Problem:** After executing a workflow transition in the planning workpaper overlay, the `StatusBadge` stayed stale until page refresh.

**Root cause:** `useExecuteTransition` didn't invalidate the `["planning-workpapers"]` query.

| File | Change |
|---|---|
| `src/features/engagement/hooks/useEngagements.ts` | Added `qc.invalidateQueries({ queryKey: ["planning-workpapers", engagementId] })` in `useExecuteTransition.onSuccess` |

---

## Bug Fix: "Mục tiêu" sidebar showing in all planning workpapers

**Problem:** The objectives sidebar tab appeared in every planning workpaper editor (understanding, RCM, etc.), not just Scope & Objectives.

**Root cause:** `PlanningWorkpaperOverlay` unconditionally passed the objectives tab to `WorkpaperDocument`.

| File | Change |
|---|---|
| `src/features/engagement/components/tabs/PlanningWorkpaperOverlay.tsx` | Gated `tabs`, `defaultTab`, `onAddObjective`, `objectiveTabKey` behind `isScope` (`stepConfigKey === "scope"`) |

---

## Bug Fix: Conditional hooks in InlineWorkpaperViewer

**Problem:** Early return before hooks violated React Rules of Hooks (24+ lint errors).

| File | Change |
|---|---|
| `src/features/engagement/components/tabs/InlineWorkpaperViewer.tsx` | Moved early return (`if (!content && onStart)`) to after all hook calls |

---

## Conflict-prone files to watch during rebase

- `src/features/engagement/hooks/useEngagements.ts` (one-liner addition)
- `src/components/layout/QueryProvider.tsx` (rewritten)
- `src/features/engagement/api.ts` (import + handleResponse change)
- `src/features/settings/api.ts` (same pattern)
