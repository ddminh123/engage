"use client";

import * as React from "react";
import {
  useCreateEngagementRisk,
  useUpdateEngagementRisk,
  useDeleteEngagementRisk,
  useCreateEngagementControl,
  useUpdateEngagementControl,
  useDeleteEngagementControl,
  useLinkControlToRisk,
  useUnlinkControlFromRisk,
  useCreateRcmObjective,
  useUpdateRcmObjective,
  useDeleteRcmObjective,
  useSyncRcmObjectives,
  useReorderItems,
} from "../../hooks/useEngagements";
import type {
  RcmObjective,
  EngagementRisk,
  EngagementControl,
} from "../../types";

interface UseRcmTableProps {
  engagementId: string;
  rcmObjectives: RcmObjective[];
  controls: EngagementControl[];
}

// State for inline editing
interface RcmTableState {
  // Adding
  addingRiskForObjectiveId: string | null;
  addingRiskDesc: string;
  addingRiskRating: string;
  addingControlForRiskId: string | null;
  addingControlDesc: string;
  addingObjectiveTitle: string;
  showAddObjective: boolean;
  // Editing objective inline
  editingObjectiveId: string | null;
  editingObjectiveTitle: string;
  // Delete confirmation
  deleteTarget: {
    type: "objective" | "risk" | "control";
    id: string;
    title: string;
  } | null;
  // Unlink confirmation
  unlinkTarget: {
    riskId: string;
    controlId: string;
    controlTitle: string;
  } | null;
  // Collapsed objectives
  collapsedObjectives: Set<string>;
  // Risk/Control workpaper overlay
  openRiskId: string | null;
  openControlId: string | null;
  // Control linking popover
  linkingControlForRiskId: string | null;
  // Catalog picker
  catalogPickerOpen: boolean;
  catalogPickerType: "risk" | "control" | null;
  catalogPickerTargetObjectiveId: string | null;
  catalogPickerTargetRiskId: string | null;
}

type RcmTableAction =
  | { type: "START_ADD_RISK"; objectiveId: string }
  | { type: "SET_ADD_RISK_DESC"; value: string }
  | { type: "SET_ADD_RISK_RATING"; value: string }
  | { type: "CANCEL_ADD_RISK" }
  | { type: "START_ADD_CONTROL"; riskId: string }
  | { type: "SET_ADD_CONTROL_DESC"; value: string }
  | { type: "CANCEL_ADD_CONTROL" }
  | { type: "START_ADD_OBJECTIVE" }
  | { type: "SET_ADD_OBJECTIVE_TITLE"; value: string }
  | { type: "CANCEL_ADD_OBJECTIVE" }
  | { type: "START_EDIT_OBJECTIVE"; id: string; title: string }
  | { type: "SET_EDIT_OBJECTIVE_TITLE"; value: string }
  | { type: "CANCEL_EDIT_OBJECTIVE" }
  | { type: "SET_DELETE"; target: RcmTableState["deleteTarget"] }
  | { type: "CLEAR_DELETE" }
  | { type: "SET_UNLINK"; target: RcmTableState["unlinkTarget"] }
  | { type: "CLEAR_UNLINK" }
  | { type: "TOGGLE_COLLAPSE"; objectiveId: string }
  | { type: "OPEN_RISK"; riskId: string }
  | { type: "CLOSE_RISK" }
  | { type: "OPEN_CONTROL"; controlId: string }
  | { type: "CLOSE_CONTROL" }
  | { type: "START_LINK_CONTROL"; riskId: string }
  | { type: "CANCEL_LINK_CONTROL" }
  | { type: "OPEN_CATALOG_PICKER"; pickerType: "risk" | "control"; objectiveId?: string; riskId?: string }
  | { type: "CLOSE_CATALOG_PICKER" };

const initialState: RcmTableState = {
  addingRiskForObjectiveId: null,
  addingRiskDesc: "",
  addingRiskRating: "",
  addingControlForRiskId: null,
  addingControlDesc: "",
  addingObjectiveTitle: "",
  showAddObjective: false,
  editingObjectiveId: null,
  editingObjectiveTitle: "",
  deleteTarget: null,
  unlinkTarget: null,
  collapsedObjectives: new Set(),
  openRiskId: null,
  openControlId: null,
  linkingControlForRiskId: null,
  catalogPickerOpen: false,
  catalogPickerType: null,
  catalogPickerTargetObjectiveId: null,
  catalogPickerTargetRiskId: null,
};

