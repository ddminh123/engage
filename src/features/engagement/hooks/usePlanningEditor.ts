"use client";

import { useReducer, useCallback, useState, useRef, useMemo } from "react";
import {
  useCreateAuditObjective,
  useUpdateAuditObjective,
  useDeleteAuditObjective,
  useCreateEngagementRisk,
  useUpdateEngagementRisk,
  useDeleteEngagementRisk,
  useCreateEngagementControl,
  useUpdateEngagementControl,
  useDeleteEngagementControl,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useCreateObjective,
  useUpdateObjective,
  useDeleteObjective,
  useCreateProcedure,
  useUpdateProcedure,
  useDeleteProcedure,
  useReorderItems,
} from "./useEngagements";
import type {
  EngagementDetail,
  EngagementRisk,
  EngagementControl,
  ProcedureInput,
} from "../types";

// ── State ──

export interface PlanningState {
  // Objective
  addingObjective: boolean;
  addingObjectiveTitle: string;
  editingObjectiveId: string | null;
  editingObjectiveTitle: string;
  // Risk
  addingRisk: boolean;
  addingRiskDesc: string;
  addingRiskRating: string;
  addingRiskObjectiveId: string;
  editingRiskId: string | null;
  editingRiskDesc: string;
  editingRiskRating: string;
  editingRiskObjectiveId: string;
  // Control
  addingControlForRiskId: string | null;
  addingControlDesc: string;
  addingControlEffectiveness: string;
  editingControlId: string | null;
  editingControlDesc: string;
  editingControlEffectiveness: string;
  editingControlRiskId: string | null;
  // Work Program (Section / WP Objective / Procedure)
  addingSection: boolean;
  addingSectionTitle: string;
  editingSectionId: string | null;
  editingSectionTitle: string;
  addingWpObjForSectionId: string | null;
  addingWpObjTitle: string;
  editingWpObjId: string | null;
  editingWpObjTitle: string;
  addingProcForKey: string | null; // "sec:{id}" or "obj:{id}"
  addingProcTitle: string;
  editingProcId: string | null;
  editingProcTitle: string;
  // Delete
  deleteTarget: { type: "objective" | "risk" | "control" | "section" | "wp_objective" | "procedure"; id: string; riskId?: string; title: string } | null;
}

const initialState: PlanningState = {
  addingObjective: false,
  addingObjectiveTitle: "",
  editingObjectiveId: null,
  editingObjectiveTitle: "",
  addingRisk: false,
  addingRiskDesc: "",
  addingRiskRating: "",
  addingRiskObjectiveId: "",
  editingRiskId: null,
  editingRiskDesc: "",
  editingRiskRating: "",
  editingRiskObjectiveId: "",
  addingControlForRiskId: null,
  addingControlDesc: "",
  addingControlEffectiveness: "",
  editingControlId: null,
  editingControlDesc: "",
  editingControlEffectiveness: "",
  editingControlRiskId: null,
  addingSection: false,
  addingSectionTitle: "",
  editingSectionId: null,
  editingSectionTitle: "",
  addingWpObjForSectionId: null,
  addingWpObjTitle: "",
  editingWpObjId: null,
  editingWpObjTitle: "",
  addingProcForKey: null,
  addingProcTitle: "",
  editingProcId: null,
  editingProcTitle: "",
  deleteTarget: null,
};

// ── Actions ──

