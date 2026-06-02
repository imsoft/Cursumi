"use client";

/**
 * Renders HTML content from the RichTextEditor (or plain text fallback).
 * Uses dangerouslySetInnerHTML — safe because content is authored by instructors,
 * not user-generated from untrusted sources.
 */

interface RichTextRendererProps {
  content: string | null | undefined;
  className?: string;
}

// Re-export from utils so existing client imports keep working
export { stripHtml } from "@/lib/utils";

export function RichTextRenderer({ content, className = "" }: RichTextRendererProps) {
  if (!content) return null;

  // If content contains HTML tags, render as HTML
  if (content.includes("<")) {
    return (
      <div
        className={`rich-text-content ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
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
