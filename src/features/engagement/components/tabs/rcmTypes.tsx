import { ENGAGEMENT_LABELS } from "@/constants/labels";
import { cn } from "@/lib/utils";
import type {
  RcmObjective,
  EngagementRisk,
  EngagementControl,
} from "../../types";

// ── Labels ──

export const LR = ENGAGEMENT_LABELS.risk;

// ── Colored dot constants ──

export const RATING_DOT: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-red-600",
};

export const RATING_OPTIONS = [
  { value: "low", label: LR.riskRating.low },
  { value: "medium", label: LR.riskRating.medium },
  { value: "high", label: LR.riskRating.high },
  { value: "critical", label: LR.riskRating.critical },
];

export const EFFECTIVENESS_OPTIONS = [
  { value: "strong", label: LR.controlEffectiveness.strong },
  { value: "adequate", label: LR.controlEffectiveness.adequate },
  { value: "weak", label: LR.controlEffectiveness.weak },
  { value: "none", label: LR.controlEffectiveness.none },
];

// ── Colored dot renderer for LabeledSelect ──

export function renderRatingDot(opt: { value: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "inline-block size-2 shrink-0 rounded-full",
          RATING_DOT[opt.value] ?? "bg-muted-foreground/30",
        )}
      />
      {opt.label}
    </span>
  );
}

// ── Tree row type ──

export type RcmRowType =
  | "objective"
  | "risk"
  | "control"
  | "add_risk"
  | "add_control"
  | "add_objective"
  | "btn_add_risk"
  | "btn_add_control";

export interface RcmRow {
  id: string;
  type: RcmRowType;
  description: string;
  riskRating: string | null;
  effectiveness: string | null;
  /** For risk → parent objective ID; for control → parent risk ID */
  parentId: string | null;
  children: RcmRow[];
}

// ── State ──

export interface RcmState {
  addingForId: string | null;
  addingType: "risk" | "control" | "objective" | null;
  addingDesc: string;
  addingRating: string;
  addingEffectiveness: string;
  editingId: string | null;
  editingType: "risk" | "control" | "objective" | null;
  editingDesc: string;
  editingRating: string;
  editingEffectiveness: string;
  deleteTarget: {
    type: "risk" | "control" | "objective";
    id: string;
    riskId?: string;
    title: string;
  } | null;
}

export type RcmAction =
  | { type: "START_ADD_OBJECTIVE" }
  | { type: "START_ADD_RISK"; objectiveId: string }
  | { type: "START_ADD_CONTROL"; riskId: string }
  | { type: "SET_ADD_DESC"; value: string }
  | { type: "SET_ADD_RATING"; value: string }
  | { type: "SET_ADD_EFFECTIVENESS"; value: string }
  | { type: "CANCEL_ADD" }
  | { type: "START_EDIT_OBJECTIVE"; id: string; title: string }
  | { type: "START_EDIT_RISK"; risk: EngagementRisk }
  | { type: "START_EDIT_CONTROL"; control: EngagementControl; riskId: string }
  | { type: "SET_EDIT_DESC"; value: string }
  | { type: "SET_EDIT_RATING"; value: string }
  | { type: "SET_EDIT_EFFECTIVENESS"; value: string }
  | { type: "CANCEL_EDIT" }
  | { type: "SET_DELETE"; target: RcmState["deleteTarget"] }
  | { type: "CLEAR_DELETE" };

export const initialState: RcmState = {
  addingForId: null,
  addingType: null,
  addingDesc: "",
  addingRating: "",
  addingEffectiveness: "",
  editingId: null,
  editingType: null,
  editingDesc: "",
  editingRating: "",
  editingEffectiveness: "",
  deleteTarget: null,
};

