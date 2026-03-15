// ══════════════════════════════════════════════════
// CODEMIRROR BUNDLE — Single entry point
// Built with: npx esbuild src/editor/cm-bundle.js --bundle --format=iife --global-name=CM --outfile=src/editor/cm.js
// ══════════════════════════════════════════════════

// Core
export {EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter,
  drawSelection, dropCursor, rectangularSelection, crosshairCursor,
  highlightSpecialChars} from "@codemirror/view";
export {EditorState, Compartment} from "@codemirror/state";
export {defaultKeymap, history, historyKeymap, indentWithTab} from "@codemirror/commands";
export {syntaxHighlighting, defaultHighlightStyle, indentOnInput,
  bracketMatching, foldGutter, foldKeymap, HighlightStyle} from "@codemirror/language";
export {tags} from "@lezer/highlight";
export {searchKeymap, highlightSelectionMatches} from "@codemirror/search";
export {autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap} from "@codemirror/autocomplete";

// Languages
export {javascript} from "@codemirror/lang-javascript";
export {html} from "@codemirror/lang-html";
export {css} from "@codemirror/lang-css";
export {json} from "@codemirror/lang-json";
export {markdown} from "@codemirror/lang-markdown";
export {python} from "@codemirror/lang-python";
export {xml} from "@codemirror/lang-xml";
export {sql} from "@codemirror/lang-sql";
export {php} from "@codemirror/lang-php";
