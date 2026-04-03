import { useReducer, useCallback } from "react";
import {
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useCreateObjective,
  useUpdateObjective,
  useDeleteObjective,
  useCreateProcedure,
  useUpdateProcedure,
  useDeleteProcedure,
} from "./useEngagements";
import type {
  EngagementDetail,
  EngagementSection,
  EngagementObjective,
  EngagementProcedure,
  ProcedureInput,
  ProcedureUpdateInput,
} from "../types";

// ── State ──

interface DeleteTarget {
  type: "section" | "objective" | "procedure";
  id: string;
  title: string;
}

interface EditorState {
  // Inline create
  showAddSection: boolean;
  addingSectionTitle: string;
  addingObjectiveFor: string | null; // sectionId
  addingObjectiveTitle: string;
  addingProcFor: string | null; // "obj:{id}" or "sec:{id}"
  addingProcTitle: string;
  // Inline rename
  editingId: string | null;
  editingTitle: string;
  // Full-form dialogs
  sectionFormOpen: boolean;
  editingSectionData: EngagementSection | null;
  objectiveFormOpen: boolean;
  editingObjectiveData: EngagementObjective | null;
  objectiveParentSectionId: string;
  procedureFormOpen: boolean;
  editingProcedure: EngagementProcedure | null;
  procedureParent: { sectionId?: string; objectiveId?: string };
  // Delete
  deleteTarget: DeleteTarget | null;
  // Collapse
  collapsed: Set<string>;
}

const initialState: EditorState = {
  showAddSection: false,
  addingSectionTitle: "",
  addingObjectiveFor: null,
  addingObjectiveTitle: "",
  addingProcFor: null,
  addingProcTitle: "",
  editingId: null,
  editingTitle: "",
  sectionFormOpen: false,
  editingSectionData: null,
  objectiveFormOpen: false,
  editingObjectiveData: null,
  objectiveParentSectionId: "",
  procedureFormOpen: false,
  editingProcedure: null,
  procedureParent: {},
  deleteTarget: null,
  collapsed: new Set(),
};

// ── Actions ──

