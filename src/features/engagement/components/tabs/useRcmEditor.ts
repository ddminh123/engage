import { useRef, useMemo, useReducer, useCallback } from "react";
import {
  useCreateRcmObjective,
  useUpdateRcmObjective,
  useDeleteRcmObjective,
  useSyncRcmObjectives,
  useCreateEngagementRisk,
  useUpdateEngagementRisk,
  useDeleteEngagementRisk,
  useCreateEngagementControl,
  useUpdateEngagementControl,
  useDeleteEngagementControl,
  useReorderItems,
} from "../../hooks/useEngagements";
import type { RcmObjective } from "../../types";
import {
  type RcmState,
  type RcmAction,
  rcmReducer,
  initialState,
  buildRcmTree,
  buildLookups,
  LR,
} from "./rcmTypes";

export function useRcmEditor(
  engagementId: string,
  rcmObjectives: RcmObjective[],
) {
  const [state, dispatch] = useReducer(rcmReducer, initialState);

  // Mutations
  const createObj = useCreateRcmObjective();
  const updateObj = useUpdateRcmObjective();
  const deleteObj = useDeleteRcmObjective();
  const syncObj = useSyncRcmObjectives();
  const createRisk = useCreateEngagementRisk();
  const updateRisk = useUpdateEngagementRisk();
  const deleteRisk = useDeleteEngagementRisk();
  const createControl = useCreateEngagementControl();
  const updateControl = useUpdateEngagementControl();
  const deleteControl = useDeleteEngagementControl();
  const reorderItems = useReorderItems();

  // Ref to track current inline input text (avoids state → column recreation → IME breakage)
  const textRef = useRef("");
  const handleTextChange = useCallback((v: string) => {
    textRef.current = v;
  }, []);

  // Lookup maps
  const { objectiveMap, riskMap, controlMap } = useMemo(
    () => buildLookups(rcmObjectives),
    [rcmObjectives],
  );

  // Tree data
  const treeData = useMemo(
    () => buildRcmTree(rcmObjectives, state),
    [rcmObjectives, state],
  );

  // ── Handlers ──

  const handleAddObjective = useCallback(
    (value: string) => {
      const title = value.trim();
      if (!title) return;
      createObj.mutate(
        { engagementId, data: { title } },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD" }) },
      );
    },
    [createObj, engagementId],
  );

  const handleUpdateObjective = useCallback(
    (value: string) => {
      const title = value.trim();
      if (!title || !state.editingId) return;
      updateObj.mutate(
        { engagementId, objectiveId: state.editingId, data: { title } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT" }) },
      );
    },
    [state.editingId, updateObj, engagementId],
  );

  const handleAddRisk = useCallback(
    (value: string) => {
      const desc = value.trim();
      if (!desc || !state.addingForId) return;
      createRisk.mutate(
        {
          engagementId,
          data: {
            riskDescription: desc,
            riskRating: state.addingRating || null,
            rcmObjectiveId: state.addingForId,
          },
        },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD" }) },
      );
    },
    [state.addingRating, state.addingForId, createRisk, engagementId],
  );

  const handleAddControl = useCallback(
    (value: string) => {
      const desc = value.trim();
      if (!desc || !state.addingForId) return;
      createControl.mutate(
        {
          engagementId,
          riskId: state.addingForId,
          data: {
            description: desc,
            effectiveness: state.addingEffectiveness || null,
          },
        },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD" }) },
      );
    },
    [state.addingEffectiveness, state.addingForId, createControl, engagementId],
  );

  const handleUpdateRisk = useCallback(
    (value: string) => {
      const desc = value.trim();
      if (!desc || !state.editingId) return;
      updateRisk.mutate(
        {
          engagementId,
          riskId: state.editingId,
          data: {
            riskDescription: desc,
            riskRating: state.editingRating || null,
          },
        },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT" }) },
      );
    },
    [state.editingRating, state.editingId, updateRisk, engagementId],
  );

  const handleUpdateControl = useCallback(
    (value: string) => {
      const desc = value.trim();
      if (!desc || !state.editingId) return;
      const lookup = controlMap.get(state.editingId);
      if (!lookup) return;
      updateControl.mutate(
        {
          engagementId,
          riskId: lookup.riskId,
          controlId: state.editingId,
          data: {
            description: desc,
            effectiveness: state.editingEffectiveness || null,
          },
        },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT" }) },
      );
    },
    [
      state.editingEffectiveness,
      state.editingId,
      updateControl,
      controlMap,
      engagementId,
    ],
  );

  const handleConfirmDelete = useCallback(() => {
    const target = state.deleteTarget;
    if (!target) return;
    if (target.type === "objective") {
      deleteObj.mutate(
        { engagementId, objectiveId: target.id },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE" }) },
      );
    } else if (target.type === "risk") {
      deleteRisk.mutate(
        { engagementId, riskId: target.id },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE" }) },
      );
    } else if (target.type === "control" && target.riskId) {
      deleteControl.mutate(
        { engagementId, riskId: target.riskId, controlId: target.id },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE" }) },
      );
    }
  }, [state.deleteTarget, deleteObj, deleteRisk, deleteControl, engagementId]);

  const handleRiskRatingChange = useCallback(
    (riskId: string, value: string) => {
      updateRisk.mutate({
        engagementId,
        riskId,
        data: { riskRating: value || null },
      });
    },
    [updateRisk, engagementId],
  );

  const handleEffectivenessChange = useCallback(
    (controlId: string, value: string) => {
      const lookup = controlMap.get(controlId);
      if (!lookup) return;
      updateControl.mutate({
        engagementId,
        riskId: lookup.riskId,
        controlId,
        data: { effectiveness: value || null },
      });
    },
    [updateControl, controlMap, engagementId],
  );

  // ── Reorder handlers ──

  const handleReorderRows = useCallback(
    (activeId: string, overId: string) => {
      // Check objectives
      const objIdx = rcmObjectives.findIndex((o) => o.id === activeId);
      const objOverIdx = rcmObjectives.findIndex((o) => o.id === overId);
      if (objIdx !== -1 && objOverIdx !== -1 && objIdx !== objOverIdx) {
        const reordered = [...rcmObjectives];
        const [moved] = reordered.splice(objIdx, 1);
        reordered.splice(objOverIdx, 0, moved);
        reorderItems.mutate({
          engagementId,
          entityType: 'rcm_objective',
          items: reordered.map((o, i) => ({ id: o.id, sortOrder: i })),
        });
        return;
      }
      // Check risks within each objective
      for (const obj of rcmObjectives) {
        const rIdx = obj.risks.findIndex((r) => r.id === activeId);
        const rOverIdx = obj.risks.findIndex((r) => r.id === overId);
        if (rIdx !== -1 && rOverIdx !== -1 && rIdx !== rOverIdx) {
          const reordered = [...obj.risks];
          const [moved] = reordered.splice(rIdx, 1);
          reordered.splice(rOverIdx, 0, moved);
          reorderItems.mutate({
            engagementId,
            entityType: 'risk',
            items: reordered.map((r, i) => ({ id: r.id, sortOrder: i })),
          });
          return;
        }
        // Check controls within each risk
        for (const risk of obj.risks) {
          const cIdx = risk.controls.findIndex((c) => c.id === activeId);
          const cOverIdx = risk.controls.findIndex((c) => c.id === overId);
          if (cIdx !== -1 && cOverIdx !== -1 && cIdx !== cOverIdx) {
            const reordered = [...risk.controls];
            const [moved] = reordered.splice(cIdx, 1);
            reordered.splice(cOverIdx, 0, moved);
            reorderItems.mutate({
              engagementId,
              entityType: 'control',
              items: reordered.map((c, i) => ({ id: c.id, sortOrder: i })),
            });
            return;
          }
        }
      }
    },
    [rcmObjectives, engagementId, reorderItems],
  );

  const handleMoveToTop = useCallback(
    (rowId: string, rowType: 'objective' | 'risk' | 'control') => {
      if (rowType === 'objective') {
        const idx = rcmObjectives.findIndex((o) => o.id === rowId);
        if (idx <= 0) return;
        const reordered = [...rcmObjectives];
        const [moved] = reordered.splice(idx, 1);
        reordered.unshift(moved);
        reorderItems.mutate({
          engagementId,
          entityType: 'rcm_objective',
          items: reordered.map((o, i) => ({ id: o.id, sortOrder: i })),
        });
        return;
      }
      if (rowType === 'risk') {
        for (const obj of rcmObjectives) {
          const idx = obj.risks.findIndex((r) => r.id === rowId);
          if (idx <= 0) continue;
          const reordered = [...obj.risks];
          const [moved] = reordered.splice(idx, 1);
          reordered.unshift(moved);
          reorderItems.mutate({
            engagementId,
            entityType: 'risk',
            items: reordered.map((r, i) => ({ id: r.id, sortOrder: i })),
          });
          return;
        }
      }
      if (rowType === 'control') {
        for (const obj of rcmObjectives) {
          for (const risk of obj.risks) {
            const idx = risk.controls.findIndex((c) => c.id === rowId);
            if (idx <= 0) continue;
            const reordered = [...risk.controls];
            const [moved] = reordered.splice(idx, 1);
            reordered.unshift(moved);
            reorderItems.mutate({
              engagementId,
              entityType: 'control',
              items: reordered.map((c, i) => ({ id: c.id, sortOrder: i })),
            });
            return;
          }
        }
      }
    },
    [rcmObjectives, engagementId, reorderItems],
  );

  // Computed delete dialog text
  const deleteTitle =
    state.deleteTarget?.type === "objective"
      ? "Xóa mục tiêu"
      : state.deleteTarget?.type === "risk"
        ? LR.deleteTitle
        : "Xóa kiểm soát";

  const deleteDesc =
    state.deleteTarget?.type === "objective"
      ? `Bạn có chắc chắn muốn xóa mục tiêu "${state.deleteTarget?.title ?? ""}"? Các rủi ro và kiểm soát liên quan sẽ bị xóa.`
      : state.deleteTarget?.type === "risk"
        ? LR.deleteDescription(state.deleteTarget?.title ?? "")
        : `Bạn có chắc chắn muốn xóa kiểm soát "${state.deleteTarget?.title ?? ""}"?`;

  return {
    state,
    dispatch,
    textRef,
    handleTextChange,
    treeData,
    objectiveMap,
    riskMap,
    controlMap,
    // Handlers
    handleAddObjective,
    handleUpdateObjective,
    handleAddRisk,
    handleAddControl,
    handleUpdateRisk,
    handleUpdateControl,
    handleConfirmDelete,
    handleRiskRatingChange,
    handleEffectivenessChange,
    // Sync
    syncObj,
    // Delete dialog
    deleteTitle,
    deleteDesc,
    isDeleting:
      deleteObj.isPending || deleteRisk.isPending || deleteControl.isPending,
    // Loading states for inline forms
    isCreatingObjective: createObj.isPending,
    isUpdatingObjective: updateObj.isPending,
    isCreatingRisk: createRisk.isPending,
    isUpdatingRisk: updateRisk.isPending,
    isCreatingControl: createControl.isPending,
    isUpdatingControl: updateControl.isPending,
    // Reorder
    handleReorderRows,
    handleMoveToTop,
  };
}

export type RcmEditor = ReturnType<typeof useRcmEditor>;