export type PlanningAction =
  // Objective
  | { type: "START_ADD_OBJECTIVE" }
  | { type: "SET_OBJECTIVE_TITLE"; title: string }
  | { type: "CANCEL_ADD_OBJECTIVE" }
  | { type: "START_EDIT_OBJECTIVE"; id: string; title: string }
  | { type: "SET_EDITING_OBJECTIVE_TITLE"; title: string }
  | { type: "CANCEL_EDIT_OBJECTIVE" }
  // Risk
  | { type: "START_ADD_RISK"; objectiveId?: string }
  | { type: "SET_ADD_RISK_DESC"; value: string }
  | { type: "SET_ADD_RISK_RATING"; value: string }
  | { type: "SET_ADD_RISK_OBJECTIVE_ID"; value: string }
  | { type: "CANCEL_ADD_RISK" }
  | { type: "START_EDIT_RISK"; risk: EngagementRisk }
  | { type: "SET_EDIT_RISK_DESC"; value: string }
  | { type: "SET_EDIT_RISK_RATING"; value: string }
  | { type: "SET_EDIT_RISK_OBJECTIVE_ID"; value: string }
  | { type: "CANCEL_EDIT_RISK" }
  // Control
  | { type: "START_ADD_CONTROL"; riskId: string }
  | { type: "SET_ADD_CONTROL_DESC"; value: string }
  | { type: "SET_ADD_CONTROL_EFFECTIVENESS"; value: string }
  | { type: "CANCEL_ADD_CONTROL" }
  | { type: "START_EDIT_CONTROL"; control: EngagementControl; riskId: string }
  | { type: "SET_EDIT_CONTROL_DESC"; value: string }
  | { type: "SET_EDIT_CONTROL_EFFECTIVENESS"; value: string }
  | { type: "CANCEL_EDIT_CONTROL" }
  // Section
  | { type: "START_ADD_SECTION" }
  | { type: "SET_SECTION_TITLE"; title: string }
  | { type: "CANCEL_ADD_SECTION" }
  | { type: "START_EDIT_SECTION"; id: string; title: string }
  | { type: "SET_EDITING_SECTION_TITLE"; title: string }
  | { type: "CANCEL_EDIT_SECTION" }
  // WP Objective
  | { type: "START_ADD_WP_OBJ"; sectionId: string }
  | { type: "SET_WP_OBJ_TITLE"; title: string }
  | { type: "CANCEL_ADD_WP_OBJ" }
  | { type: "START_EDIT_WP_OBJ"; id: string; title: string }
  | { type: "SET_EDITING_WP_OBJ_TITLE"; title: string }
  | { type: "CANCEL_EDIT_WP_OBJ" }
  // Procedure
  | { type: "START_ADD_PROCEDURE"; key: string } // "sec:{id}" or "obj:{id}"
  | { type: "SET_PROC_TITLE"; title: string }
  | { type: "CANCEL_ADD_PROCEDURE" }
  | { type: "START_EDIT_PROCEDURE"; id: string; title: string }
  | { type: "SET_EDITING_PROC_TITLE"; title: string }
  | { type: "CANCEL_EDIT_PROCEDURE" }
  // Delete
  | { type: "SET_DELETE_TARGET"; target: PlanningState["deleteTarget"] }
  | { type: "CLEAR_DELETE_TARGET" };