type Action =
  // Inline section
  | { type: "SHOW_ADD_SECTION" }
  | { type: "HIDE_ADD_SECTION" }
  | { type: "SET_SECTION_TITLE"; title: string }
  // Inline objective
  | { type: "START_ADD_OBJECTIVE"; sectionId: string }
  | { type: "CANCEL_ADD_OBJECTIVE" }
  | { type: "SET_OBJECTIVE_TITLE"; title: string }
  // Inline procedure
  | { type: "START_ADD_PROC"; key: string }
  | { type: "CANCEL_ADD_PROC" }
  | { type: "SET_PROC_TITLE"; title: string }
  // Inline rename
  | { type: "START_EDIT"; id: string; title: string }
  | { type: "SET_EDITING_TITLE"; title: string }
  | { type: "CANCEL_EDIT" }
  // Full form: section
  | { type: "OPEN_SECTION_FORM"; section: EngagementSection | null }
  | { type: "CLOSE_SECTION_FORM" }
  // Full form: objective
  | { type: "OPEN_OBJECTIVE_FORM"; objective: EngagementObjective | null; sectionId: string }
  | { type: "CLOSE_OBJECTIVE_FORM" }
  // Full form: procedure
  | { type: "OPEN_PROCEDURE_FORM"; procedure: EngagementProcedure | null; parent: { sectionId?: string; objectiveId?: string } }
  | { type: "CLOSE_PROCEDURE_FORM" }
  // Expand inline → full form
  | { type: "EXPAND_SECTION_FORM"; title: string }
  | { type: "EXPAND_OBJECTIVE_FORM"; title: string; sectionId: string }
  | { type: "EXPAND_PROCEDURE_FORM"; title: string; parent: { sectionId?: string; objectiveId?: string } }
  // Delete
  | { type: "SET_DELETE_TARGET"; target: DeleteTarget }
  | { type: "CLEAR_DELETE_TARGET" }
  // Collapse
  | { type: "TOGGLE_COLLAPSE"; id: string }
  | { type: "COLLAPSE_ALL"; ids: string[] }
  | { type: "EXPAND_ALL" };

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    // Inline section
    case "SHOW_ADD_SECTION":
      return { ...state, showAddSection: true, addingSectionTitle: "" };
    case "HIDE_ADD_SECTION":
      return { ...state, showAddSection: false, addingSectionTitle: "" };
    case "SET_SECTION_TITLE":
      return { ...state, addingSectionTitle: action.title };

    // Inline objective
    case "START_ADD_OBJECTIVE":
      return { ...state, addingObjectiveFor: action.sectionId, addingObjectiveTitle: "" };
    case "CANCEL_ADD_OBJECTIVE":
      return { ...state, addingObjectiveFor: null, addingObjectiveTitle: "" };
    case "SET_OBJECTIVE_TITLE":
      return { ...state, addingObjectiveTitle: action.title };

    // Inline procedure
    case "START_ADD_PROC":
      return { ...state, addingProcFor: action.key, addingProcTitle: "" };
    case "CANCEL_ADD_PROC":
      return { ...state, addingProcFor: null, addingProcTitle: "" };
    case "SET_PROC_TITLE":
      return { ...state, addingProcTitle: action.title };

    // Inline rename
    case "START_EDIT":
      return { ...state, editingId: action.id, editingTitle: action.title };
    case "SET_EDITING_TITLE":
      return { ...state, editingTitle: action.title };
    case "CANCEL_EDIT":
      return { ...state, editingId: null, editingTitle: "" };

    // Full form: section
    case "OPEN_SECTION_FORM":
      return { ...state, sectionFormOpen: true, editingSectionData: action.section };
    case "CLOSE_SECTION_FORM":
      return { ...state, sectionFormOpen: false, editingSectionData: null };
    case "EXPAND_SECTION_FORM":
      return {
        ...state,
        showAddSection: false,
        addingSectionTitle: "",
        sectionFormOpen: true,
        editingSectionData: { id: "", engagementId: "", title: action.title, description: null, status: "draft", phase: "planning", planningRefId: null, source: "planned", sortOrder: 0, reviewNotes: null, reviewedBy: null, reviewedAt: null, objectives: [], procedures: [] },
      };

    // Full form: objective
    case "OPEN_OBJECTIVE_FORM":
      return { ...state, objectiveFormOpen: true, editingObjectiveData: action.objective, objectiveParentSectionId: action.sectionId };
    case "CLOSE_OBJECTIVE_FORM":
      return { ...state, objectiveFormOpen: false, editingObjectiveData: null };
    case "EXPAND_OBJECTIVE_FORM":
      return {
        ...state,
        addingObjectiveFor: null,
        addingObjectiveTitle: "",
        objectiveFormOpen: true,
        objectiveParentSectionId: action.sectionId,
        editingObjectiveData: { id: "", title: action.title, description: null, sectionId: action.sectionId, status: "draft", phase: "planning", planningRefId: null, source: "planned", sortOrder: 0, reviewNotes: null, reviewedBy: null, reviewedAt: null, procedures: [] },
      };

    // Full form: procedure
    case "OPEN_PROCEDURE_FORM":
      return { ...state, procedureFormOpen: true, editingProcedure: action.procedure, procedureParent: action.parent };
    case "CLOSE_PROCEDURE_FORM":
      return { ...state, procedureFormOpen: false, editingProcedure: null };
    case "EXPAND_PROCEDURE_FORM":
      return {
        ...state,
        addingProcFor: null,
        addingProcTitle: "",
        procedureFormOpen: true,
        procedureParent: action.parent,
        editingProcedure: null,
      };

    // Delete
    case "SET_DELETE_TARGET":
      return { ...state, deleteTarget: action.target };
    case "CLEAR_DELETE_TARGET":
      return { ...state, deleteTarget: null };

    // Collapse
    case "TOGGLE_COLLAPSE": {
      const next = new Set(state.collapsed);
      next.has(action.id) ? next.delete(action.id) : next.add(action.id);
      return { ...state, collapsed: next };
    }
    case "COLLAPSE_ALL":
      return { ...state, collapsed: new Set(action.ids) };
    case "EXPAND_ALL":
      return { ...state, collapsed: new Set() };

    default:
      return state;
  }
}

// ── Hook ──

