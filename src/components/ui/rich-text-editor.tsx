"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Escribe aquí...",
  className = "",
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const formatText = (command: string) => {
    execCommand(command);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Barra de herramientas */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("bold")}
          className="h-8 w-8 p-0"
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("italic")}
          className="h-8 w-8 p-0"
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("underline")}
          className="h-8 w-8 p-0"
          title="Subrayado"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("insertUnorderedList")}
          className="h-8 w-8 p-0"
          title="Lista con viñetas"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("insertOrderedList")}
          className="h-8 w-8 p-0"
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Ingresa la URL:");
            if (url) {
              execCommand("createLink", url);
            }
          }}
          className="h-8 w-8 p-0"
          title="Insertar enlace"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] rounded-lg border border-border bg-background p-4 text-foreground focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
        style={{
          outline: "none",
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