function reducer(state: PlanningState, action: PlanningAction): PlanningState {
  switch (action.type) {
    // Objective
    case "START_ADD_OBJECTIVE":
      return { ...state, addingObjective: true, addingObjectiveTitle: "" };
    case "SET_OBJECTIVE_TITLE":
      return { ...state, addingObjectiveTitle: action.title };
    case "CANCEL_ADD_OBJECTIVE":
      return { ...state, addingObjective: false, addingObjectiveTitle: "" };
    case "START_EDIT_OBJECTIVE":
      return { ...state, editingObjectiveId: action.id, editingObjectiveTitle: action.title };
    case "SET_EDITING_OBJECTIVE_TITLE":
      return { ...state, editingObjectiveTitle: action.title };
    case "CANCEL_EDIT_OBJECTIVE":
      return { ...state, editingObjectiveId: null, editingObjectiveTitle: "" };
    // Risk
    case "START_ADD_RISK":
      return { ...state, addingRisk: true, addingRiskDesc: "", addingRiskRating: "", addingRiskObjectiveId: action.objectiveId ?? "" };
    case "SET_ADD_RISK_DESC":
      return { ...state, addingRiskDesc: action.value };
    case "SET_ADD_RISK_RATING":
      return { ...state, addingRiskRating: action.value };
    case "SET_ADD_RISK_OBJECTIVE_ID":
      return { ...state, addingRiskObjectiveId: action.value };
    case "CANCEL_ADD_RISK":
      return { ...state, addingRisk: false, addingRiskDesc: "", addingRiskRating: "", addingRiskObjectiveId: "" };
    case "START_EDIT_RISK":
      return {
        ...state,
        editingRiskId: action.risk.id,
        editingRiskDesc: action.risk.riskDescription,
        editingRiskRating: action.risk.riskRating ?? "",
        editingRiskObjectiveId: action.risk.rcmObjectiveId ?? "",
      };
    case "SET_EDIT_RISK_DESC":
      return { ...state, editingRiskDesc: action.value };
    case "SET_EDIT_RISK_RATING":
      return { ...state, editingRiskRating: action.value };
    case "SET_EDIT_RISK_OBJECTIVE_ID":
      return { ...state, editingRiskObjectiveId: action.value };
    case "CANCEL_EDIT_RISK":
      return { ...state, editingRiskId: null, editingRiskDesc: "", editingRiskRating: "", editingRiskObjectiveId: "" };
    // Control
    case "START_ADD_CONTROL":
      return { ...state, addingControlForRiskId: action.riskId, addingControlDesc: "", addingControlEffectiveness: "" };
    case "SET_ADD_CONTROL_DESC":
      return { ...state, addingControlDesc: action.value };
    case "SET_ADD_CONTROL_EFFECTIVENESS":
      return { ...state, addingControlEffectiveness: action.value };
    case "CANCEL_ADD_CONTROL":
      return { ...state, addingControlForRiskId: null, addingControlDesc: "", addingControlEffectiveness: "" };
    case "START_EDIT_CONTROL":
      return {
        ...state,
        editingControlId: action.control.id,
        editingControlDesc: action.control.description,
        editingControlEffectiveness: action.control.effectiveness ?? "",
        editingControlRiskId: action.riskId,
      };
    case "SET_EDIT_CONTROL_DESC":
      return { ...state, editingControlDesc: action.value };
    case "SET_EDIT_CONTROL_EFFECTIVENESS":
      return { ...state, editingControlEffectiveness: action.value };
    case "CANCEL_EDIT_CONTROL":
      return { ...state, editingControlId: null, editingControlDesc: "", editingControlEffectiveness: "", editingControlRiskId: null };
    // Section
    case "START_ADD_SECTION":
      return { ...state, addingSection: true, addingSectionTitle: "" };
    case "SET_SECTION_TITLE":
      return { ...state, addingSectionTitle: action.title };
    case "CANCEL_ADD_SECTION":
      return { ...state, addingSection: false, addingSectionTitle: "" };
    case "START_EDIT_SECTION":
      return { ...state, editingSectionId: action.id, editingSectionTitle: action.title };
    case "SET_EDITING_SECTION_TITLE":
      return { ...state, editingSectionTitle: action.title };
    case "CANCEL_EDIT_SECTION":
      return { ...state, editingSectionId: null, editingSectionTitle: "" };
    // WP Objective
    case "START_ADD_WP_OBJ":
      return { ...state, addingWpObjForSectionId: action.sectionId, addingWpObjTitle: "" };
    case "SET_WP_OBJ_TITLE":
      return { ...state, addingWpObjTitle: action.title };
    case "CANCEL_ADD_WP_OBJ":
      return { ...state, addingWpObjForSectionId: null, addingWpObjTitle: "" };
    case "START_EDIT_WP_OBJ":
      return { ...state, editingWpObjId: action.id, editingWpObjTitle: action.title };
    case "SET_EDITING_WP_OBJ_TITLE":
      return { ...state, editingWpObjTitle: action.title };
    case "CANCEL_EDIT_WP_OBJ":
      return { ...state, editingWpObjId: null, editingWpObjTitle: "" };
    // Procedure
    case "START_ADD_PROCEDURE":
      return { ...state, addingProcForKey: action.key, addingProcTitle: "" };
    case "SET_PROC_TITLE":
      return { ...state, addingProcTitle: action.title };
    case "CANCEL_ADD_PROCEDURE":
      return { ...state, addingProcForKey: null, addingProcTitle: "" };
    case "START_EDIT_PROCEDURE":
      return { ...state, editingProcId: action.id, editingProcTitle: action.title };
    case "SET_EDITING_PROC_TITLE":
      return { ...state, editingProcTitle: action.title };
    case "CANCEL_EDIT_PROCEDURE":
      return { ...state, editingProcId: null, editingProcTitle: "" };
    // Delete
    case "SET_DELETE_TARGET":
      return { ...state, deleteTarget: action.target };
    case "CLEAR_DELETE_TARGET":
      return { ...state, deleteTarget: null };
    default:
      return state;
  }
}