export function rcmReducer(state: RcmState, action: RcmAction): RcmState {
  switch (action.type) {
    case "START_ADD_OBJECTIVE":
      return {
        ...initialState,
        addingType: "objective",
        addingForId: "_new_obj",
      };
    case "START_ADD_RISK":
      return {
        ...initialState,
        addingForId: action.objectiveId,
        addingType: "risk",
      };
    case "START_ADD_CONTROL":
      return {
        ...initialState,
        addingForId: action.riskId,
        addingType: "control",
      };
    case "SET_ADD_DESC":
      return { ...state, addingDesc: action.value };
    case "SET_ADD_RATING":
      return { ...state, addingRating: action.value };
    case "SET_ADD_EFFECTIVENESS":
      return { ...state, addingEffectiveness: action.value };
    case "CANCEL_ADD":
      return {
        ...state,
        addingForId: null,
        addingType: null,
        addingDesc: "",
        addingRating: "",
        addingEffectiveness: "",
      };
    case "START_EDIT_OBJECTIVE":
      return {
        ...initialState,
        editingId: action.id,
        editingType: "objective",
        editingDesc: action.title,
      };
    case "START_EDIT_RISK":
      return {
        ...initialState,
        editingId: action.risk.id,
        editingType: "risk",
        editingDesc: action.risk.riskDescription,
        editingRating: action.risk.riskRating ?? "",
      };
    case "START_EDIT_CONTROL":
      return {
        ...initialState,
        editingId: action.control.id,
        editingType: "control",
        editingDesc: action.control.description,
        editingEffectiveness: action.control.effectiveness ?? "",
      };
    case "SET_EDIT_DESC":
      return { ...state, editingDesc: action.value };
    case "SET_EDIT_RATING":
      return { ...state, editingRating: action.value };
    case "SET_EDIT_EFFECTIVENESS":
      return { ...state, editingEffectiveness: action.value };
    case "CANCEL_EDIT":
      return {
        ...state,
        editingId: null,
        editingType: null,
        editingDesc: "",
        editingRating: "",
        editingEffectiveness: "",
      };
    case "SET_DELETE":
      return { ...state, deleteTarget: action.target };
    case "CLEAR_DELETE":
      return { ...state, deleteTarget: null };
    default:
      return state;
  }
}

// ── Build tree from objectives + risks ──

export function buildRcmTree(
  rcmObjectives: RcmObjective[],
  state: RcmState,
): RcmRow[] {
  const rows: RcmRow[] = [];

  for (const obj of rcmObjectives) {
    const riskRows: RcmRow[] = obj.risks.map((risk) => {
      const controlRows: RcmRow[] = risk.controls.map((ctrl) => ({
        id: ctrl.id,
        type: "control" as const,
        description: ctrl.description,
        riskRating: null,
        effectiveness: ctrl.effectiveness,
        parentId: risk.id,
        children: [],
      }));

      if (state.addingType === "control" && state.addingForId === risk.id) {
        controlRows.push({
          id: `_add_control_${risk.id}`,
          type: "add_control",
          description: "",
          riskRating: null,
          effectiveness: null,
          parentId: risk.id,
          children: [],
        });
      } else {
        controlRows.push({
          id: `_btn_add_control_${risk.id}`,
          type: "btn_add_control",
          description: "",
          riskRating: null,
          effectiveness: null,
          parentId: risk.id,
          children: [],
        });
      }

      return {
        id: risk.id,
        type: "risk" as const,
        description: risk.riskDescription,
        riskRating: risk.riskRating,
        effectiveness: null,
        parentId: obj.id,
        children: controlRows,
      };
    });

    if (state.addingType === "risk" && state.addingForId === obj.id) {
      riskRows.push({
        id: `_add_risk_${obj.id}`,
        type: "add_risk",
        description: "",
        riskRating: null,
        effectiveness: null,
        parentId: obj.id,
        children: [],
      });
    } else {
      riskRows.push({
        id: `_btn_add_risk_${obj.id}`,
        type: "btn_add_risk",
        description: "",
        riskRating: null,
        effectiveness: null,
        parentId: obj.id,
        children: [],
      });
    }

    rows.push({
      id: obj.id,
      type: "objective",
      description: obj.title,
      riskRating: null,
      effectiveness: null,
      parentId: null,
      children: riskRows,
    });
  }

  // Phantom add_objective row
  if (state.addingType === "objective") {
    rows.push({
      id: "_add_objective",
      type: "add_objective",
      description: "",
      riskRating: null,
      effectiveness: null,
      parentId: null,
      children: [],
    });
  }

  return rows;
}

// ── Lookup maps ──

export function buildLookups(rcmObjectives: RcmObjective[]) {
  const objectiveMap = new Map<string, RcmObjective>();
  const riskMap = new Map<string, EngagementRisk>();
  const controlMap = new Map<
    string,
    { control: EngagementControl; riskId: string }
  >();
  for (const obj of rcmObjectives) {
    objectiveMap.set(obj.id, obj);
    for (const risk of obj.risks) {
      riskMap.set(risk.id, risk);
      for (const ctrl of risk.controls) {
        controlMap.set(ctrl.id, { control: ctrl, riskId: risk.id });
      }
    }
  }
  return { objectiveMap, riskMap, controlMap };
}
