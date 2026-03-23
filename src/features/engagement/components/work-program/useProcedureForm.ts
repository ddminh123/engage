"use client";

import { useCallback, useReducer, useRef } from "react";
import { useUpdateProcedure } from "../../hooks/useEngagements";
import type { EngagementProcedure, ProcedureUpdateInput } from "../../types";

// ── Reducer for local form state ──

export interface FormState {
  title: string;
  description: string | null;
  procedures: string | null;
  observations: string | null;
  conclusion: string | null;
  effectiveness: string | null;
  procedureType: string | null;
  procedureCategory: string | null;
  priority: string | null;
  status: string;
  sampleSize: number | null;
  exceptions: number | null;
  controlRefIds: string[];
  riskRefIds: string[];
  objectiveRefIds: string[];
}

type FormAction =
  | { type: "RESET"; procedure: EngagementProcedure }
  | { type: "SET_FIELD"; field: keyof FormState; value: FormState[keyof FormState] };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "RESET":
      return stateFromProcedure(action.procedure);
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

function stateFromProcedure(p: EngagementProcedure): FormState {
  return {
    title: p.title,
    description: p.description,
    procedures: p.procedures,
    observations: p.observations,
    conclusion: p.conclusion,
    effectiveness: p.effectiveness,
    procedureType: p.procedureType,
    procedureCategory: p.procedureCategory,
    priority: p.priority,
    status: p.status,
    sampleSize: p.sampleSize,
    exceptions: p.exceptions,
    controlRefIds: p.linkedControls?.map((c) => c.id) ?? [],
    riskRefIds: p.linkedRisks?.map((r) => r.id) ?? [],
    objectiveRefIds: p.linkedObjectives?.map((o) => o.id) ?? [],
  };
}

const initialState: FormState = {
  title: "",
  description: null,
  procedures: null,
  observations: null,
  conclusion: null,
  effectiveness: null,
  procedureType: null,
  procedureCategory: null,
  priority: null,
  status: "not_started",
  sampleSize: null,
  exceptions: null,
  controlRefIds: [],
  riskRefIds: [],
  objectiveRefIds: [],
};

function initFromProcedure(procedure: EngagementProcedure | null): FormState {
  if (!procedure) return initialState;
  return stateFromProcedure(procedure);
}

/**
 * Hook for the fullscreen procedure form.
 * Explicit save — no auto-save on change.
 * Local state is managed via useReducer, saved with a single "Lưu" button.
 */
export function useProcedureForm(
  engagementId: string,
  procedure: EngagementProcedure | null,
) {
  const updateMutation = useUpdateProcedure();

  // ── Local state via reducer ──
  const [state, dispatch] = useReducer(formReducer, procedure, initFromProcedure);

  // Track procedure ID to detect when a different procedure is loaded
  const prevProcIdRef = useRef<string | null>(procedure?.id ?? null);
  const currentProcId = procedure?.id ?? null;

  // Reset state only when procedure identity changes (different record opened)
  if (currentProcId !== prevProcIdRef.current) {
    prevProcIdRef.current = currentProcId;
    if (procedure) {
      dispatch({ type: "RESET", procedure });
    }
  }

  // ── Field setter ──
  const setField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      dispatch({ type: "SET_FIELD", field, value });
    },
    [],
  );

  // ── Build save payload ──
  const buildPayload = useCallback((): ProcedureUpdateInput => ({
    title: state.title,
    description: state.description,
    procedures: state.procedures,
    procedureType: state.procedureType,
    procedureCategory: state.procedureCategory,
    priority: state.priority,
    status: state.status,
    observations: state.observations,
    conclusion: state.conclusion,
    effectiveness: state.effectiveness,
    sampleSize: state.sampleSize,
    exceptions: state.exceptions,
    controlRefIds: state.controlRefIds,
    riskRefIds: state.riskRefIds,
    objectiveRefIds: state.objectiveRefIds,
  }), [state]);

  // ── Explicit save (all changed fields at once) ──
  const handleSave = useCallback(() => {
    if (!procedure) return;
    updateMutation.mutate({
      engagementId,
      procedureId: procedure.id,
      data: buildPayload(),
    });
  }, [engagementId, procedure, buildPayload, updateMutation]);

  // ── Async save — returns promise for awaiting ──
  const handleSaveAsync = useCallback(async () => {
    if (!procedure) return;
    await updateMutation.mutateAsync({
      engagementId,
      procedureId: procedure.id,
      data: buildPayload(),
    });
  }, [engagementId, procedure, buildPayload, updateMutation]);

  // ── Set effectiveness shortcut ──
  const handleSetEffectiveness = useCallback(
    (value: "effective" | "ineffective") => {
      setField("effectiveness", value);
    },
    [setField],
  );

  return {
    state,
    setField,
    handleSave,
    handleSaveAsync,
    handleSetEffectiveness,
    isSaving: updateMutation.isPending,
  };
}
