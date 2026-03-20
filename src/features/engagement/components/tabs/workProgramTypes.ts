import { ENGAGEMENT_LABELS } from "@/constants/labels";
import type {
  EngagementSection,
  EngagementObjective,
  EngagementProcedure,
} from "../../types";

// ── Labels ──

const LS = ENGAGEMENT_LABELS.section;
const LO = ENGAGEMENT_LABELS.objective;
const LPROC = ENGAGEMENT_LABELS.procedure;

export const WP_LABELS = {
  section: LS,
  objective: LO,
  procedure: LPROC,
  stats: {
    sections: "Phần hành",
    objectives: "Mục tiêu",
    procedures: "Thủ tục kiểm toán",
    completed: "Hoàn thành",
    findings: "Phát hiện",
  },
  noData: "Chưa có chương trình kiểm toán. Thêm phần hành hoặc mục tiêu để bắt đầu.",
  addSection: LS.createTitle,
  addObjective: LO.createTitle,
  addProcedure: LPROC.createTitle,
  collapseAll: "Thu gọn tất cả",
  expandAll: "Mở rộng tất cả",
};

// ── Procedure status options ──

export const PROCEDURE_STATUS_OPTIONS = [
  { value: "not_started", label: LPROC.status.not_started },
  { value: "in_progress", label: LPROC.status.in_progress },
  { value: "waiting_review", label: LPROC.status.waiting_review },
  { value: "reviewed", label: LPROC.status.reviewed },
];

export const PROCEDURE_STATUS_DOT: Record<string, string> = {
  not_started: "bg-muted-foreground/40",
  in_progress: "bg-blue-500",
  waiting_review: "bg-amber-500",
  reviewed: "bg-emerald-500",
};

// ── Top-level node (section or standalone objective) ──

export type TopNodeType = "section" | "objective";

export interface TopNode {
  id: string;
  type: TopNodeType;
  title: string;
  section?: EngagementSection;
  objective?: EngagementObjective;
}

export function buildTopNodes(
  sections: EngagementSection[],
  standaloneObjectives: EngagementObjective[],
): TopNode[] {
  const nodes: TopNode[] = [];

  // Interleave by sortOrder — sections use sortOrder, objectives use sortOrder
  const sectionNodes: TopNode[] = sections.map((s) => ({
    id: s.id,
    type: "section" as const,
    title: s.title,
    section: s,
  }));

  const objectiveNodes: TopNode[] = standaloneObjectives.map((o) => ({
    id: o.id,
    type: "objective" as const,
    title: o.title,
    objective: o,
  }));

  // Sort by sortOrder (sections and objectives share the same ordering space)
  nodes.push(...sectionNodes, ...objectiveNodes);
  nodes.sort((a, b) => {
    const orderA =
      a.type === "section" ? (a.section?.sortOrder ?? 0) : (a.objective?.sortOrder ?? 0);
    const orderB =
      b.type === "section" ? (b.section?.sortOrder ?? 0) : (b.objective?.sortOrder ?? 0);
    return orderA - orderB;
  });

  return nodes;
}

// ── DataTable row types (inside each card) ──

export type WpRowType =
  | "objective"
  | "procedure"
  | "add_objective"
  | "add_procedure"
  | "btn_add_objective"
  | "btn_add_procedure";

export interface WpRow {
  id: string;
  type: WpRowType;
  title: string;
  status: string | null;
  parentId: string | null;
  children: WpRow[];
}

// ── Build tree for a section card ──