function reducer(state: RcmTableState, action: RcmTableAction): RcmTableState {
  switch (action.type) {
    case "START_ADD_RISK":
      return { ...state, addingRiskForObjectiveId: action.objectiveId, addingRiskDesc: "", addingRiskRating: "", addingControlForRiskId: null, addingControlDesc: "" };
    case "SET_ADD_RISK_DESC":
      return { ...state, addingRiskDesc: action.value };
    case "SET_ADD_RISK_RATING":
      return { ...state, addingRiskRating: action.value };
    case "CANCEL_ADD_RISK":
      return { ...state, addingRiskForObjectiveId: null, addingRiskDesc: "", addingRiskRating: "" };
    case "START_ADD_CONTROL":
      return { ...state, addingControlForRiskId: action.riskId, addingControlDesc: "", addingRiskForObjectiveId: null, addingRiskDesc: "" };
    case "SET_ADD_CONTROL_DESC":
      return { ...state, addingControlDesc: action.value };
    case "CANCEL_ADD_CONTROL":
      return { ...state, addingControlForRiskId: null, addingControlDesc: "" };
    case "START_ADD_OBJECTIVE":
      return { ...state, showAddObjective: true, addingObjectiveTitle: "" };
    case "SET_ADD_OBJECTIVE_TITLE":
      return { ...state, addingObjectiveTitle: action.value };
    case "CANCEL_ADD_OBJECTIVE":
      return { ...state, showAddObjective: false, addingObjectiveTitle: "" };
    case "START_EDIT_OBJECTIVE":
      return { ...state, editingObjectiveId: action.id, editingObjectiveTitle: action.title };
    case "SET_EDIT_OBJECTIVE_TITLE":
      return { ...state, editingObjectiveTitle: action.value };
    case "CANCEL_EDIT_OBJECTIVE":
      return { ...state, editingObjectiveId: null, editingObjectiveTitle: "" };
    case "SET_DELETE":
      return { ...state, deleteTarget: action.target };
    case "CLEAR_DELETE":
      return { ...state, deleteTarget: null };
    case "SET_UNLINK":
      return { ...state, unlinkTarget: action.target };
    case "CLEAR_UNLINK":
      return { ...state, unlinkTarget: null };
    case "TOGGLE_COLLAPSE": {
      const next = new Set(state.collapsedObjectives);
      if (next.has(action.objectiveId)) next.delete(action.objectiveId);
      else next.add(action.objectiveId);
      return { ...state, collapsedObjectives: next };
    }
    case "OPEN_RISK":
      return { ...state, openRiskId: action.riskId };
    case "CLOSE_RISK":
      return { ...state, openRiskId: null };
    case "OPEN_CONTROL":
      return { ...state, openControlId: action.controlId };
    case "CLOSE_CONTROL":
      return { ...state, openControlId: null };
    case "START_LINK_CONTROL":
      return { ...state, linkingControlForRiskId: action.riskId };
    case "CANCEL_LINK_CONTROL":
      return { ...state, linkingControlForRiskId: null };
    case "OPEN_CATALOG_PICKER":
      return {
        ...state,
        catalogPickerOpen: true,
        catalogPickerType: action.pickerType,
        catalogPickerTargetObjectiveId: action.objectiveId ?? null,
        catalogPickerTargetRiskId: action.riskId ?? null,
      };
    case "CLOSE_CATALOG_PICKER":
      return {
        ...state,
        catalogPickerOpen: false,
        catalogPickerType: null,
        catalogPickerTargetObjectiveId: null,
        catalogPickerTargetRiskId: null,
      };
    default:
      return state;
  }
}