// ── Hook ──

export function usePlanningEditor(engagement: EngagementDetail) {
  // Track if this is the first load of this engagement to collapse all sections
  const isFirstLoadRef = useRef(true);
  const engagementIdRef = useRef(engagement.id);

  // Reset first load flag if engagement changes
  if (engagementIdRef.current !== engagement.id) {
    engagementIdRef.current = engagement.id;
    isFirstLoadRef.current = true;
  }

  // Collapse state managed separately to persist across tab switches
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return new Set(["scope", "objectives", "understanding", "racm", "racm_table", "procedures"]);
    }
    return new Set();
  });

  const [state, dispatch] = useReducer(reducer, initialState);

  const createObjective = useCreateAuditObjective();
  const updateObjective = useUpdateAuditObjective();
  const deleteObjective = useDeleteAuditObjective();
  const createRisk = useCreateEngagementRisk();
  const updateRisk = useUpdateEngagementRisk();
  const deleteRisk = useDeleteEngagementRisk();
  const createControl = useCreateEngagementControl();
  const updateControl = useUpdateEngagementControl();
  const deleteControl = useDeleteEngagementControl();
  const createProc = useCreateProcedure();
  const updateProc = useUpdateProcedure();
  const deleteProc = useDeleteProcedure();
  const reorderItems = useReorderItems();

  // ── Objective handlers ──

  const handleAddObjective = useCallback(() => {
    const title = state.addingObjectiveTitle.trim();
    if (!title) return;
    createObjective.mutate(
      { engagementId: engagement.id, data: { title } },
      { onSuccess: () => dispatch({ type: "CANCEL_ADD_OBJECTIVE" }) },
    );
  }, [state.addingObjectiveTitle, createObjective, engagement.id]);

  const handleUpdateObjective = useCallback(
    (id: string) => {
      const title = state.editingObjectiveTitle.trim();
      if (!title) return;
      updateObjective.mutate(
        { engagementId: engagement.id, objectiveId: id, data: { title } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT_OBJECTIVE" }) },
      );
    },
    [state.editingObjectiveTitle, updateObjective, engagement.id],
  );

  const handleDeleteObjective = useCallback(
    (id: string) => {
      deleteObjective.mutate(
        { engagementId: engagement.id, objectiveId: id },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE_TARGET" }) },
      );
    },
    [deleteObjective, engagement.id],
  );

  // ── Risk handlers ──

  const handleAddRisk = useCallback(() => {
    const riskDescription = state.addingRiskDesc.trim();
    if (!riskDescription) return;
    createRisk.mutate(
      {
        engagementId: engagement.id,
        data: {
          riskDescription,
          riskRating: state.addingRiskRating || null,
          rcmObjectiveId: state.addingRiskObjectiveId || null,
        },
      },
      { onSuccess: () => dispatch({ type: "CANCEL_ADD_RISK" }) },
    );
  }, [state.addingRiskDesc, state.addingRiskRating, state.addingRiskObjectiveId, createRisk, engagement.id]);

  const handleUpdateRisk = useCallback(
    (id: string) => {
      const riskDescription = state.editingRiskDesc.trim();
      if (!riskDescription) return;
      updateRisk.mutate(
        {
          engagementId: engagement.id,
          riskId: id,
          data: {
            riskDescription,
            riskRating: state.editingRiskRating || null,
            rcmObjectiveId: state.editingRiskObjectiveId || null,
          },
        },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT_RISK" }) },
      );
    },
    [state.editingRiskDesc, state.editingRiskRating, state.editingRiskObjectiveId, updateRisk, engagement.id],
  );

  const handleDeleteRisk = useCallback(
    (id: string) => {
      deleteRisk.mutate(
        { engagementId: engagement.id, riskId: id },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE_TARGET" }) },
      );
    },
    [deleteRisk, engagement.id],
  );

  // ── Control handlers ──

  const handleAddControl = useCallback(
    (riskId: string) => {
      const description = state.addingControlDesc.trim();
      if (!description) return;
      createControl.mutate(
        {
          engagementId: engagement.id,
          data: {
            description,
            effectiveness: state.addingControlEffectiveness || null,
          },
          linkToRiskId: riskId,
        },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD_CONTROL" }) },
      );
    },
    [state.addingControlDesc, state.addingControlEffectiveness, createControl, engagement.id],
  );

  const handleUpdateControl = useCallback(
    (controlId: string, riskId: string) => {
      const description = state.editingControlDesc.trim();
      if (!description) return;
      updateControl.mutate(
        {
          engagementId: engagement.id,
          controlId,
          data: {
            description,
            effectiveness: state.editingControlEffectiveness || null,
          },
        },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT_CONTROL" }) },
      );
    },
    [state.editingControlDesc, state.editingControlEffectiveness, updateControl, engagement.id],
  );

  const handleDeleteControl = useCallback(
    (controlId: string, riskId: string) => {
      deleteControl.mutate(
        { engagementId: engagement.id, controlId },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE_TARGET" }) },
      );
    },
    [deleteControl, engagement.id],
  );

  // ── Section handlers ──

  const createSec = useCreateSection();
  const updateSec = useUpdateSection();
  const deleteSec = useDeleteSection();
  const createWpObj = useCreateObjective();
  const updateWpObj = useUpdateObjective();
  const deleteWpObj = useDeleteObjective();

  const handleAddSection = useCallback(() => {
    const title = state.addingSectionTitle.trim();
    if (!title) return;
    createSec.mutate(
      { engagementId: engagement.id, data: { title, addedFrom: "planning" } },
      { onSuccess: () => dispatch({ type: "CANCEL_ADD_SECTION" }) },
    );
  }, [state.addingSectionTitle, createSec, engagement.id]);

  const handleUpdateSection = useCallback(
    (id: string) => {
      const title = state.editingSectionTitle.trim();
      if (!title) return;
      updateSec.mutate(
        { engagementId: engagement.id, sectionId: id, data: { title } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT_SECTION" }) },
      );
    },
    [state.editingSectionTitle, updateSec, engagement.id],
  );

  const handleDeleteSection = useCallback(
    (id: string) => {
      deleteSec.mutate(
        { engagementId: engagement.id, sectionId: id },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE_TARGET" }) },
      );
    },
    [deleteSec, engagement.id],
  );

  // ── WP Objective handlers ──

  const handleAddWpObjective = useCallback(
    (sectionId: string) => {
      const title = state.addingWpObjTitle.trim();
      if (!title) return;
      createWpObj.mutate(
        { engagementId: engagement.id, sectionId, data: { title, addedFrom: "planning" } },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD_WP_OBJ" }) },
      );
    },
    [state.addingWpObjTitle, createWpObj, engagement.id],
  );

  const handleUpdateWpObjective = useCallback(
    (id: string) => {
      const title = state.editingWpObjTitle.trim();
      if (!title) return;
      updateWpObj.mutate(
        { engagementId: engagement.id, objectiveId: id, data: { title } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT_WP_OBJ" }) },
      );
    },
    [state.editingWpObjTitle, updateWpObj, engagement.id],
  );

  const handleDeleteWpObjective = useCallback(
    (id: string) => {
      deleteWpObj.mutate(
        { engagementId: engagement.id, objectiveId: id },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE_TARGET" }) },
      );
    },
    [deleteWpObj, engagement.id],
  );

  // ── Procedure handlers ──

  const handleAddProcedure = useCallback(
    (key: string) => {
      const title = state.addingProcTitle.trim();
      if (!title) return;
      const [prefix, id] = key.split(":");
      const data: ProcedureInput = {
        title,
        addedFrom: "planning",
        sectionId: prefix === "sec" ? id : null,
        objectiveId: prefix === "obj" ? id : null,
      };
      createProc.mutate(
        { engagementId: engagement.id, data },
        { onSuccess: () => dispatch({ type: "CANCEL_ADD_PROCEDURE" }) },
      );
    },
    [state.addingProcTitle, createProc, engagement.id],
  );

  const handleUpdateProcedure = useCallback(
    (id: string) => {
      const title = state.editingProcTitle.trim();
      if (!title) return;
      updateProc.mutate(
        { engagementId: engagement.id, procedureId: id, data: { title } },
        { onSuccess: () => dispatch({ type: "CANCEL_EDIT_PROCEDURE" }) },
      );
    },
    [state.editingProcTitle, updateProc, engagement.id],
  );

  const handleDeleteProcedure = useCallback(
    (id: string) => {
      deleteProc.mutate(
        { engagementId: engagement.id, procedureId: id },
        { onSuccess: () => dispatch({ type: "CLEAR_DELETE_TARGET" }) },
      );
    },
    [deleteProc, engagement.id],
  );

  // ── Collapse state helpers ──

  const toggleCollapse = useCallback((key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setCollapsed(new Set());
  }, []);

  const collapseAll = useCallback((keys: string[]) => {
    setCollapsed(new Set(keys));
  }, []);

  // ── Reorder handlers ──

  const handleReorderAuditObjectives = useCallback(
    (activeId: string, overId: string) => {
      const items = engagement.auditObjectives;
      const oldIdx = items.findIndex((i) => i.id === activeId);
      const newIdx = items.findIndex((i) => i.id === overId);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;
      const reordered = [...items];
      const [moved] = reordered.splice(oldIdx, 1);
      reordered.splice(newIdx, 0, moved);
      reorderItems.mutate({
        engagementId: engagement.id,
        entityType: 'audit_objective',
        items: reordered.map((item, idx) => ({ id: item.id, sortOrder: idx })),
      });
    },
    [engagement.auditObjectives, engagement.id, reorderItems],
  );

  const handleMoveToTopAuditObjective = useCallback(
    (id: string) => {
      const items = engagement.auditObjectives;
      const idx = items.findIndex((i) => i.id === id);
      if (idx <= 0) return;
      const reordered = [...items];
      const [moved] = reordered.splice(idx, 1);
      reordered.unshift(moved);
      reorderItems.mutate({
        engagementId: engagement.id,
        entityType: 'audit_objective',
        items: reordered.map((item, i) => ({ id: item.id, sortOrder: i })),
      });
    },
    [engagement.auditObjectives, engagement.id, reorderItems],
  );

  // ── Confirm delete dispatch ──

  const handleConfirmDelete = useCallback(() => {
    const t = state.deleteTarget;
    if (!t) return;
    if (t.type === "objective") handleDeleteObjective(t.id);
    else if (t.type === "risk") handleDeleteRisk(t.id);
    else if (t.type === "control") handleDeleteControl(t.id, t.riskId!);
    else if (t.type === "section") handleDeleteSection(t.id);
    else if (t.type === "wp_objective") handleDeleteWpObjective(t.id);
    else if (t.type === "procedure") handleDeleteProcedure(t.id);
  }, [state.deleteTarget, handleDeleteObjective, handleDeleteRisk, handleDeleteControl, handleDeleteSection, handleDeleteWpObjective, handleDeleteProcedure]);

  return {
    state,
    dispatch,
    collapsed,
    toggleCollapse,
    expandAll,
    collapseAll,
    handleAddObjective,
    handleUpdateObjective,
    handleAddRisk,
    handleUpdateRisk,
    handleAddControl,
    handleUpdateControl,
    handleAddSection,
    handleUpdateSection,
    handleAddWpObjective,
    handleUpdateWpObjective,
    handleAddProcedure,
    handleUpdateProcedure,
    handleConfirmDelete,
    handleReorderAuditObjectives,
    handleMoveToTopAuditObjective,
    reorderItems,
  };
}
