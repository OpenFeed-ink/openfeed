import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes rich-text HTML produced by the Tiptap editor (changelog content, etc.)
 * before it's persisted. This content is later rendered on public /pub pages via
 * dangerouslySetInnerHTML, so anything that survives this pass is effectively
 * trusted to run in every visitor's browser — keep the allowlist tight.
 */
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "mark",
    "h1", "h2", "h3", "h4",
    "ul", "ol", "li",
    "blockquote", "code", "pre",
    "a", "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height"],
    p: ["style"],
    h1: ["style"],
    h2: ["style"],
    h3: ["style"],
    h4: ["style"],
  },
  allowedStyles: {
    "*": {
      // Only the alignment Tiptap's TextAlign extension emits — nothing else.
      "text-align": [/^(left|center|right|justify)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, sanitizeOptions);
}
