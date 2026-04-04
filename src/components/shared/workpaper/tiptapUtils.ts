import type { JSONContent } from "@tiptap/react";

/**
 * Convert a plain text string into a minimal TipTap JSONContent document.
 * Used as fallback content when workpaperContent is null (e.g. new risk/control).
 */
export function textToDoc(text: string): JSONContent {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text.trim()
          ? [{ type: "text", text: text.trim() }]
          : [],
      },
    ],
  };
}
