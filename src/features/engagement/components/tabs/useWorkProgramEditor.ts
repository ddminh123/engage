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
    () => buildTopNodes(sections, standaloneObjectives),
    [sections, standaloneObjectives],
  );

  // ── Stats ──

  const stats = useMemo(
    () => computeWpStats(sections, standaloneObjectives, findingCount),
    [sections, standaloneObjectives, findingCount],
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
      if (!t) return;
      createSection.mutate(
        { engagementId, data: { title: t } },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD_TOP" }) },
      );
    },
    [createSection, engagementId],
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
      if (!t) return;
      if (sectionId) {
        // Objective inside a section
        createObjective.mutate(
          { engagementId, sectionId, data: { title: t } },
          { onSuccess: () => dispatch({ type: "CANCEL_ADD" }) },
        );
      } else {
        // Standalone objective (top-level)
        createStandaloneObjective.mutate(
          { engagementId, data: { title: t } },
          { onSuccess: () => dispatch({ type: "CANCEL_ADD_TOP" }) },
        );
      }
    },
    [createObjective, createStandaloneObjective, engagementId],
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
      if (!t) return;

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

      // Separate sections and objectives — reorder each group independently
      // Sections maintain sort_order relative to other sections
      // Standalone objectives maintain sort_order relative to other standalone objectives
      const activeNode = topNodes[oldIdx];
      const overNode = topNodes[newIdx];

      // Only allow reorder within same type
      if (activeNode.type !== overNode.type) return;

      if (activeNode.type === "section") {
        const sectionNodes = topNodes.filter((n) => n.type === "section");
        const sOldIdx = sectionNodes.findIndex((n) => n.id === activeId);
        const sNewIdx = sectionNodes.findIndex((n) => n.id === overId);
        if (sOldIdx === -1 || sNewIdx === -1 || sOldIdx === sNewIdx) return;
        const reordered = [...sectionNodes];
        const [moved] = reordered.splice(sOldIdx, 1);
        reordered.splice(sNewIdx, 0, moved);
        reorderItems.mutate({
          engagementId,
          entityType: "section",
          items: reordered.map((n, i) => ({ id: n.id, sortOrder: i })),
        });
      } else {
        const objNodes = topNodes.filter((n) => n.type === "objective");
        const oOldIdx = objNodes.findIndex((n) => n.id === activeId);
        const oNewIdx = objNodes.findIndex((n) => n.id === overId);
        if (oOldIdx === -1 || oNewIdx === -1 || oOldIdx === oNewIdx) return;
        const reordered = [...objNodes];
        const [moved] = reordered.splice(oOldIdx, 1);
        reordered.splice(oNewIdx, 0, moved);
        reorderItems.mutate({
          engagementId,
          entityType: "objective",
          items: reordered.map((n, i) => ({ id: n.id, sortOrder: i })),
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
        entityType: node.type === "section" ? "section" : "objective",
        items: reordered.map((n, i) => ({ id: n.id, sortOrder: i })),
      });
    },
    [topNodes, engagementId, reorderItems],
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
    handleUpdateProcedure,
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
    handleReorderRows,
  };
}

// Import WP_LABELS here to avoid circular — re-export from types
import { WP_LABELS } from "./workProgramTypes";

export type WpEditor = ReturnType<typeof useWorkProgramEditor>;
