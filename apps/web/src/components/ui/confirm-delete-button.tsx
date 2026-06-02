"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteButtonProps {
  onConfirm: () => void;
  title?: string;
  message: string;
  disabled?: boolean;
}

export function ConfirmDeleteButton({
  onConfirm,
  title = "¿Estás seguro?",
  message,
  disabled,
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold text-foreground">{title}</h2>
            <p className="mb-6 text-sm text-muted-foreground">{message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  onConfirm();
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
