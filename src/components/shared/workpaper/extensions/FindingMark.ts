import { Mark, mergeAttributes } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface FindingMarkOptions {
  HTMLAttributes: Record<string, unknown>;
  onFindingActivated: (findingId: string | null) => void;
  onFindingClicked: (findingId: string) => void;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    findingMark: {
      setFindingMark: (findingId: string) => ReturnType;
      unsetFindingMark: (findingId: string) => ReturnType;
      highlightFinding: (findingId: string | null) => ReturnType;
      setPendingFindingRange: (from: number, to: number) => ReturnType;
      clearPendingFindingRange: () => ReturnType;
    };
  }
}

const pendingFindingKey = new PluginKey("pendingFindingHighlight");

export const FindingMark = Mark.create<FindingMarkOptions>({
  name: "finding",

  // Allow coexistence with CommentMark and other marks
  excludes: "",

  addOptions() {
    return {
      HTMLAttributes: {},
      onFindingActivated: () => {},
      onFindingClicked: () => {},
    };
  },

  addAttributes() {
    return {
      findingId: {
        default: null,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute("data-finding-id"),
        renderHTML: (attrs) => ({
          "data-finding-id": attrs.findingId as string,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-finding-id]",
        getAttrs: (el) =>
          !!(el as HTMLSpanElement).getAttribute("data-finding-id")?.trim() && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "wp-finding-mark",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setFindingMark:
        (findingId: string) =>
        ({ commands }) =>
          commands.setMark("finding", { findingId }),
      unsetFindingMark:
        (findingId: string) =>
        ({ tr, dispatch }) => {
          if (!dispatch) return true;
          const { doc } = tr;
          doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (
                mark.type.name === "finding" &&
                mark.attrs.findingId === findingId
              ) {
                tr.removeMark(pos, pos + node.nodeSize, mark);
              }
            });
          });
          return true;
        },
      setPendingFindingRange:
        (from: number, to: number) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(pendingFindingKey, { from, to });
          }
          return true;
        },
      clearPendingFindingRange:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(pendingFindingKey, { from: null, to: null });
          }
          return true;
        },
      highlightFinding:
        (findingId: string | null) =>
        ({ view }) => {
          // Remove previous active highlights
          const prev = view.dom.querySelectorAll(".wp-finding-active");
          prev.forEach((el) => el.classList.remove("wp-finding-active"));
          if (findingId) {
            const marks = view.dom.querySelectorAll(
              `span[data-finding-id="${findingId}"]`,
            );
            marks.forEach((el) => el.classList.add("wp-finding-active"));
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
    const { onFindingClicked } = this.options;
    return [
      // Pending finding highlight decoration plugin
      new Plugin({
        key: pendingFindingKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet) {
            const meta = tr.getMeta(pendingFindingKey) as
              | { from: number | null; to: number | null }
              | undefined;
            if (meta) {
              if (meta.from != null && meta.to != null) {
                const deco = Decoration.inline(meta.from, meta.to, {
                  class: "wp-finding-pending",
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
      // Click handler for finding marks
      new Plugin({
        key: new PluginKey("findingMarkClick"),
        props: {
          handleClick(view, pos) {
            const resolved = view.state.doc.resolve(pos);
            const marks = resolved.marks();
            const findingMark = marks.find((m) => m.type.name === "finding");
            if (findingMark) {
              const findingId = findingMark.attrs.findingId as string;
              onFindingClicked(findingId);
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
    const findingMark = marks.find((m) => m.type.name === "finding");
    this.options.onFindingActivated(
      findingMark ? (findingMark.attrs.findingId as string) : null,
    );
  },
});