export function buildSectionTree(
  section: EngagementSection,
  state: WpState,
): WpRow[] {
  const rows: WpRow[] = [];

  // Objectives with their procedures
  for (const obj of section.objectives) {
    const procRows: WpRow[] = obj.procedures.map((proc, idx) => ({
      id: proc.id,
      type: "procedure" as const,
      title: proc.title,
      status: proc.status,
      parentId: obj.id,
      children: [],
    }));

    // Add procedure phantom or button
    if (state.addingType === "procedure" && state.addingForId === obj.id) {
      procRows.push({
        id: `_add_proc_${obj.id}`,
        type: "add_procedure",
        title: "",
        status: null,
        parentId: obj.id,
        children: [],
      });
    } else {
      procRows.push({
        id: `_btn_add_proc_${obj.id}`,
        type: "btn_add_procedure",
        title: "",
        status: null,
        parentId: obj.id,
        children: [],
      });
    }

    rows.push({
      id: obj.id,
      type: "objective",
      title: obj.title,
      status: obj.status,
      parentId: section.id,
      children: procRows,
    });
  }

  // Direct procedures under section (no parent objective)
  for (const proc of section.procedures) {
    rows.push({
      id: proc.id,
      type: "procedure",
      title: proc.title,
      status: proc.status,
      parentId: section.id,
      children: [],
    });
  }

  // Add objective phantom or button
  if (state.addingType === "objective" && state.addingForId === section.id) {
    rows.push({
      id: `_add_obj_${section.id}`,
      type: "add_objective",
      title: "",
      status: null,
      parentId: section.id,
      children: [],
    });
  } else {
    rows.push({
      id: `_btn_add_obj_${section.id}`,
      type: "btn_add_objective",
      title: "",
      status: null,
      parentId: section.id,
      children: [],
    });
  }

  // Add direct procedure phantom (under section) — only when actively adding
  // The button is already in the btn_add_objective row above
  if (
    state.addingType === "procedure" &&
    state.addingForId === `sec:${section.id}`
  ) {
    rows.push({
      id: `_add_proc_sec_${section.id}`,
      type: "add_procedure",
      title: "",
      status: null,
      parentId: section.id,
      children: [],
    });
  }

  return rows;
}

// ── Build tree for a standalone objective card ──

export function buildObjectiveTree(
  objective: EngagementObjective,
  state: WpState,
): WpRow[] {
  const rows: WpRow[] = [];

  for (const proc of objective.procedures) {
    rows.push({
      id: proc.id,
      type: "procedure",
      title: proc.title,
      status: proc.status,
      parentId: objective.id,
      children: [],
    });
  }

  // Add procedure phantom or button
  if (state.addingType === "procedure" && state.addingForId === objective.id) {
    rows.push({
      id: `_add_proc_${objective.id}`,
      type: "add_procedure",
      title: "",
      status: null,
      parentId: objective.id,
      children: [],
    });
  } else {
    rows.push({
      id: `_btn_add_proc_${objective.id}`,
      type: "btn_add_procedure",
      title: "",
      status: null,
      parentId: objective.id,
      children: [],
    });
  }

  return rows;
}

// ── Reducer state ──

export interface WpState {
  // Adding inside a card's DataTable
  addingType: "objective" | "procedure" | null;
  addingForId: string | null; // section ID, objective ID, or "sec:{id}"
  // Editing a row inside a card's DataTable
  editingId: string | null;
  editingType: "objective" | "procedure" | null;
  // Status editing (execution mode)
  editingStatus: string;
  // Adding top-level node (section or standalone objective)
  addingTopType: "section" | "objective" | null;
  addingTopTitle: string;
  // Editing top-level node header
  editingNodeId: string | null;
  editingNodeTitle: string;
  // Delete
  deleteTarget: {
    type: "section" | "objective" | "procedure";
    id: string;
    sectionId?: string;
    objectiveId?: string;
    title: string;
  } | null;
}

export const wpInitialState: WpState = {
  addingType: null,
  addingForId: null,
  editingId: null,
  editingType: null,
  editingStatus: "",
  addingTopType: null,
  addingTopTitle: "",
  editingNodeId: null,
  editingNodeTitle: "",
  deleteTarget: null,
};

// ── Actions ──

