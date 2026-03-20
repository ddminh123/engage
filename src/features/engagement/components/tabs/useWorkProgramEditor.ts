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
  };
}

// Import WP_LABELS here to avoid circular — re-export from types
import { WP_LABELS } from "./workProgramTypes";

export type WpEditor = ReturnType<typeof useWorkProgramEditor>;
