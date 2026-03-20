import { useReducer } from "react";
import {
  useContact,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from "./useContacts";
import type { Contact, ContactInput } from "../types";

// =============================================================================
// STATE
// =============================================================================

interface ContactPageState {
  selectedId: string | null;
  detailOpen: boolean;
  formOpen: boolean;
  editingContact: Contact | null;
  deleteDialogOpen: boolean;
  contactToDelete: Contact | null;
}

type ContactPageAction =
  | { type: "SELECT"; contact: Contact }
  | { type: "OPEN_CREATE" }
  | { type: "OPEN_EDIT"; contact: Contact }
  | { type: "OPEN_DELETE"; contact: Contact }
  | { type: "CLOSE_DETAIL" }
  | { type: "CLOSE_FORM" }
  | { type: "CLOSE_DELETE" }
  | { type: "RESET_AFTER_DELETE" };

const initialState: ContactPageState = {
  selectedId: null,
  detailOpen: false,
  formOpen: false,
  editingContact: null,
  deleteDialogOpen: false,
  contactToDelete: null,
};

function reducer(
  state: ContactPageState,
  action: ContactPageAction,
): ContactPageState {
  switch (action.type) {
    case "SELECT":
      return { ...state, selectedId: action.contact.id, detailOpen: true };
    case "OPEN_CREATE":
      return { ...state, editingContact: null, formOpen: true };
    case "OPEN_EDIT":
      return {
        ...state,
        editingContact: action.contact,
        detailOpen: false,
        formOpen: true,
      };
    case "OPEN_DELETE":
      return {
        ...state,
        contactToDelete: action.contact,
        deleteDialogOpen: true,
      };
    case "CLOSE_DETAIL":
      return { ...state, detailOpen: false };
    case "CLOSE_FORM":
      return { ...state, formOpen: false, editingContact: null };
    case "CLOSE_DELETE":
      return { ...state, deleteDialogOpen: false, contactToDelete: null };
    case "RESET_AFTER_DELETE":
      return {
        ...state,
        deleteDialogOpen: false,
        detailOpen: false,
        contactToDelete: null,
        selectedId: null,
      };
    default:
      return state;
  }
}

// =============================================================================
// HOOK
// =============================================================================

export function useContactPageState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { data: selectedContact } = useContact(state.selectedId);
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();
  const deleteMutation = useDeleteContact();

  const handleSelect = (contact: Contact) => {
    dispatch({ type: "SELECT", contact });
  };

  const handleCreate = () => {
    dispatch({ type: "OPEN_CREATE" });
  };

  const handleEdit = (contact: Contact) => {
    dispatch({ type: "OPEN_EDIT", contact });
  };

  const handleDelete = (contact: Contact) => {
    dispatch({ type: "OPEN_DELETE", contact });
  };

  const handleFormSubmit = async (data: ContactInput) => {
    try {
      if (state.editingContact) {
        await updateMutation.mutateAsync({
          id: state.editingContact.id,
          data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      dispatch({ type: "CLOSE_FORM" });
    } catch {
      // Error captured by mutation state
    }
  };

  const handleConfirmDelete = async () => {
    if (state.contactToDelete) {
      try {
        await deleteMutation.mutateAsync(state.contactToDelete.id);
        dispatch({ type: "RESET_AFTER_DELETE" });
      } catch {
        // Error captured by deleteMutation.error
      }
    }
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

  const mutationError =
    updateMutation.error?.message || createMutation.error?.message || null;

  return {
    ...state,
    selectedContact: selectedContact ?? null,
    isMutating: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    mutationError,
    handleSelect,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleConfirmDelete,
    setDetailOpen,
    setFormOpen,
    setDeleteDialogOpen,
  };
}
