"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  sender: { name: string | null };
}

interface Conversation {
  id: string;
  studentId: string;
  student: { name: string | null };
  messages: { body: string; createdAt: string | Date }[];
}

interface InstructorChatClientProps {
  courseId: string;
  courseTitle: string;
  conversations: Conversation[];
  currentUserId: string;
}

export function InstructorChatClient({
  courseId,
  courseTitle,
  conversations,
  currentUserId,
}: InstructorChatClientProps) {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!selectedConvId) return;
    try {
      const res = await fetch(`/api/conversations/${selectedConvId}/messages`);
      if (res.ok) setMessages(await res.json());
    } catch {
      // ignore poll errors
    }
  }, [selectedConvId]);

  useEffect(() => {
    setMessages([]);
    loadMessages();
    const interval = setInterval(loadMessages, 20_000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  // Mark messages as read once when switching conversations
  useEffect(() => {
    if (!selectedConvId) return;
    fetch(`/api/conversations/${selectedConvId}/read`, { method: "PATCH" }).catch(() => {});
  }, [selectedConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedConvId) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/conversations/${selectedConvId}/messages`, {
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

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/instructor/courses/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Mensajes</h1>
          <p className="text-sm text-muted-foreground truncate max-w-xs">
            {courseTitle} · Conversaciones con alumnos
          </p>
        </div>
      </div>

      <div className="flex rounded-xl border border-border overflow-hidden" style={{ height: "calc(100vh - 12rem)" }}>
        {/* Conversation list */}
        <div className="w-64 shrink-0 border-r border-border flex flex-col bg-card">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">Estudiantes</p>
            <p className="text-xs text-muted-foreground">{conversations.length} conversaciones</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground">Aún no hay conversaciones</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const lastMsg = conv.messages[0];
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border transition-colors hover:bg-muted/50 ${
                      selectedConvId === conv.id ? "bg-muted" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {conv.student.name || "Estudiante"}
                    </p>
                    {lastMsg && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {lastMsg.body}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Elige un alumno para ver la conversación</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="border-b border-border px-4 py-3 bg-card">
                <p className="font-semibold text-foreground">
                  {selectedConv.student.name || "Estudiante"}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-4">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Aún no hay mensajes. Escribe algo para iniciar.
                  </p>
                )}
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {!isMe && (
                          <p className="mb-0.5 text-[10px] font-semibold text-muted-foreground">
                            {msg.sender.name || "Estudiante"}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
