"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserMinus } from "lucide-react";

interface UnenrollButtonProps {
  courseId: string;
  enrollmentId: string;
  studentName: string;
}

export function UnenrollButton({ courseId, enrollmentId, studentName }: UnenrollButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removed, setRemoved] = useState(false);

  const handleUnenroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/students`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al dar de baja");
        return;
      }
      setRemoved(true);
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (removed) {
    return (
      <span className="text-xs text-muted-foreground italic">Dado de baja</span>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-destructive">¿Dar de baja a {studentName}?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleUnenroll}
          disabled={loading}
        >
          {loading ? "..." : "Sí"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={() => setConfirming(true)}
    >
      <UserMinus className="mr-1.5 h-3.5 w-3.5" />
      Dar de baja
    </Button>
  );
}
