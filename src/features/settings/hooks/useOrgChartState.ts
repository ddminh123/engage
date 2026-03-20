import { useReducer } from "react";
import {
  useOrgUnit,
  useCreateOrgUnit,
  useUpdateOrgUnit,
  useDeleteOrgUnit,
} from "./useOrgUnits";
import { useCreateContact } from "./useContacts";
import type { Contact, ContactInput, OrgUnit, OrgUnitCreateInput } from "../types";

// =============================================================================
// STATE
// =============================================================================

interface OrgChartState {
  selectedId: string | null;
  detailOpen: boolean;
  formOpen: boolean;
  orgUnitFormHidden: boolean;
  editingUnit: OrgUnit | null;
  presetParent: OrgUnit | null;
  deleteDialogOpen: boolean;
  unitToDelete: OrgUnit | null;
  contactFormOpen: boolean;
  contactRole: "leader" | "contactPoint" | null;
}

type OrgChartAction =
  | { type: "SELECT"; unit: OrgUnit }
  | { type: "OPEN_CREATE" }
  | { type: "OPEN_CREATE_CHILD"; parentUnit: OrgUnit }
  | { type: "OPEN_EDIT"; unit: OrgUnit }
  | { type: "OPEN_DELETE"; unit: OrgUnit }
  | { type: "CLOSE_DETAIL" }
  | { type: "CLOSE_FORM" }
  | { type: "CLOSE_DELETE" }
  | { type: "RESET_AFTER_DELETE" }
  | { type: "OPEN_CONTACT_FORM"; role: "leader" | "contactPoint" }
  | { type: "CLOSE_CONTACT_FORM" };

const initialState: OrgChartState = {
  selectedId: null,
  detailOpen: false,
  formOpen: false,
  orgUnitFormHidden: false,
  editingUnit: null,
  presetParent: null,
  deleteDialogOpen: false,
  unitToDelete: null,
  contactFormOpen: false,
  contactRole: null,
};

function reducer(state: OrgChartState, action: OrgChartAction): OrgChartState {
  switch (action.type) {
    case "SELECT":
      return { ...state, selectedId: action.unit.id, detailOpen: true };
    case "OPEN_CREATE":
      return { ...state, editingUnit: null, presetParent: null, formOpen: true };
    case "OPEN_CREATE_CHILD":
      return { ...state, editingUnit: null, presetParent: action.parentUnit, formOpen: true };
    case "OPEN_EDIT":
      return {
        ...state,
        editingUnit: action.unit,
        detailOpen: false,
        formOpen: true,
      };
    case "OPEN_DELETE":
      return {
        ...state,
        unitToDelete: action.unit,
        deleteDialogOpen: true,
      };
    case "CLOSE_DETAIL":
      return { ...state, detailOpen: false };
    case "CLOSE_FORM":
      return { ...state, formOpen: false, editingUnit: null, presetParent: null };
    case "CLOSE_DELETE":
      return { ...state, deleteDialogOpen: false, unitToDelete: null };
    case "RESET_AFTER_DELETE":
      return {
        ...state,
        deleteDialogOpen: false,
        detailOpen: false,
        unitToDelete: null,
        selectedId: null,
      };
    case "OPEN_CONTACT_FORM":
      return {
        ...state,
        formOpen: true,
        orgUnitFormHidden: true,
        contactFormOpen: true,
        contactRole: action.role,
      };
    case "CLOSE_CONTACT_FORM":
      return {
        ...state,
        contactFormOpen: false,
        orgUnitFormHidden: false,
        contactRole: null,
      };
    default:
      return state;
  }
}

// =============================================================================
// HOOK
// =============================================================================

export function useOrgChartState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { data: selectedUnit } = useOrgUnit(state.selectedId);
  const createMutation = useCreateOrgUnit();
  const updateMutation = useUpdateOrgUnit();
  const deleteMutation = useDeleteOrgUnit();
  const createContactMutation = useCreateContact();

  const handleSelect = (unit: OrgUnit) => {
    dispatch({ type: "SELECT", unit });
  };

  const handleCreate = () => {
    dispatch({ type: "OPEN_CREATE" });
  };

  const handleAddChild = (parentUnit: OrgUnit) => {
    dispatch({ type: "OPEN_CREATE_CHILD", parentUnit });
  };

  const handleEdit = (unit: OrgUnit) => {
    dispatch({ type: "OPEN_EDIT", unit });
  };

  const handleDelete = (unit: OrgUnit) => {
    dispatch({ type: "OPEN_DELETE", unit });
  };

  const handleFormSubmit = async (data: OrgUnitCreateInput) => {
    try {
      if (state.editingUnit) {
        await updateMutation.mutateAsync({ id: state.editingUnit.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      dispatch({ type: "CLOSE_FORM" });
    } catch {
      // Error is captured by the mutation state (updateMutation.error / createMutation.error).
      // The form stays open so the user can fix and retry.
    }
  };

  const handleConfirmDelete = async () => {
    if (state.unitToDelete) {
      try {
        await deleteMutation.mutateAsync(state.unitToDelete.id);
        dispatch({ type: "RESET_AFTER_DELETE" });
      } catch {
        // Error captured by deleteMutation.error
      }
    }
  };

  const handleCreateContact = (role: "leader" | "contactPoint") => {
    dispatch({ type: "OPEN_CONTACT_FORM", role });
  };

  const handleContactFormSubmit = async (data: ContactInput): Promise<Contact | null> => {
    try {
      const contact = await createContactMutation.mutateAsync(data);
      dispatch({ type: "CLOSE_CONTACT_FORM" });
      return contact;
    } catch {
      return null;
    }
  };

  const handleCloseContactForm = () => {
    dispatch({ type: "CLOSE_CONTACT_FORM" });
  };

  const setDetailOpen = (open: boolean) => {
    if (!open) dispatch({ type: "CLOSE_DETAIL" });
  };

  const setFormOpen = (open: boolean) => {
    if (!open) dispatch({ type: "CLOSE_FORM" });
  };

  const setDeleteDialogOpen = (open: boolean) => {
    if (!open) dispatch({ type: "CLOSE_DELETE" });
  };

  const setContactFormOpen = (open: boolean) => {
    if (!open) handleCloseContactForm();
  };

  const mutationError =
    updateMutation.error?.message || createMutation.error?.message || null;

  return {
    ...state,
    selectedUnit: selectedUnit ?? null,
    isMutating: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    mutationError,
    handleSelect,
    handleCreate,
    handleAddChild,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleConfirmDelete,
    handleCreateContact,
    handleContactFormSubmit,
    createContactPending: createContactMutation.isPending,
    setDetailOpen,
    setFormOpen,
    setDeleteDialogOpen,
    setContactFormOpen,
  };
}