export function useWorkProgramEditor(engagement: EngagementDetail) {
  const engId = engagement.id;
  const [state, dispatch] = useReducer(reducer, initialState);

  // Mutations
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();
  const createObjective = useCreateObjective();
  const updateObjective = useUpdateObjective();
  const deleteObjective = useDeleteObjective();
  const createProcedure = useCreateProcedure();
  const updateProcedure = useUpdateProcedure();
  const deleteProcedure = useDeleteProcedure();

  // ── Section ──
  const submitInlineSection = useCallback(() => {
    const title = state.addingSectionTitle.trim();
    if (!title) return;
    createSection.mutate(
      { engagementId: engId, data: { title } },
      { onSuccess: () => dispatch({ type: "HIDE_ADD_SECTION" }) },
    );
  }, [state.addingSectionTitle, engId, createSection]);

  const submitSectionForm = useCallback((data: { title: string; description?: string | null }) => {
    if (state.editingSectionData?.id) {
      updateSection.mutate(
        { engagementId: engId, sectionId: state.editingSectionData.id, data },
        { onSuccess: () => dispatch({ type: "CLOSE_SECTION_FORM" }) },
      );
    } else {
      createSection.mutate(
        { engagementId: engId, data: { title: data.title, description: data.description } },
        { onSuccess: () => dispatch({ type: "CLOSE_SECTION_FORM" }) },
      );
    }
  }, [state.editingSectionData, engId, createSection, updateSection]);

  const submitRenameSection = useCallback((section: EngagementSection) => {
    const title = state.editingTitle.trim();
    if (!title || title === section.title) { dispatch({ type: "CANCEL_EDIT" }); return; }
    updateSection.mutate(
      { engagementId: engId, sectionId: section.id, data: { title } },
      { onSuccess: () => dispatch({ type: "CANCEL_EDIT" }) },
    );
  }, [state.editingTitle, engId, updateSection]);

  // ── Objective ──
  const submitInlineObjective = useCallback((sectionId: string) => {
    const title = state.addingObjectiveTitle.trim();
    if (!title) return;
    createObjective.mutate(
      { engagementId: engId, sectionId, data: { title } },
      { onSuccess: () => dispatch({ type: "CANCEL_ADD_OBJECTIVE" }) },
    );
  }, [state.addingObjectiveTitle, engId, createObjective]);

  const submitObjectiveForm = useCallback((data: { title: string; description?: string | null }) => {
    if (state.editingObjectiveData?.id) {
      updateObjective.mutate(
        { engagementId: engId, objectiveId: state.editingObjectiveData.id, data },
        { onSuccess: () => dispatch({ type: "CLOSE_OBJECTIVE_FORM" }) },
      );
    } else {
      createObjective.mutate(
        { engagementId: engId, sectionId: state.objectiveParentSectionId, data: { title: data.title, description: data.description } },
        { onSuccess: () => dispatch({ type: "CLOSE_OBJECTIVE_FORM" }) },
      );
    }
  }, [state.editingObjectiveData, state.objectiveParentSectionId, engId, createObjective, updateObjective]);

  const submitRenameObjective = useCallback((obj: EngagementObjective) => {
    const title = state.editingTitle.trim();
    if (!title || title === obj.title) { dispatch({ type: "CANCEL_EDIT" }); return; }
    updateObjective.mutate(
      { engagementId: engId, objectiveId: obj.id, data: { title } },
      { onSuccess: () => dispatch({ type: "CANCEL_EDIT" }) },
    );
  }, [state.editingTitle, engId, updateObjective]);

  // ── Procedure ──
  const submitInlineProcedure = useCallback((sectionId?: string, objectiveId?: string) => {
    const title = state.addingProcTitle.trim();
    if (!title) return;
    createProcedure.mutate(
      { engagementId: engId, data: { title, sectionId: sectionId ?? null, objectiveId: objectiveId ?? null } },
      { onSuccess: () => dispatch({ type: "CANCEL_ADD_PROC" }) },
    );
  }, [state.addingProcTitle, engId, createProcedure]);

  const submitProcedureForm = useCallback((data: ProcedureInput | ProcedureUpdateInput) => {
    if (state.editingProcedure) {
      updateProcedure.mutate(
        { engagementId: engId, procedureId: state.editingProcedure.id, data: data as ProcedureUpdateInput },
        { onSuccess: () => dispatch({ type: "CLOSE_PROCEDURE_FORM" }) },
      );
    } else {
      const input: ProcedureInput = {
        ...(data as ProcedureInput),
        sectionId: state.procedureParent.sectionId ?? null,
        objectiveId: state.procedureParent.objectiveId ?? null,
      };
      createProcedure.mutate(
        { engagementId: engId, data: input },
        { onSuccess: () => dispatch({ type: "CLOSE_PROCEDURE_FORM" }) },
      );
    }
  }, [state.editingProcedure, state.procedureParent, engId, createProcedure, updateProcedure]);

  const changeProcedureStatus = useCallback((proc: EngagementProcedure, status: string) => {
    updateProcedure.mutate({ engagementId: engId, procedureId: proc.id, data: { status } });
  }, [engId, updateProcedure]);

  // ── Delete ──
  const confirmDelete = useCallback(() => {
    if (!state.deleteTarget) return;
    const { type, id } = state.deleteTarget;
    const onSuccess = () => dispatch({ type: "CLEAR_DELETE_TARGET" });
    if (type === "section") deleteSection.mutate({ engagementId: engId, sectionId: id }, { onSuccess });
    else if (type === "objective") deleteObjective.mutate({ engagementId: engId, objectiveId: id }, { onSuccess });
    else deleteProcedure.mutate({ engagementId: engId, procedureId: id }, { onSuccess });
  }, [state.deleteTarget, engId, deleteSection, deleteObjective, deleteProcedure]);

  // ── Loading flags ──
  const isDeleting = deleteSection.isPending || deleteObjective.isPending || deleteProcedure.isPending;
  const isSectionFormLoading = createSection.isPending || updateSection.isPending;
  const isObjectiveFormLoading = createObjective.isPending || updateObjective.isPending;
  const isProcedureFormLoading = createProcedure.isPending || updateProcedure.isPending;

  return {
    state,
    dispatch,
    // Submit actions
    submitInlineSection,
    submitSectionForm,
    submitRenameSection,
    submitInlineObjective,
    submitObjectiveForm,
    submitRenameObjective,
    submitInlineProcedure,
    submitProcedureForm,
    changeProcedureStatus,
    confirmDelete,
    // Loading flags
    isDeleting,
    isSectionFormLoading,
    isObjectiveFormLoading,
    isProcedureFormLoading,
  };
}
