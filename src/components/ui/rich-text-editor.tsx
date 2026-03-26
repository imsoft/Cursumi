"use client";

import { useEffect, useCallback, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_NORMAL,
  KEY_ENTER_COMMAND,
  type EditorState,
  type LexicalEditor,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $isHeadingNode } from "@lexical/rich-text";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  $isListNode,
} from "@lexical/list";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Pilcrow,
} from "lucide-react";

// ── Toolbar ──────────────────────────────────────────────────────────────────

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      setIsBold(selection.hasFormat("bold"));
      const anchor = selection.anchor.getNode();
      const parent = anchor.getParent();
      if ($isHeadingNode(anchor)) {
        setBlockType(anchor.getTag());
      } else if (parent && $isHeadingNode(parent)) {
        setBlockType(parent.getTag());
      } else if ($isListNode(anchor) || (parent && $isListNode(parent))) {
        // walk up to find list node
        const listNode = $isListNode(anchor) ? anchor : parent;
        if (listNode && $isListNode(listNode)) {
          setBlockType(listNode.getListType() === "bullet" ? "ul" : "ol");
        }
      } else {
        setBlockType("paragraph");
      }
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => updateToolbar());
    });
  }, [editor, updateToolbar]);

  const formatHeading = (tag: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (blockType === tag) {
        $setBlocksType(selection, () => $createParagraphNode());
      } else {
        $setBlocksType(selection, () => $createHeadingNode(tag));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => $createParagraphNode());
    });
  };

  const btnClass = (active: boolean) =>
    `h-8 w-8 p-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
      active
        ? "bg-primary/15 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-1 flex-wrap">
      <button type="button" className={btnClass(isBold)} title="Negrita (Ctrl+B)" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
        <Bold className="h-4 w-4" />
      </button>
      <div className="h-5 w-px bg-border mx-0.5" />
      <button type="button" className={btnClass(blockType === "paragraph")} title="Párrafo" onClick={formatParagraph}>
        <Pilcrow className="h-4 w-4" />
      </button>
      <button type="button" className={btnClass(blockType === "h1")} title="Título 1" onClick={() => formatHeading("h1")}>
        <Heading1 className="h-4 w-4" />
      </button>
      <button type="button" className={btnClass(blockType === "h2")} title="Título 2" onClick={() => formatHeading("h2")}>
        <Heading2 className="h-4 w-4" />
      </button>
      <button type="button" className={btnClass(blockType === "h3")} title="Título 3" onClick={() => formatHeading("h3")}>
        <Heading3 className="h-4 w-4" />
      </button>
      <div className="h-5 w-px bg-border mx-0.5" />
      <button type="button" className={btnClass(blockType === "ul")} title="Lista con viñetas" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}>
        <List className="h-4 w-4" />
      </button>
      <button type="button" className={btnClass(blockType === "ol")} title="Lista numerada" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}>
        <ListOrdered className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Soft line break (Shift+Enter) ────────────────────────────────────────────

function SoftBreakPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        if (event && event.shiftKey) {
          event.preventDefault();
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertLineBreak();
            }
          });
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [editor]);

  return null;
}

// ── Load initial HTML content ────────────────────────────────────────────────

function InitialContentPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || !html) return;
    setLoaded(true);

    editor.update(() => {
      const root = $getRoot();
      // If content looks like HTML (has tags), parse it
      if (html.includes("<")) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        root.clear();
        nodes.forEach((node) => root.append(node));
      } else {
        // Plain text — split by newlines into paragraphs
        root.clear();
        const lines = html.split("\n");
        for (const line of lines) {
          const p = $createParagraphNode();
          if (line.trim()) {
            p.append($createTextNode(line));
          }
          root.append(p);
        }
      }
    });
  }, [editor, html, loaded]);

  return null;
}

// ── Main component ───────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const theme = {
  heading: {
    h1: "text-2xl font-bold",
    h2: "text-xl font-semibold",
    h3: "text-lg font-semibold",
  },
  text: {
    bold: "font-bold",
  },
  list: {
    ul: "list-disc ml-6",
    ol: "list-decimal ml-6",
    listitem: "",
  },
  paragraph: "",
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Escribe aquí…",
  className = "",
  minHeight = "150px",
}: RichTextEditorProps) {
  const handleChange = useCallback(
    (_editorState: EditorState, editor: LexicalEditor) => {
      editor.read(() => {
        const html = $generateHtmlFromNodes(editor);
        // Don't emit if it's just an empty paragraph
        const isEmpty = html === "<p><br></p>" || html === "<p></p>";
        onChange(isEmpty ? "" : html);
      });
    },
    [onChange],
  );

  const initialConfig = {
    namespace: "RichTextEditor",
    theme,
    nodes: [HeadingNode, ListNode, ListItemNode],
    onError: (error: Error) => console.error("[RichTextEditor]", error),
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="relative rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="px-4 py-3 text-sm text-foreground outline-none"
                style={{ minHeight }}
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-4 top-3 text-sm text-muted-foreground">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <SoftBreakPlugin />
        <OnChangePlugin onChange={handleChange} />
        <InitialContentPlugin html={value} />
      </LexicalComposer>
    </div>
  );
}
