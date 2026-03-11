"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPostgresVersion, createTestTable, insertComment, getComments } from "@/app/actions/db-actions";

export function TestDbForm() {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [comments, setComments] = useState<Array<{ id: number; comment: string; created_at: string }>>([]);

  const handleGetVersion = async () => {
    setLoading(true);
    setResult("");
    try {
      const response = await getPostgresVersion();
      if (response.success) {
        setResult(`✅ Versión: ${response.version}`);
      } else {
        setResult(`❌ Error: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async () => {
    setLoading(true);
    setResult("");
    try {
      const response = await createTestTable();
      if (response.success) {
        setResult(`✅ ${response.message}`);
      } else {
        setResult(`❌ Error: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setLoading(true);
    setResult("");
    try {
      const response = await insertComment(comment);
      if (response.success) {
        setResult(`✅ Comentario insertado: ID ${response.data?.id}`);
        setComment("");
        // Refrescar lista de comentarios
        await handleGetComments();
      } else {
        setResult(`❌ Error: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetComments = async () => {
    setLoading(true);
    try {
      const response = await getComments();
      if (response.success) {
        setComments((response.data || []) as { id: number; comment: string; created_at: string; }[]);
      } else {
        setResult(`❌ Error al obtener comentarios: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Server Actions de prueba</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleGetVersion} 
              disabled={loading}
              variant="outline"
            >
              Obtener versión PostgreSQL
            </Button>
            <Button 
              onClick={handleCreateTable} 
              disabled={loading}
              variant="outline"
            >
              Crear tabla de prueba
            </Button>
            <Button 
              onClick={handleGetComments} 
              disabled={loading}
              variant="outline"
            >
              Obtener comentarios
            </Button>
          </div>

          {result && (
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-sm font-mono">{result}</p>
            </div>
          )}

          <form onSubmit={handleInsertComment} className="space-y-2">
            <Input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !comment.trim()}>
              Insertar comentario
            </Button>
          </form>

          {comments.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Comentarios:</h3>
              <div className="space-y-2">
                {comments.map((c) => (
                  <div 
                    key={c.id} 
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <p className="text-sm text-foreground">{c.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(c.created_at).toLocaleString("es-MX")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

