import { useRef, useMemo, useReducer, useCallback, useState } from "react";
import {
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useCreateObjective,
  useCreateStandaloneObjective,
  useUpdateObjective,
  useDeleteObjective,
  useCreateProcedure,
  useUpdateProcedure,
  useDeleteProcedure,
  useReorderItems,
} from "../../hooks/useEngagements";
import type {
  EngagementSection,
  EngagementObjective,
  EngagementProcedure,
} from "../../types";
import {
  type WpState,
  type WpAction,
  type TopNode,
  wpReducer,
  wpInitialState,
  buildTopNodes,
  buildSectionTree,
  buildObjectiveTree,
  computeWpStats,
} from "./workProgramTypes";

export type WpMode = "planning" | "execution";

export function useWorkProgramEditor(
  engagementId: string,
  sections: EngagementSection[],
  standaloneObjectives: EngagementObjective[],
  findingCount: number,
  mode: WpMode,
  standaloneProcedures: EngagementProcedure[] = [],
) {
  const [state, dispatch] = useReducer(wpReducer, wpInitialState);

  // Collapse state (persists across tab switches via useState)
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const collapseAll = useCallback((ids: string[]) => {
    setCollapsed(new Set(ids));
  }, []);

  const expandAll = useCallback(() => {
    setCollapsed(new Set());
  }, []);

  // IME-safe text ref
  const textRef = useRef("");
  const handleTextChange = useCallback((v: string) => {
    textRef.current = v;
  }, []);

  // Mutations
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const createObjective = useCreateObjective();
  const createStandaloneObjective = useCreateStandaloneObjective();
  const updateObjective = useUpdateObjective();
  const deleteObjective = useDeleteObjective();
  const createProcedure = useCreateProcedure();
  const updateProcedure = useUpdateProcedure();
  const deleteProcedure = useDeleteProcedure();
  const reorderItems = useReorderItems();

  // ── Top-level nodes ──

  const topNodes = useMemo(
    () => buildTopNodes(sections, standaloneObjectives, standaloneProcedures),
    [sections, standaloneObjectives, standaloneProcedures],
  );

  // ── Stats ──

  const stats = useMemo(
    () => computeWpStats(sections, standaloneObjectives, findingCount, standaloneProcedures),
    [sections, standaloneObjectives, findingCount, standaloneProcedures],
  );

  // ── Tree data per card (memoized map) ──

  const treesMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof buildSectionTree>>();
    for (const node of topNodes) {
      if (node.type === "section" && node.section) {
        map.set(node.id, buildSectionTree(node.section, state));
      } else if (node.type === "objective" && node.objective) {
        map.set(node.id, buildObjectiveTree(node.objective, state));
      }
    }
    return map;
  }, [topNodes, state]);

  // ── Section handlers ──

  const handleAddSection = useCallback(
    (title: string) => {
      const t = title.trim();
      if (!t || createSection.isPending) return;
      createSection.mutate(
        { engagementId, data: { title: t, phase: mode } },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD_TOP" }) },
      );
    },
    [createSection, engagementId, mode],
  );

  const handleUpdateSection = useCallback(
    (sectionId: string, title: string) => {
      const t = title.trim();
      if (!t) return;
      updateSection.mutate(
        { engagementId, sectionId, data: { title: t } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT_NODE" }) },
      );
    },
    [updateSection, engagementId],
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      deleteSection.mutate(
        { engagementId, sectionId },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE" }) },
      );
    },
    [deleteSection, engagementId],
  );

  // ── Objective handlers ──

  const handleAddObjective = useCallback(
    (title: string, sectionId?: string) => {
      const t = title.trim();
      if (!t || createObjective.isPending || createStandaloneObjective.isPending) return;
      if (sectionId) {
        // Objective inside a section
        createObjective.mutate(
          { engagementId, sectionId, data: { title: t, phase: mode } },
          { onSuccess: () => dispatch({ type: "CANCEL_ADD" }) },
        );
      } else {
        // Standalone objective (top-level)
        createStandaloneObjective.mutate(
          { engagementId, data: { title: t, phase: mode } },
          { onSuccess: () => dispatch({ type: "CANCEL_ADD_TOP" }) },
        );
      }
    },
    [createObjective, createStandaloneObjective, engagementId, mode],
  );

  const handleUpdateObjective = useCallback(
    (objectiveId: string, title: string) => {
      const t = title.trim();
      if (!t) return;
      updateObjective.mutate(
        { engagementId, objectiveId, data: { title: t } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT" }) },
      );
    },
    [updateObjective, engagementId],
  );

  const handleUpdateTopObjective = useCallback(
    (objectiveId: string, title: string) => {
      const t = title.trim();
      if (!t) return;
      updateObjective.mutate(
        { engagementId, objectiveId, data: { title: t } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT_NODE" }) },
      );
    },
    [updateObjective, engagementId],
  );

  const handleDeleteObjective = useCallback(
    (objectiveId: string) => {
      deleteObjective.mutate(
        { engagementId, objectiveId },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE" }) },
      );
    },
    [deleteObjective, engagementId],
  );

  // ── Procedure handlers ──

  const handleAddProcedure = useCallback(
    (title: string, parentId: string) => {
      const t = title.trim();
      if (!t || createProcedure.isPending) return;

      // parentId can be "sec:{sectionId}" or an objectiveId
      let sectionId: string | null = null;
      let objectiveId: string | null = null;
      if (parentId.startsWith("sec:")) {
        sectionId = parentId.slice(4);
      } else {
        objectiveId = parentId;
      }

      createProcedure.mutate(
        {
          engagementId,
          data: {
            title: t,
            sectionId,
            objectiveId,
          },
        },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD" }) },
      );
    },
    [createProcedure, engagementId],
  );

  const handleAddTopProcedure = useCallback(
    (title: string) => {
      const t = title.trim();
      if (!t || createProcedure.isPending) return;
      createProcedure.mutate(
        {
          engagementId,
          data: {
            title: t,
            sectionId: null,
            objectiveId: null,
            phase: mode,
          },
        },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD_TOP" }) },
      );
    },
    [createProcedure, engagementId, mode],
  );

  const handleUpdateProcedure = useCallback(
    (procedureId: string, title: string) => {
      const t = title.trim();
      if (!t) return;
      updateProcedure.mutate(
        { engagementId, procedureId, data: { title: t } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT" }) },
      );
    },
    [updateProcedure, engagementId],
  );

  const handleUpdateTopProcedure = useCallback(
    (procedureId: string, title: string) => {
      const t = title.trim();
      if (!t) return;
      updateProcedure.mutate(
        { engagementId, procedureId, data: { title: t } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT_NODE" }) },
      );
    },
    [updateProcedure, engagementId],
  );

  const handleUpdateProcedureStatus = useCallback(
    (procedureId: string, status: string) => {
      updateProcedure.mutate(
        { engagementId, procedureId, data: { status } },
      );
    },
    [updateProcedure, engagementId],
  );

  const handleDeleteProcedure = useCallback(
    (procedureId: string) => {
      deleteProcedure.mutate(
        { engagementId, procedureId },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE" }) },
      );
    },
    [deleteProcedure, engagementId],
  );

  // ── Reorder handlers ──

  const handleReorderTopNodes = useCallback(
    (activeId: string, overId: string) => {
      const oldIdx = topNodes.findIndex((n) => n.id === activeId);
      const newIdx = topNodes.findIndex((n) => n.id === overId);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;

      // Reorder ALL top nodes together — sections and objectives share sortOrder space
      const reordered = [...topNodes];
      const [moved] = reordered.splice(oldIdx, 1);
      reordered.splice(newIdx, 0, moved);

      // Assign new sortOrders and split by entity type for the API
      const sectionItems: { id: string; sortOrder: number }[] = [];
      const objectiveItems: { id: string; sortOrder: number }[] = [];
      const procedureItems: { id: string; sortOrder: number }[] = [];
      reordered.forEach((n, i) => {
        if (n.type === "section") sectionItems.push({ id: n.id, sortOrder: i });
        else if (n.type === "objective") objectiveItems.push({ id: n.id, sortOrder: i });
        else procedureItems.push({ id: n.id, sortOrder: i });
      });

      if (sectionItems.length > 0) {
        reorderItems.mutate({
          engagementId,
          entityType: "section",
          items: sectionItems,
        });
      }
      if (objectiveItems.length > 0) {
        reorderItems.mutate({
          engagementId,
          entityType: "objective",
          items: objectiveItems,
        });
      }
      if (procedureItems.length > 0) {
        reorderItems.mutate({
          engagementId,
          entityType: "procedure",
          items: procedureItems,
        });
      }
    },
    [topNodes, engagementId, reorderItems],
  );

  const handleMoveToTopNode = useCallback(
    (nodeId: string) => {
      const node = topNodes.find((n) => n.id === nodeId);
      if (!node) return;
      const sameTypeNodes = topNodes.filter((n) => n.type === node.type);
      const idx = sameTypeNodes.findIndex((n) => n.id === nodeId);
      if (idx <= 0) return;
      const reordered = [...sameTypeNodes];
      const [moved] = reordered.splice(idx, 1);
      reordered.unshift(moved);
      reorderItems.mutate({
        engagementId,
        entityType: node.type,
        items: reordered.map((n, i) => ({ id: n.id, sortOrder: i })),
      });
    },
    [topNodes, engagementId, reorderItems],
  );

  // Keep moved element at the same viewport position after reorder.
  // Call BEFORE mutating — returns a cleanup fn to call AFTER mutation.
  const prepareScrollLock = useCallback(
    (id: string, kind: "node" | "row") => {
      const selector =
        kind === "node"
          ? `[data-node-id="${id}"]`
          : `[data-row-id="${id}"]`;
      const el = document.querySelector(selector);
      const oldTop = el?.getBoundingClientRect().top ?? null;

      // Return fn to call right after mutation triggers optimistic update
      return () => {
        if (oldTop === null) return;
        // Double rAF: first catches React render, second catches DOM paint
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const el2 = document.querySelector(selector);
            if (!el2) return;
            const newTop = el2.getBoundingClientRect().top;
            const diff = newTop - oldTop;
            if (Math.abs(diff) > 1) {
              window.scrollBy({ top: diff, behavior: "instant" });
            }
          });
        });
      };
    },
    [],
  );

  const handleMoveTopNode = useCallback(
    (nodeId: string, direction: "up" | "down" | "first" | "last") => {
      const idx = topNodes.findIndex((n) => n.id === nodeId);
      if (idx === -1) return;
      const unlock = prepareScrollLock(nodeId, "node");
      const reordered = [...topNodes];
      const [moved] = reordered.splice(idx, 1);
      let newIdx: number;
      if (direction === "up") newIdx = Math.max(0, idx - 1);
      else if (direction === "down") newIdx = Math.min(reordered.length, idx + 1);
      else if (direction === "first") newIdx = 0;
      else newIdx = reordered.length;
      reordered.splice(newIdx, 0, moved);
      const sectionItems: { id: string; sortOrder: number }[] = [];
      const objectiveItems: { id: string; sortOrder: number }[] = [];
      const procedureItems2: { id: string; sortOrder: number }[] = [];
      reordered.forEach((n, i) => {
        if (n.type === "section") sectionItems.push({ id: n.id, sortOrder: i });
        else if (n.type === "objective") objectiveItems.push({ id: n.id, sortOrder: i });
        else procedureItems2.push({ id: n.id, sortOrder: i });
      });
      if (sectionItems.length > 0) {
        reorderItems.mutate({ engagementId, entityType: "section", items: sectionItems });
      }
      if (objectiveItems.length > 0) {
        reorderItems.mutate({ engagementId, entityType: "objective", items: objectiveItems });
      }
      if (procedureItems2.length > 0) {
        reorderItems.mutate({ engagementId, entityType: "procedure", items: procedureItems2 });
      }
      unlock();
    },
    [topNodes, engagementId, reorderItems, prepareScrollLock],
  );

  const handleMoveRow = useCallback(
    (rowId: string, direction: "up" | "down" | "first" | "last") => {
      const unlock = prepareScrollLock(rowId, "row");

      const computeNewIdx = (idx: number, len: number) => {
        if (direction === "up") return Math.max(0, idx - 1);
        if (direction === "down") return Math.min(len, idx + 1);
        if (direction === "first") return 0;
        return len; // last
      };

      const doReorder = (
        list: { id: string }[],
        entityType: "objective" | "procedure",
      ) => {
        const idx = list.findIndex((item) => item.id === rowId);
        if (idx === -1) return false;
        const reordered = [...list];
        const [moved] = reordered.splice(idx, 1);
        const newIdx = computeNewIdx(idx, reordered.length);
        reordered.splice(newIdx, 0, moved);
        reorderItems.mutate({
          engagementId,
          entityType,
          items: reordered.map((item, i) => ({ id: item.id, sortOrder: i })),
        });
        return true;
      };

      let moved = false;
      for (const section of sections) {
        if (doReorder(section.objectives, "objective")) { moved = true; break; }
        let found = false;
        for (const obj of section.objectives) {
          if (doReorder(obj.procedures, "procedure")) { found = true; break; }
        }
        if (found) { moved = true; break; }
        if (doReorder(section.procedures, "procedure")) { moved = true; break; }
      }
      if (!moved) {
        for (const obj of standaloneObjectives) {
          if (doReorder(obj.procedures, "procedure")) { moved = true; break; }
        }
      }
      if (moved) unlock();
    },
    [sections, standaloneObjectives, engagementId, reorderItems, prepareScrollLock],
  );

  const handleReorderRows = useCallback(
    (activeId: string, overId: string) => {
      // Determine what type of row was moved
      // Check all sections for matching objectives/procedures
      for (const section of sections) {
        // Check objectives within this section
        const objIdx = section.objectives.findIndex((o) => o.id === activeId);
        const objOverIdx = section.objectives.findIndex((o) => o.id === overId);
        if (objIdx !== -1 && objOverIdx !== -1 && objIdx !== objOverIdx) {
          const reordered = [...section.objectives];
          const [moved] = reordered.splice(objIdx, 1);
          reordered.splice(objOverIdx, 0, moved);
          reorderItems.mutate({
            engagementId,
            entityType: "objective",
            items: reordered.map((o, i) => ({ id: o.id, sortOrder: i })),
          });
          return;
        }
        // Check procedures within each objective
        for (const obj of section.objectives) {
          const procIdx = obj.procedures.findIndex((p) => p.id === activeId);
          const procOverIdx = obj.procedures.findIndex((p) => p.id === overId);
          if (procIdx !== -1 && procOverIdx !== -1 && procIdx !== procOverIdx) {
            const reordered = [...obj.procedures];
            const [moved] = reordered.splice(procIdx, 1);
            reordered.splice(procOverIdx, 0, moved);
            reorderItems.mutate({
              engagementId,
              entityType: "procedure",
              items: reordered.map((p, i) => ({ id: p.id, sortOrder: i })),
            });
            return;
          }
        }
        // Check direct procedures under section
        const sProcIdx = section.procedures.findIndex((p) => p.id === activeId);
        const sProcOverIdx = section.procedures.findIndex((p) => p.id === overId);
        if (sProcIdx !== -1 && sProcOverIdx !== -1 && sProcIdx !== sProcOverIdx) {
          const reordered = [...section.procedures];
          const [moved] = reordered.splice(sProcIdx, 1);
          reordered.splice(sProcOverIdx, 0, moved);
          reorderItems.mutate({
            engagementId,
            entityType: "procedure",
            items: reordered.map((p, i) => ({ id: p.id, sortOrder: i })),
          });
          return;
        }
      }
      // Check standalone objectives' procedures
      for (const obj of standaloneObjectives) {
        const procIdx = obj.procedures.findIndex((p) => p.id === activeId);
        const procOverIdx = obj.procedures.findIndex((p) => p.id === overId);
        if (procIdx !== -1 && procOverIdx !== -1 && procIdx !== procOverIdx) {
          const reordered = [...obj.procedures];
          const [moved] = reordered.splice(procIdx, 1);
          reordered.splice(procOverIdx, 0, moved);
          reorderItems.mutate({
            engagementId,
            entityType: "procedure",
            items: reordered.map((p, i) => ({ id: p.id, sortOrder: i })),
          });
          return;
        }
      }
    },
    [sections, standaloneObjectives, engagementId, reorderItems],
  );

  // ── Confirm delete dispatch ──

  const handleConfirmDelete = useCallback(() => {
    const t = state.deleteTarget;
    if (!t) return;
    if (t.type === "section") handleDeleteSection(t.id);
    else if (t.type === "objective") handleDeleteObjective(t.id);
    else if (t.type === "procedure") handleDeleteProcedure(t.id);
  }, [
    state.deleteTarget,
    handleDeleteSection,
    handleDeleteObjective,
    handleDeleteProcedure,
  ]);

  // ── Delete dialog text ──

  const deleteTitle =
    state.deleteTarget?.type === "section"
      ? WP_LABELS.section.deleteTitle
      : state.deleteTarget?.type === "objective"
        ? WP_LABELS.objective.deleteTitle
        : WP_LABELS.procedure.deleteTitle;

  const deleteDesc =
    state.deleteTarget?.type === "section"
      ? WP_LABELS.section.deleteDescription(state.deleteTarget?.title ?? "")
      : state.deleteTarget?.type === "objective"
        ? WP_LABELS.objective.deleteDescription(state.deleteTarget?.title ?? "")
        : WP_LABELS.procedure.deleteDescription(state.deleteTarget?.title ?? "");

  return {
    engagementId,
    state,
    dispatch,
    mode,
    // Collapse
    collapsed,
    toggleCollapse,
    collapseAll,
    expandAll,
    // Data
    topNodes,
    treesMap,
    stats,
    // Text ref (IME)
    textRef,
    handleTextChange,
    // Section handlers
    handleAddSection,
    handleUpdateSection,
    // Objective handlers
    handleAddObjective,
    handleUpdateTopObjective,
    handleUpdateObjective,
    // Procedure handlers
    handleAddProcedure,
    handleAddTopProcedure,
    handleUpdateProcedure,
    handleUpdateTopProcedure,
    handleUpdateProcedureStatus,
    // Delete
    handleConfirmDelete,
    deleteTitle,
    deleteDesc,
    isDeleting:
      deleteSection.isPending ||
      deleteObjective.isPending ||
      deleteProcedure.isPending,
    // Loading flags
    isCreatingSection: createSection.isPending,
    isCreatingObjective: createObjective.isPending,
    isCreatingProcedure: createProcedure.isPending,
    isUpdatingSection: updateSection.isPending,
    isUpdatingObjective: updateObjective.isPending,
    isUpdatingProcedure: updateProcedure.isPending,
    // Reorder
    handleReorderTopNodes,
    handleMoveToTopNode,
    handleMoveTopNode,
    handleMoveRow,
    handleReorderRows,
  };
}

// Import WP_LABELS here to avoid circular — re-export from types
import { WP_LABELS } from "./workProgramTypes";

export type WpEditor = ReturnType<typeof useWorkProgramEditor>;
