"use client";

import { useActionState, useEffect, useOptimistic } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

type EnrollState = {
  status: "idle" | "success" | "error";
  message?: string;
};

interface EnrollActionFormProps {
  action: (prevState: EnrollState, formData: FormData) => Promise<EnrollState>;
  courseId: string;
}

export function EnrollActionForm({ action, courseId }: EnrollActionFormProps) {
  const router = useRouter();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic<EnrollState["status"], EnrollState["status"]>(
    "idle",
    (_state, next) => next,
  );
  const [state, formAction, pending] = useActionState(action, { status: "idle" } as EnrollState);

  useEffect(() => {
    if (pending) {
      setOptimisticStatus("success"); // Optimista: asumimos éxito mientras responde
    }
  }, [pending, setOptimisticStatus]);

  useEffect(() => {
    if (state.status === "success") {
      router.push("/dashboard/my-courses");
    }
  }, [state.status, router]);

  const displayStatus = state.status === "idle" ? optimisticStatus : state.status;

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <input type="hidden" name="courseId" value={courseId} />
      <div className="text-sm text-muted-foreground">
        Accede al curso y comienza a aprender de inmediato.
      </div>
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={pending || displayStatus === "success"}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {displayStatus === "success" && <CheckCircle2 className="mr-2 h-4 w-4" />}
          {displayStatus === "success"
            ? "Inscrito"
            : pending
              ? "Inscribiendo..."
              : "Inscribirme"}
        </Button>
        {state.status === "error" && (
          <p className="text-xs text-destructive">{state.message || "No pudimos inscribirte, intenta de nuevo."}</p>
        )}
      </div>
    </form>
  );
}
