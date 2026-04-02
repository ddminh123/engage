import { Mark, mergeAttributes } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface ObjectiveMarkOptions {
  HTMLAttributes: Record<string, unknown>;
  onObjectiveActivated: (objectiveId: string | null) => void;
  onObjectiveClicked: (objectiveId: string) => void;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    objectiveMark: {
      setObjectiveMark: (objectiveId: string) => ReturnType;
      unsetObjectiveMark: (objectiveId: string) => ReturnType;
      highlightObjective: (objectiveId: string | null) => ReturnType;
      setPendingObjectiveRange: (from: number, to: number) => ReturnType;
      clearPendingObjectiveRange: () => ReturnType;
    };
  }
}

const pendingObjectiveKey = new PluginKey("pendingObjectiveHighlight");

export const ObjectiveMark = Mark.create<ObjectiveMarkOptions>({
  name: "objective",

  // Allow coexistence with CommentMark, FindingMark, and other marks
  excludes: "",

  addOptions() {
    return {
      HTMLAttributes: {},
      onObjectiveActivated: () => {},
      onObjectiveClicked: () => {},
    };
  },

  addAttributes() {
    return {
      objectiveId: {
        default: null,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute("data-objective-id"),
        renderHTML: (attrs) => ({
          "data-objective-id": attrs.objectiveId as string,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-objective-id]",
        getAttrs: (el) =>
          !!(el as HTMLSpanElement).getAttribute("data-objective-id")?.trim() && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "wp-objective-mark",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setObjectiveMark:
        (objectiveId: string) =>
        ({ commands }) =>
          commands.setMark("objective", { objectiveId }),
      unsetObjectiveMark:
        (objectiveId: string) =>
        ({ tr, dispatch }) => {
          if (!dispatch) return true;
          const { doc } = tr;
          doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (
                mark.type.name === "objective" &&
                mark.attrs.objectiveId === objectiveId
              ) {
                tr.removeMark(pos, pos + node.nodeSize, mark);
              }
            });
          });
          return true;
        },
      setPendingObjectiveRange:
        (from: number, to: number) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(pendingObjectiveKey, { from, to });
          }
          return true;
        },
      clearPendingObjectiveRange:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(pendingObjectiveKey, { from: null, to: null });
          }
          return true;
        },
      highlightObjective:
        (objectiveId: string | null) =>
        ({ view }) => {
          // Remove previous active highlights
          const prev = view.dom.querySelectorAll(".wp-objective-active");
          prev.forEach((el) => el.classList.remove("wp-objective-active"));
          if (objectiveId) {
            const marks = view.dom.querySelectorAll(
              `span[data-objective-id="${objectiveId}"]`,
            );
            marks.forEach((el) => el.classList.add("wp-objective-active"));
            // Scroll first mark into view
            if (marks.length > 0) {
              marks[0].scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const { onObjectiveClicked } = this.options;
    return [
      // Pending objective highlight decoration plugin
      new Plugin({
        key: pendingObjectiveKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet) {
            const meta = tr.getMeta(pendingObjectiveKey) as
              | { from: number | null; to: number | null }
              | undefined;
            if (meta) {
              if (meta.from != null && meta.to != null) {
                const deco = Decoration.inline(meta.from, meta.to, {
                  class: "wp-objective-pending",
                });
                return DecorationSet.create(tr.doc, [deco]);
              }
              return DecorationSet.empty;
            }
            // Map existing decorations through document changes
            return oldSet.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
      // Click handler for objective marks
      new Plugin({
        key: new PluginKey("objectiveMarkClick"),
        props: {
          handleClick(view, pos) {
            const resolved = view.state.doc.resolve(pos);
            const marks = resolved.marks();
            const objectiveMark = marks.find((m) => m.type.name === "objective");
            if (objectiveMark) {
              const objectiveId = objectiveMark.attrs.objectiveId as string;
              onObjectiveClicked(objectiveId);
              return true;
            }
            return false;
          },
        },
      }),
    ];
  },

  onSelectionUpdate() {
    const { $from } = this.editor.state.selection;
    const marks = $from.marks();
    const objectiveMark = marks.find((m) => m.type.name === "objective");
    this.options.onObjectiveActivated(
      objectiveMark ? (objectiveMark.attrs.objectiveId as string) : null,
    );
  },
});
