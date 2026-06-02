"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CourseError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="text-2xl font-semibold text-foreground">
            Error al cargar la pagina
          </h2>
          <p className="text-muted-foreground">
            Ocurrio un error inesperado. Intenta de nuevo o regresa a tus cursos.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/instructor/courses">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Mis cursos
              </Link>
            </Button>
            <Button onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