export function useRcmTable({ engagementId, rcmObjectives, controls }: UseRcmTableProps) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // Mutations
  const createRisk = useCreateEngagementRisk();
  const updateRisk = useUpdateEngagementRisk();
  const deleteRisk = useDeleteEngagementRisk();
  const createControl = useCreateEngagementControl();
  const updateControl = useUpdateEngagementControl();
  const deleteControl = useDeleteEngagementControl();
  const linkControl = useLinkControlToRisk();
  const unlinkControl = useUnlinkControlFromRisk();
  const createObjective = useCreateRcmObjective();
  const updateObjective = useUpdateRcmObjective();
  const deleteObjective = useDeleteRcmObjective();
  const syncObjectives = useSyncRcmObjectives();
  const reorderItems = useReorderItems();

  // Lookup maps
  const riskMap = React.useMemo(() => {
    const map = new Map<string, EngagementRisk>();
    for (const obj of rcmObjectives) {
      for (const risk of obj.risks) {
        map.set(risk.id, risk);
      }
    }
    return map;
  }, [rcmObjectives]);

  const controlMap = React.useMemo(() => {
    const map = new Map<string, EngagementControl>();
    for (const c of controls) {
      map.set(c.id, c);
    }
    return map;
  }, [controls]);

  // Currently open risk/control for workpaper overlay
  const openRisk = state.openRiskId ? riskMap.get(state.openRiskId) ?? null : null;
  const openControl = state.openControlId ? controlMap.get(state.openControlId) ?? null : null;

  // Available controls for linking (not already linked to the target risk)
  const availableControlsForRisk = React.useCallback(
    (riskId: string) => {
      const risk = riskMap.get(riskId);
      if (!risk) return controls;
      const linkedIds = new Set(risk.controls.map((c) => c.id));
      return controls.filter((c) => !linkedIds.has(c.id));
    },
    [riskMap, controls],
  );

  // ── Handlers ──

  const handleAddRisk = React.useCallback(() => {
    if (!state.addingRiskDesc.trim() || !state.addingRiskForObjectiveId) return;
    createRisk.mutate(
      {
        engagementId,
        data: {
          rcmObjectiveId: state.addingRiskForObjectiveId,
          riskDescription: state.addingRiskDesc.trim(),
          riskRating: state.addingRiskRating || null,
        },
      },
      { onSuccess: () => dispatch({ type: "CANCEL_ADD_RISK" }) },
    );
  }, [state.addingRiskDesc, state.addingRiskRating, state.addingRiskForObjectiveId, engagementId, createRisk]);

  const handleAddControl = React.useCallback(() => {
    if (!state.addingControlDesc.trim() || !state.addingControlForRiskId) return;
    createControl.mutate(
      {
        engagementId,
        data: { description: state.addingControlDesc.trim() },
        linkToRiskId: state.addingControlForRiskId,
      },
      { onSuccess: () => dispatch({ type: "CANCEL_ADD_CONTROL" }) },
    );
  }, [state.addingControlDesc, state.addingControlForRiskId, engagementId, createControl]);

  const handleAddObjective = React.useCallback(() => {
    if (!state.addingObjectiveTitle.trim()) return;
    createObjective.mutate(
      {
        engagementId,
        data: { title: state.addingObjectiveTitle.trim() },
      },
      { onSuccess: () => dispatch({ type: "CANCEL_ADD_OBJECTIVE" }) },
    );
  }, [state.addingObjectiveTitle, engagementId, createObjective]);

  const handleUpdateObjective = React.useCallback(() => {
    if (!state.editingObjectiveId || !state.editingObjectiveTitle.trim()) return;
    updateObjective.mutate(
      {
        engagementId,
        objectiveId: state.editingObjectiveId,
        data: { title: state.editingObjectiveTitle.trim() },
      },
      { onSuccess: () => dispatch({ type: "CANCEL_EDIT_OBJECTIVE" }) },
    );
  }, [state.editingObjectiveId, state.editingObjectiveTitle, engagementId, updateObjective]);

  const handleConfirmDelete = React.useCallback(() => {
    if (!state.deleteTarget) return;
    const { type, id } = state.deleteTarget;
    const onSuccess = () => dispatch({ type: "CLEAR_DELETE" });
    if (type === "objective") {
      deleteObjective.mutate({ engagementId, objectiveId: id }, { onSuccess });
    } else if (type === "risk") {
      deleteRisk.mutate({ engagementId, riskId: id }, { onSuccess });
    } else if (type === "control") {
      deleteControl.mutate({ engagementId, controlId: id }, { onSuccess });
    }
  }, [state.deleteTarget, engagementId, deleteObjective, deleteRisk, deleteControl]);

  const handleConfirmUnlink = React.useCallback(() => {
    if (!state.unlinkTarget) return;
    unlinkControl.mutate(
      {
        engagementId,
        riskId: state.unlinkTarget.riskId,
        controlId: state.unlinkTarget.controlId,
      },
      { onSuccess: () => dispatch({ type: "CLEAR_UNLINK" }) },
    );
  }, [state.unlinkTarget, engagementId, unlinkControl]);

  const handleLinkExistingControl = React.useCallback(
    (riskId: string, controlId: string) => {
      linkControl.mutate(
        { engagementId, riskId, controlId },
        { onSuccess: () => dispatch({ type: "CANCEL_LINK_CONTROL" }) },
      );
    },
    [engagementId, linkControl],
  );

  const handleSyncObjectives = React.useCallback(() => {
    syncObjectives.mutate({ engagementId });
  }, [engagementId, syncObjectives]);

  const isDeleting = deleteObjective.isPending || deleteRisk.isPending || deleteControl.isPending;
  const isUnlinking = unlinkControl.isPending;

  return {
    state,
    dispatch,
    openRisk,
    openControl,
    riskMap,
    controlMap,
    availableControlsForRisk,
    handleAddRisk,
    handleAddControl,
    handleAddObjective,
    handleUpdateObjective,
    handleConfirmDelete,
    handleConfirmUnlink,
    handleLinkExistingControl,
    handleSyncObjectives,
    isDeleting,
    isUnlinking,
    isSyncingObjectives: syncObjectives.isPending,
    isAddingRisk: createRisk.isPending,
    isAddingControl: createControl.isPending,
    isAddingObjective: createObjective.isPending,
    isLinking: linkControl.isPending,
  };
}
