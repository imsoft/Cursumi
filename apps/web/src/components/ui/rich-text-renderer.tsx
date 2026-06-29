"use client";

import { sanitizeHtml } from "@/lib/sanitize";

/**
 * Renders HTML content from the RichTextEditor (or plain text fallback).
 * El HTML se sanitiza con DOMPurify antes de inyectarlo: el contenido lo escriben
 * instructores (usuarios semi-confiables), así que se trata como NO confiable
 * para prevenir XSS almacenado. Ver `@/lib/sanitize`.
 */

interface RichTextRendererProps {
  content: string | null | undefined;
  className?: string;
}

// Re-export from utils so existing client imports keep working
export { stripHtml } from "@/lib/utils";

export function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  if (!content) return null;

  // If content contains HTML tags, render as sanitized HTML
  if (content.includes("<")) {
    return (
      <div
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }

  // Plain text fallback — preserve line breaks
  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {content}
    </p>
  );
}
