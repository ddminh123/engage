import { Mark, mergeAttributes } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface CommentMarkOptions {
  HTMLAttributes: Record<string, unknown>;
  onCommentActivated: (threadId: string | null) => void;
  onCommentClicked: (threadId: string) => void;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    commentMark: {
      setComment: (threadId: string, threadType?: string) => ReturnType;
      unsetComment: (threadId: string) => ReturnType;
      highlightThread: (threadId: string | null) => ReturnType;
      setPendingCommentRange: (from: number, to: number) => ReturnType;
      clearPendingCommentRange: () => ReturnType;
    };
  }
}

const pendingCommentKey = new PluginKey("pendingCommentHighlight");

export const CommentMark = Mark.create<CommentMarkOptions>({
  name: "comment",

  addOptions() {
    return {
      HTMLAttributes: {},
      onCommentActivated: () => {},
      onCommentClicked: () => {},
    };
  },

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute("data-thread-id"),
        renderHTML: (attrs) => ({
          "data-thread-id": attrs.threadId as string,
        }),
      },
      threadType: {
        default: "comment",
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute("data-thread-type") ?? "comment",
        renderHTML: (attrs) => ({
          "data-thread-type": (attrs.threadType as string) ?? "comment",
        }),
      },
      resolved: {
        default: false,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute("data-resolved") === "true",
        renderHTML: (attrs) => ({
          "data-resolved": String(attrs.resolved),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-thread-id]",
        getAttrs: (el) =>
          !!(el as HTMLSpanElement).getAttribute("data-thread-id")?.trim() && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "wp-comment-mark",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setComment:
        (threadId: string, threadType?: string) =>
        ({ commands }) =>
          commands.setMark("comment", { threadId, threadType: threadType ?? "comment" }),
      unsetComment:
        (threadId: string) =>
        ({ tr, dispatch }) => {
          if (!dispatch) return true;
          const { doc } = tr;
          doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (
                mark.type.name === "comment" &&
                mark.attrs.threadId === threadId
              ) {
                tr.removeMark(pos, pos + node.nodeSize, mark);
              }
            });
          });
          return true;
        },
      setPendingCommentRange:
        (from: number, to: number) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(pendingCommentKey, { from, to });
          }
          return true;
        },
      clearPendingCommentRange:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta(pendingCommentKey, { from: null, to: null });
          }
          return true;
        },
      highlightThread:
        (threadId: string | null) =>
        ({ view }) => {
          // Remove previous active highlights
          const prev = view.dom.querySelectorAll(".wp-comment-active");
          prev.forEach((el) => el.classList.remove("wp-comment-active"));
          if (threadId) {
            const marks = view.dom.querySelectorAll(
              `span[data-thread-id="${threadId}"]`,
            );
            marks.forEach((el) => el.classList.add("wp-comment-active"));
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
    const { onCommentClicked } = this.options;
    return [
      // Pending comment highlight decoration plugin
      new Plugin({
        key: pendingCommentKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet) {
            const meta = tr.getMeta(pendingCommentKey) as
              | { from: number | null; to: number | null }
              | undefined;
            if (meta) {
              if (meta.from != null && meta.to != null) {
                const deco = Decoration.inline(meta.from, meta.to, {
                  class: "wp-comment-pending",
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
      new Plugin({
        key: new PluginKey("commentMarkClick"),
        props: {
          handleClick(view, pos) {
            const resolved = view.state.doc.resolve(pos);
            const marks = resolved.marks();
            const commentMark = marks.find((m) => m.type.name === "comment");
            if (commentMark) {
              const threadId = commentMark.attrs.threadId as string;
              onCommentClicked(threadId);
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
    const commentMark = marks.find((m) => m.type.name === "comment");
    this.options.onCommentActivated(
      commentMark ? (commentMark.attrs.threadId as string) : null,
    );
  },
});
