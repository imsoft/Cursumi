"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Send } from "lucide-react";

interface Message {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  sender: { name: string | null };
}

interface CourseChatClientProps {
  courseId: string;
  courseTitle: string;
  conversationId: string | null;
  currentUserId: string;
}

export function CourseChatClient({
  courseId,
  courseTitle,
  conversationId: initialConversationId,
  currentUserId,
}: CourseChatClientProps) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const initConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    const res = await fetch(`/api/conversations?courseId=${courseId}`);
    if (!res.ok) throw new Error("No se pudo abrir la conversación");
    const data = await res.json();
    setConversationId(data.id);
    return data.id as string;
  }, [conversationId, courseId]);

  const loadMessages = useCallback(async () => {
    try {
      const cId = conversationId ?? (await initConversation());
      const res = await fetch(`/api/conversations/${cId}/messages`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
      }
    } catch {
      // ignore poll errors
    }
  }, [conversationId, initConversation]);

  // Initial load + polling every 20s
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 20_000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // Mark messages as read once when conversation is opened
  useEffect(() => {
    if (!conversationId) return;
    fetch(`/api/conversations/${conversationId}/read`, { method: "PATCH" }).catch(() => {});
  }, [conversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    setError(null);
    try {
      const cId = conversationId ?? (await initConversation());
      const res = await fetch(`/api/conversations/${cId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() }),
      });
      if (!res.ok) throw new Error("Error al enviar mensaje");
      const msg: Message = await res.json();
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Link
          href={`/dashboard/my-courses/${courseId}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-sm font-semibold text-foreground">Instructor</p>
          <p className="text-xs text-muted-foreground truncate max-w-48">{courseTitle}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hay mensajes aún. ¡Inicia la conversación!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {!isMe && (
                  <p className="mb-0.5 text-[10px] font-semibold text-muted-foreground">
                    {msg.sender.name || "Instructor"}
                  </p>
                )}
                <p className="wrap-break-word">{msg.body}</p>
                <p className={`mt-0.5 text-[10px] ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card p-3">
        {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