export type WpAction =
  // Adding inside card
  | { type: "START_ADD_OBJECTIVE"; sectionId: string }
  | { type: "START_ADD_PROCEDURE"; parentId: string }
  | { type: "CANCEL_ADD" }
  // Editing row
  | { type: "START_EDIT_OBJECTIVE"; id: string; title: string }
  | { type: "START_EDIT_PROCEDURE"; id: string; title: string; status: string }
  | { type: "SET_EDIT_STATUS"; value: string }
  | { type: "CANCEL_EDIT" }
  // Top-level add
  | { type: "START_ADD_SECTION" }
  | { type: "START_ADD_TOP_OBJECTIVE" }
  | { type: "SET_TOP_TITLE"; title: string }
  | { type: "CANCEL_ADD_TOP" }
  // Top-level edit header
  | { type: "START_EDIT_NODE"; id: string; title: string }
  | { type: "SET_NODE_TITLE"; title: string }
  | { type: "CANCEL_EDIT_NODE" }
  // Delete
  | { type: "SET_DELETE"; target: WpState["deleteTarget"] }
  | { type: "CLEAR_DELETE" };

export function wpReducer(state: WpState, action: WpAction): WpState {
  switch (action.type) {
    // Adding inside card
    case "START_ADD_OBJECTIVE":
      return {
        ...wpInitialState,
        addingType: "objective",
        addingForId: action.sectionId,
      };
    case "START_ADD_PROCEDURE":
      return {
        ...wpInitialState,
        addingType: "procedure",
        addingForId: action.parentId,
      };
    case "CANCEL_ADD":
      return {
        ...state,
        addingType: null,
        addingForId: null,
      };

    // Editing row
    case "START_EDIT_OBJECTIVE":
      return {
        ...wpInitialState,
        editingId: action.id,
        editingType: "objective",
      };
    case "START_EDIT_PROCEDURE":
      return {
        ...wpInitialState,
        editingId: action.id,
        editingType: "procedure",
        editingStatus: action.status,
      };
    case "SET_EDIT_STATUS":
      return { ...state, editingStatus: action.value };
    case "CANCEL_EDIT":
      return {
        ...state,
        editingId: null,
        editingType: null,
        editingStatus: "",
      };

    // Top-level add
    case "START_ADD_SECTION":
      return { ...wpInitialState, addingTopType: "section", addingTopTitle: "" };
    case "START_ADD_TOP_OBJECTIVE":
      return {
        ...wpInitialState,
        addingTopType: "objective",
        addingTopTitle: "",
      };
    case "SET_TOP_TITLE":
      return { ...state, addingTopTitle: action.title };
    case "CANCEL_ADD_TOP":
      return { ...state, addingTopType: null, addingTopTitle: "" };

    // Top-level edit header
    case "START_EDIT_NODE":
      return {
        ...wpInitialState,
        editingNodeId: action.id,
        editingNodeTitle: action.title,
      };
    case "SET_NODE_TITLE":
      return { ...state, editingNodeTitle: action.title };
    case "CANCEL_EDIT_NODE":
      return { ...state, editingNodeId: null, editingNodeTitle: "" };

    // Delete
    case "SET_DELETE":
      return { ...state, deleteTarget: action.target };
    case "CLEAR_DELETE":
      return { ...state, deleteTarget: null };

    default:
      return state;
  }
}

// ── Stats computation ──

export interface WpStats {
  sections: number;
  objectives: number;
  procedures: number;
  completed: number;
  findings: number;
}

export function computeWpStats(
  sections: EngagementSection[],
  standaloneObjectives: EngagementObjective[],
  findingCount: number,
): WpStats {
  let objectives = 0;
  let procedures = 0;
  let completed = 0;

  for (const sec of sections) {
    objectives += sec.objectives.length;
    for (const obj of sec.objectives) {
      procedures += obj.procedures.length;
      completed += obj.procedures.filter(
        (p) => p.status === "reviewed",
      ).length;
    }
    procedures += sec.procedures.length;
    completed += sec.procedures.filter((p) => p.status === "reviewed").length;
  }

  for (const obj of standaloneObjectives) {
    procedures += obj.procedures.length;
    completed += obj.procedures.filter((p) => p.status === "reviewed").length;
  }

  return {
    sections: sections.length,
    objectives: objectives + standaloneObjectives.length,
    procedures,
    completed,
    findings: findingCount,
  };
}
